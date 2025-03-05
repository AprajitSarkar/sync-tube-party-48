
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/ui/glass-card';
import { CustomButton } from '@/components/ui/custom-button';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Play, PlusCircle, Trash2, LogOut, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import PageTransition from '@/components/common/PageTransition';

interface Room {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
  last_accessed: string;
}

const Home = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [recentRooms, setRecentRooms] = useState<Room[]>([]);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');

  useEffect(() => {
    if (user) {
      fetchRecentRooms();
    }
  }, [user]);

  const fetchRecentRooms = async () => {
    try {
      setIsLoading(true);
      
      // Get rooms created by the user
      const { data: createdRooms, error: createdError } = await supabase
        .from('video_rooms')
        .select('*')
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false });
        
      if (createdError) throw createdError;
      
      // Get rooms participated in
      const { data: participatedRooms, error: participatedError } = await supabase
        .from('room_participants')
        .select('room_id, last_active')
        .eq('user_id', user?.id)
        .order('last_active', { ascending: false });
        
      if (participatedError) throw participatedError;
      
      // Get full room details for participated rooms
      const participatedRoomDetails = await Promise.all(
        (participatedRooms || []).map(async (participation) => {
          const { data, error } = await supabase
            .from('video_rooms')
            .select('*')
            .eq('id', participation.room_id)
            .single();
            
          if (error) return null;
          return {
            ...data,
            last_accessed: participation.last_active
          };
        })
      );
      
      // Combine, filter duplicates, and sort by last accessed
      const allRooms = [
        ...(createdRooms || []).map(room => ({
          ...room,
          last_accessed: room.created_at
        })),
        ...participatedRoomDetails.filter(Boolean)
      ];
      
      // Remove duplicates
      const uniqueRooms = allRooms.filter((room, index, self) =>
        index === self.findIndex((r) => r.id === room.id)
      );
      
      // Sort by last accessed
      const sortedRooms = uniqueRooms.sort((a, b) => 
        new Date(b.last_accessed).getTime() - new Date(a.last_accessed).getTime()
      );
      
      setRecentRooms(sortedRooms.slice(0, 10)); // Limit to 10 most recent
    } catch (error) {
      console.error('Error fetching recent rooms:', error);
      toast({
        title: 'Error',
        description: 'Failed to load recent rooms',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createRoom = async () => {
    if (!newRoomName.trim()) {
      toast({
        title: 'Room name required',
        description: 'Please enter a name for your room',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setIsCreatingRoom(true);
      
      // Create room
      const { data, error } = await supabase
        .from('video_rooms')
        .insert({
          name: newRoomName.trim(),
          created_by: user?.id,
          video_state: {
            isPlaying: false,
            timestamp: Date.now(),
            currentTime: 0,
            videoId: ''
          }
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Add creator as participant
      await supabase
        .from('room_participants')
        .insert({
          room_id: data.id,
          user_id: user?.id,
          last_active: new Date().toISOString()
        });
      
      // Navigate to the room
      navigate(`/room/${data.id}`);
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: 'Error',
        description: 'Failed to create room',
        variant: 'destructive'
      });
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const joinRoom = async () => {
    if (!joinRoomId.trim()) {
      toast({
        title: 'Room ID required',
        description: 'Please enter a room ID to join',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      // Check if room exists
      const { data, error } = await supabase
        .from('video_rooms')
        .select('id')
        .eq('id', joinRoomId.trim())
        .single();
        
      if (error) throw new Error('Room not found');
      
      // Add user as participant
      await supabase
        .from('room_participants')
        .upsert({
          room_id: data.id,
          user_id: user?.id,
          last_active: new Date().toISOString()
        });
      
      // Navigate to the room
      navigate(`/room/${data.id}`);
    } catch (error) {
      console.error('Error joining room:', error);
      toast({
        title: 'Error',
        description: 'Failed to join room. Please check the room ID.',
        variant: 'destructive'
      });
    }
  };

  const enterRoom = (roomId: string) => {
    navigate(`/room/${roomId}`);
  };

  const deleteRoom = async (roomId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    try {
      // Delete room
      const { error } = await supabase
        .from('video_rooms')
        .delete()
        .eq('id', roomId);
        
      if (error) throw error;
      
      // Update local state
      setRecentRooms(recentRooms.filter(room => room.id !== roomId));
      
      toast({
        title: 'Room Deleted',
        description: 'Room has been successfully deleted',
      });
    } catch (error) {
      console.error('Error deleting room:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete room',
        variant: 'destructive'
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <PageTransition>
      <div 
        className="min-h-screen bg-background p-4 sm:p-6"
        style={{
          backgroundImage: "radial-gradient(circle at center, rgba(59, 130, 246, 0.05) 0%, transparent 70%)"
        }}
      >
        <div className="max-w-4xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gradient">Sync Tube Party</h1>
              <p className="text-muted-foreground">Hello, {user?.email}</p>
            </div>
            <CustomButton 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
              icon={<LogOut size={16} />}
            >
              Sign Out
            </CustomButton>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <GlassCard>
              <h2 className="text-xl font-medium mb-4">Create Room</h2>
              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="Room name"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <CustomButton
                  variant="glow"
                  onClick={createRoom}
                  isLoading={isCreatingRoom}
                  icon={<PlusCircle size={18} />}
                >
                  Create Room
                </CustomButton>
              </div>
            </GlassCard>
            
            <GlassCard>
              <h2 className="text-xl font-medium mb-4">Join Room</h2>
              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="Room ID"
                    value={joinRoomId}
                    onChange={(e) => setJoinRoomId(e.target.value)}
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <CustomButton
                  variant="glow"
                  onClick={joinRoom}
                  icon={<ArrowRight size={18} />}
                >
                  Join Room
                </CustomButton>
              </div>
            </GlassCard>
          </div>
          
          <GlassCard>
            <h2 className="text-xl font-medium mb-4">Recent Rooms</h2>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : recentRooms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent rooms found</p>
                <p className="text-sm mt-2">Create a new room to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRooms.map((room, index) => (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => enterRoom(room.id)}
                    className="cursor-pointer"
                  >
                    <GlassCard 
                      className="p-4 hover:bg-white/10 transition-all duration-200"
                      intensity="light"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                            <Play size={18} className="text-accent ml-1" />
                          </div>
                          <div>
                            <h3 className="font-medium">{room.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              Last accessed {formatDistanceToNow(new Date(room.last_accessed), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {room.created_by === user?.id && (
                            <button
                              onClick={(e) => deleteRoom(room.id, e)}
                              className="p-2 rounded-full hover:bg-destructive/20 transition-colors"
                            >
                              <Trash2 size={16} className="text-muted-foreground hover:text-destructive" />
                            </button>
                          )}
                          <CustomButton size="sm" variant="ghost">
                            Enter
                          </CustomButton>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </PageTransition>
  );
};

export default Home;
