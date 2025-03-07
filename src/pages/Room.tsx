
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import VideoPlayer from '@/components/room/VideoPlayer';
import ChatPanel from '@/components/room/ChatPanel';
import RoomParticipants from '@/components/room/RoomParticipants';
import PlaylistPanel from '@/components/room/PlaylistPanel';
import { ArrowLeft, Share2, Search } from 'lucide-react';
import { CustomButton } from '@/components/ui/custom-button';
import PageTransition from '@/components/common/PageTransition';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMobile } from '@/hooks/use-mobile';

interface RoomDetails {
  id: string;
  name: string;
  created_by: string;
  video_state: {
    videoId: string;
    isPlaying: boolean;
    currentTime: number;
    timestamp: number;
  };
}

const Room = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState<RoomDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentVideoId, setCurrentVideoId] = useState('');
  const isMobile = useMobile();

  useEffect(() => {
    if (!user || !roomId) {
      navigate('/home');
      return;
    }

    fetchRoomDetails();
    
    // Presence update - record that user is in this room
    updatePresence();
    const presenceInterval = setInterval(updatePresence, 30000);
    
    // Subscribe to room updates
    const roomSubscription = supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'video_rooms',
        filter: `id=eq.${roomId}`,
      }, (payload) => {
        const updatedRoom = payload.new as RoomDetails;
        setRoom(updatedRoom);
        if (updatedRoom.video_state?.videoId) {
          setCurrentVideoId(updatedRoom.video_state.videoId);
        }
      })
      .subscribe();
      
    return () => {
      clearInterval(presenceInterval);
      roomSubscription.unsubscribe();
      
      // When user leaves, clean up presence and check if room is empty
      cleanupPresence();
    };
  }, [roomId, user, navigate]);

  const fetchRoomDetails = async () => {
    if (!roomId) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('video_rooms')
        .select('*')
        .eq('id', roomId)
        .single();
        
      if (error) throw error;
      
      setRoom(data);
      if (data.video_state?.videoId) {
        setCurrentVideoId(data.video_state.videoId);
      }
    } catch (error) {
      console.error('Error fetching room details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load room. Room may not exist.',
        variant: 'destructive'
      });
      navigate('/home');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePresence = async () => {
    if (!roomId || !user) return;
    
    try {
      await supabase
        .from('room_participants')
        .upsert({
          room_id: roomId,
          user_id: user.id,
          last_active: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  };
  
  const cleanupPresence = async () => {
    if (!roomId || !user) return;
    
    try {
      // Remove user from participants
      await supabase
        .from('room_participants')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', user.id);
        
      // Check if the room is now empty
      const { data, error } = await supabase
        .from('room_participants')
        .select('id')
        .eq('room_id', roomId);
        
      if (error) throw error;
      
      // If room is empty, delete it to save storage
      if (data && data.length === 0) {
        await supabase
          .from('video_rooms')
          .delete()
          .eq('id', roomId);
      }
    } catch (error) {
      console.error('Error cleaning up presence:', error);
    }
  };

  const handlePlayVideo = (videoId: string) => {
    if (!roomId) return;
    
    setCurrentVideoId(videoId);
    
    // Update room video state
    supabase
      .from('video_rooms')
      .update({
        video_state: {
          isPlaying: true, // Auto play when selecting from playlist
          timestamp: Date.now(),
          currentTime: 0,
          videoId: videoId
        }
      })
      .eq('id', roomId)
      .then(({ error }) => {
        if (error) {
          console.error('Error updating video state:', error);
        }
      });
  };

  const shareRoom = () => {
    const shareUrl = `${window.location.origin}/room/${roomId}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join my Watch Video room',
        text: 'Watch YouTube videos together!',
        url: shareUrl,
      }).catch(error => {
        console.error('Error sharing:', error);
        copyToClipboard(shareUrl);
      });
    } else {
      copyToClipboard(shareUrl);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Room link copied',
        description: 'Share this link with friends to invite them',
      });
    }).catch(err => {
      console.error('Failed to copy: ', err);
      toast({
        title: 'Failed to copy',
        description: 'Please manually copy the URL from your browser',
        variant: 'destructive'
      });
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="p-3 flex justify-between items-center border-b border-white/10">
          <div className="flex items-center gap-2">
            <CustomButton
              variant="ghost"
              size="icon"
              onClick={() => navigate('/home')}
              className="h-8 w-8"
            >
              <ArrowLeft size={18} />
            </CustomButton>
            <h1 className="text-lg font-bold truncate">
              {room?.name || 'Watch Video'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <CustomButton
              variant="ghost"
              size="icon"
              onClick={shareRoom}
              className="h-8 w-8"
              title="Share Room"
            >
              <Share2 size={18} />
            </CustomButton>
            <CustomButton
              variant="ghost"
              size="icon"
              onClick={() => navigate('/search')}
              className="h-8 w-8"
              title="Search"
            >
              <Search size={18} />
            </CustomButton>
          </div>
        </header>
        
        {/* Video Player */}
        <div className="w-full">
          <VideoPlayer 
            roomId={roomId || ''} 
            userId={user?.id || ''}
          />
        </div>
        
        {/* Mobile Tabs for Playlist, Chat, and Users */}
        {isMobile ? (
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="playlist" className="h-full flex flex-col">
              <TabsList className="grid grid-cols-3 bg-background border-t border-b border-white/10">
                <TabsTrigger value="playlist" className="text-sm font-medium">
                  Playlist
                </TabsTrigger>
                <TabsTrigger value="chat" className="text-sm font-medium">
                  Chat
                </TabsTrigger>
                <TabsTrigger value="users" className="text-sm font-medium">
                  Users
                </TabsTrigger>
              </TabsList>
              <TabsContent value="playlist" className="flex-1 overflow-hidden p-0 m-0">
                <div className="h-full">
                  <PlaylistPanel 
                    roomId={roomId || ''} 
                    currentVideoId={currentVideoId}
                    onPlayVideo={handlePlayVideo}
                  />
                </div>
              </TabsContent>
              <TabsContent value="chat" className="flex-1 overflow-hidden p-0 m-0">
                <div className="h-full">
                  <ChatPanel roomId={roomId || ''} />
                </div>
              </TabsContent>
              <TabsContent value="users" className="flex-1 overflow-hidden p-0 m-0">
                <div className="h-full">
                  <RoomParticipants 
                    roomId={roomId || ''} 
                    currentUserId={user?.id || ''}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          // Desktop Layout
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
            <div className="lg:col-span-3 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-[400px]">
                  <PlaylistPanel 
                    roomId={roomId || ''} 
                    currentVideoId={currentVideoId}
                    onPlayVideo={handlePlayVideo}
                  />
                </div>
                <div className="h-[400px]">
                  <ChatPanel roomId={roomId || ''} />
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <RoomParticipants 
                roomId={roomId || ''} 
                currentUserId={user?.id || ''}
              />
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default Room;
