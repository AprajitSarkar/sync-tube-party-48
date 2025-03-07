
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
import { ArrowLeft, Share2, Search, X, Play, ListPlus } from 'lucide-react';
import { CustomButton } from '@/components/ui/custom-button';
import PageTransition from '@/components/common/PageTransition';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import LogToast from '@/components/common/LogToast';

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

interface SearchResult {
  id: string;
  title: string;
}

const Room = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState<RoomDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentVideoId, setCurrentVideoId] = useState('');
  const isMobile = useIsMobile();
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [logMessage, setLogMessage] = useState('');
  const [logVisible, setLogVisible] = useState(false);

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
    showLog(`Playing video...`);
    
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

  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
    if (searchVisible) {
      setSearchResults([]);
      setSearchQuery('');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Using the YouTube search method
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
      const response = await fetch(searchUrl);
      const html = await response.text();
      
      // Extract video IDs from search results
      const videoPattern = /\/watch\?v=([\w-]{11})/g;
      const matches = html.matchAll(videoPattern);
      const uniqueIds = [...new Set([...matches].map(match => match[1]))].slice(0, 5);
      
      // Get video titles
      const results = await Promise.all(uniqueIds.map(async (id) => {
        try {
          const response = await fetch(`https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=${id}&format=json`);
          const data = await response.json();
          return {
            id,
            title: data.title || 'Untitled Video'
          };
        } catch (error) {
          return {
            id,
            title: 'Untitled Video'
          };
        }
      }));
      
      setSearchResults(results);
      showLog(`Found ${results.length} videos`);
    } catch (error) {
      console.error('Error searching videos:', error);
      showLog('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const addToPlaylist = async (videoId: string, title: string) => {
    if (!roomId || !user) return;
    
    try {
      showLog('Adding to playlist...');
      
      // Get the max position
      const { data: playlistData } = await supabase
        .from('playlist_items')
        .select('position')
        .eq('room_id', roomId)
        .order('position', { ascending: false })
        .limit(1);
      
      const maxPosition = playlistData && playlistData.length > 0 ? playlistData[0].position : -1;
      
      const { error } = await supabase
        .from('playlist_items')
        .insert({
          room_id: roomId,
          video_id: videoId,
          title,
          position: maxPosition + 1,
          added_by: user.id
        });

      if (error) throw error;
      
      showLog('Added to playlist');
    } catch (error) {
      console.error('Error adding to playlist:', error);
      showLog('Failed to add to playlist');
    }
  };

  const showLog = (message: string) => {
    setLogMessage(message);
    setLogVisible(true);
  };

  const hideLog = () => {
    setLogVisible(false);
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
      <div className="min-h-screen bg-background flex flex-col overflow-hidden">
        {/* Log Toast */}
        <LogToast 
          message={logMessage} 
          visible={logVisible} 
          onHide={hideLog} 
          duration={1000}
        />
        
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
              onClick={toggleSearch}
              className="h-8 w-8"
              title="Search"
            >
              {searchVisible ? <X size={18} /> : <Search size={18} />}
            </CustomButton>
          </div>
        </header>
        
        {/* Search Bar */}
        <AnimatePresence>
          {searchVisible && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full overflow-hidden"
            >
              <div className="bg-[#1E0F38] p-4 border-b border-white/10">
                <div className="flex gap-2 items-center">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search YouTube videos..."
                    className="h-10 bg-white/5 border-white/10"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    autoFocus
                  />
                  <CustomButton
                    variant="glow"
                    size="sm"
                    onClick={handleSearch}
                    isLoading={isSearching}
                  >
                    Search
                  </CustomButton>
                </div>
                
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 space-y-2 max-h-60 overflow-y-auto"
                  >
                    {searchResults.map((result) => (
                      <div 
                        key={result.id}
                        className="bg-black/20 backdrop-blur-sm rounded-md p-2 flex items-center gap-2"
                      >
                        <img 
                          src={`https://i.ytimg.com/vi/${result.id}/default.jpg`}
                          alt={result.title}
                          className="w-16 h-12 object-cover rounded"
                        />
                        <div className="flex-1 truncate">
                          <p className="text-sm font-medium truncate text-white">{result.title}</p>
                        </div>
                        <div className="flex gap-1">
                          <CustomButton
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-white hover:bg-white/10"
                            onClick={() => handlePlayVideo(result.id)}
                            title="Play Now"
                          >
                            <Play size={16} className="fill-white/20" />
                          </CustomButton>
                          <CustomButton
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-white hover:bg-white/10"
                            onClick={() => addToPlaylist(result.id, result.title)}
                            title="Add to Playlist"
                          >
                            <ListPlus size={16} />
                          </CustomButton>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
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
              <TabsList className="grid grid-cols-3 bg-[#1E0F38] border-t border-b border-white/10">
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
