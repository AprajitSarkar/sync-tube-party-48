
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
import { ArrowLeft } from 'lucide-react';
import { CustomButton } from '@/components/ui/custom-button';
import PageTransition from '@/components/common/PageTransition';

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
          isPlaying: false,
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <header className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <CustomButton
                variant="ghost"
                size="icon"
                onClick={() => navigate('/home')}
              >
                <ArrowLeft size={18} />
              </CustomButton>
              <div>
                <h1 className="text-xl font-bold">{room?.name}</h1>
                <p className="text-xs text-muted-foreground">Room ID: {roomId}</p>
              </div>
            </div>
          </header>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <VideoPlayer 
                roomId={roomId || ''} 
                userId={user?.id || ''}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>
      </div>
    </PageTransition>
  );
};

export default Room;
