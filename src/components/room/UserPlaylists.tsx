import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { CustomButton } from '@/components/ui/custom-button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ListMusic, Music, Trash2, Play, Plus, X, 
  Pencil, Check, Save, Library, FolderPlus 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import LogToast from '@/components/common/LogToast';

interface UserPlaylistsProps {
  onPlayVideo: (videoId: string) => void;
  onAddToRoomPlaylist: (videoId: string, title: string) => void;
}

interface PlaylistItem {
  id: string;
  video_id: string;
  title: string;
  position: number;
  playlist_name: string;
}

const UserPlaylists = ({ onPlayVideo, onAddToRoomPlaylist }: UserPlaylistsProps) => {
  const { user } = useAuth();
  const [userPlaylists, setUserPlaylists] = useState<{[key: string]: PlaylistItem[]}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [activePlaylist, setActivePlaylist] = useState<string | null>(null);
  const [playlistNames, setPlaylistNames] = useState<string[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [isRenaming, setIsRenaming] = useState<{[key: string]: boolean}>({});
  const [newNames, setNewNames] = useState<{[key: string]: string}>({});
  const [logMessage, setLogMessage] = useState('');
  const [logVisible, setLogVisible] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [isAddingVideo, setIsAddingVideo] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserPlaylists();
    }
  }, [user]);

  const showLog = (message: string) => {
    setLogMessage(message);
    setLogVisible(true);
  };

  const hideLog = () => {
    setLogVisible(false);
  };

  const fetchUserPlaylists = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      showLog("Loading your playlists...");

      const { data: playlistsData, error: playlistsError } = await supabase
        .from('user_playlists')
        .select('playlist_name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (playlistsError) throw playlistsError;

      const uniquePlaylistNames = [...new Set(playlistsData?.map(p => p.playlist_name) || [])];
      setPlaylistNames(uniquePlaylistNames);

      const { data: itemsData, error: itemsError } = await supabase
        .from('user_playlist_items')
        .select('*')
        .eq('user_id', user.id)
        .order('position', { ascending: true });

      if (itemsError) throw itemsError;

      const groupedPlaylists: {[key: string]: PlaylistItem[]} = {};
      uniquePlaylistNames.forEach(name => {
        groupedPlaylists[name] = (itemsData || [])
          .filter(item => item.playlist_name === name)
          .sort((a, b) => a.position - b.position);
      });

      setUserPlaylists(groupedPlaylists);
      
      if (uniquePlaylistNames.length > 0 && !activePlaylist) {
        setActivePlaylist(uniquePlaylistNames[0]);
      }
      
      showLog("Playlists loaded");
    } catch (error) {
      console.error('Error fetching user playlists:', error);
      showLog("Failed to load playlists");
      toast({
        title: 'Error',
        description: 'Failed to load your playlists',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewPlaylist = async () => {
    if (!user || !newPlaylistName.trim()) return;
    
    try {
      showLog("Creating playlist...");
      
      if (playlistNames.includes(newPlaylistName.trim())) {
        toast({
          title: 'Playlist exists',
          description: 'A playlist with this name already exists',
          variant: 'destructive'
        });
        return;
      }
      
      const { error } = await supabase
        .from('user_playlists')
        .insert({
          user_id: user.id,
          playlist_name: newPlaylistName.trim()
        });
        
      if (error) throw error;
      
      setPlaylistNames(prev => [newPlaylistName.trim(), ...prev]);
      setUserPlaylists(prev => ({
        ...prev,
        [newPlaylistName.trim()]: []
      }));
      
      setActivePlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setIsCreatingPlaylist(false);
      
      showLog("Playlist created");
      toast({
        title: 'Success',
        description: 'New playlist created',
      });
    } catch (error) {
      console.error('Error creating playlist:', error);
      showLog("Failed to create playlist");
      toast({
        title: 'Error',
        description: 'Failed to create playlist',
        variant: 'destructive'
      });
    }
  };

  const startRenamingPlaylist = (name: string) => {
    setIsRenaming(prev => ({ ...prev, [name]: true }));
    setNewNames(prev => ({ ...prev, [name]: name }));
  };

  const renamePlaylist = async (oldName: string) => {
    if (!user || !newNames[oldName]?.trim()) return;
    
    try {
      showLog("Renaming playlist...");
      
      if (playlistNames.includes(newNames[oldName].trim()) && newNames[oldName].trim() !== oldName) {
        toast({
          title: 'Playlist exists',
          description: 'A playlist with this name already exists',
          variant: 'destructive'
        });
        return;
      }
      
      const { error: playlistsError } = await supabase
        .from('user_playlists')
        .update({ playlist_name: newNames[oldName].trim() })
        .eq('user_id', user.id)
        .eq('playlist_name', oldName);
        
      if (playlistsError) throw playlistsError;
      
      const { error: itemsError } = await supabase
        .from('user_playlist_items')
        .update({ playlist_name: newNames[oldName].trim() })
        .eq('user_id', user.id)
        .eq('playlist_name', oldName);
        
      if (itemsError) throw itemsError;
      
      setPlaylistNames(prev => prev.map(name => name === oldName ? newNames[oldName].trim() : name));
      
      setUserPlaylists(prev => {
        const updated = { ...prev };
        updated[newNames[oldName].trim()] = updated[oldName];
        delete updated[oldName];
        return updated;
      });
      
      if (activePlaylist === oldName) {
        setActivePlaylist(newNames[oldName].trim());
      }
      
      setIsRenaming(prev => ({ ...prev, [oldName]: false }));
      
      showLog("Playlist renamed");
      toast({
        title: 'Success',
        description: 'Playlist renamed',
      });
    } catch (error) {
      console.error('Error renaming playlist:', error);
      showLog("Failed to rename playlist");
      toast({
        title: 'Error',
        description: 'Failed to rename playlist',
        variant: 'destructive'
      });
    }
  };

  const deletePlaylist = async (name: string) => {
    if (!user) return;
    
    try {
      showLog("Deleting playlist...");
      
      const { error: playlistsError } = await supabase
        .from('user_playlists')
        .delete()
        .eq('user_id', user.id)
        .eq('playlist_name', name);
        
      if (playlistsError) throw playlistsError;
      
      const { error: itemsError } = await supabase
        .from('user_playlist_items')
        .delete()
        .eq('user_id', user.id)
        .eq('playlist_name', name);
        
      if (itemsError) throw itemsError;
      
      setPlaylistNames(prev => prev.filter(n => n !== name));
      
      setUserPlaylists(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
      
      if (activePlaylist === name) {
        setActivePlaylist(playlistNames.filter(n => n !== name)[0] || null);
      }
      
      showLog("Playlist deleted");
      toast({
        title: 'Success',
        description: 'Playlist deleted',
      });
    } catch (error) {
      console.error('Error deleting playlist:', error);
      showLog("Failed to delete playlist");
      toast({
        title: 'Error',
        description: 'Failed to delete playlist',
        variant: 'destructive'
      });
    }
  };

  const removeItemFromPlaylist = async (itemId: string, playlistName: string) => {
    if (!user) return;
    
    try {
      showLog("Removing video...");
      
      const { error } = await supabase
        .from('user_playlist_items')
        .delete()
        .eq('id', itemId);
        
      if (error) throw error;
      
      const updatedItems = userPlaylists[playlistName].filter(item => item.id !== itemId);
      
      updatedItems.forEach(async (item, index) => {
        await supabase
          .from('user_playlist_items')
          .update({ position: index })
          .eq('id', item.id);
      });
      
      setUserPlaylists(prev => ({
        ...prev,
        [playlistName]: updatedItems
      }));
      
      showLog("Video removed");
      toast({
        title: 'Success',
        description: 'Video removed from playlist',
      });
    } catch (error) {
      console.error('Error removing item from playlist:', error);
      showLog("Failed to remove video");
      toast({
        title: 'Error',
        description: 'Failed to remove video from playlist',
        variant: 'destructive'
      });
    }
  };

  const addToRoomPlaylist = (videoId: string, title: string) => {
    onAddToRoomPlaylist(videoId, title);
    showLog("Added to room playlist");
  };

  const handleAddVideo = async () => {
    if (!user || !activePlaylist) return;
    
    try {
      showLog("Adding video...");
      
      const videoIdMatch = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
      const videoId = videoIdMatch?.[1];
      
      if (!videoId) {
        toast({
          title: 'Invalid URL',
          description: 'Please enter a valid YouTube video URL',
          variant: 'destructive'
        });
        return;
      }
      
      const videoDetails = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`);
      const data = await videoDetails.json();
      
      if (!data.items?.[0]) {
        toast({
          title: 'Video not found',
          description: 'Could not find video details',
          variant: 'destructive'
        });
        return;
      }
      
      const videoTitle = data.items[0].snippet.title;
      
      const { error } = await supabase
        .from('user_playlist_items')
        .insert({
          user_id: user.id,
          playlist_name: activePlaylist,
          video_id: videoId,
          title: videoTitle,
          position: userPlaylists[activePlaylist]?.length || 0
        });
        
      if (error) throw error;
      
      setUserPlaylists(prev => ({
        ...prev,
        [activePlaylist]: [
          ...prev[activePlaylist],
          {
            id: crypto.randomUUID(),
            video_id: videoId,
            title: videoTitle,
            position: prev[activePlaylist].length,
            playlist_name: activePlaylist
          }
        ]
      }));
      
      setVideoUrl('');
      setIsAddingVideo(false);
      
      showLog("Video added");
      toast({
        title: 'Success',
        description: 'Video added to playlist',
      });
    } catch (error) {
      console.error('Error adding video:', error);
      showLog("Failed to add video");
      toast({
        title: 'Error',
        description: 'Failed to add video to playlist',
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      <LogToast 
        message={logMessage} 
        visible={logVisible} 
        onHide={hideLog} 
        duration={1000}
      />
      
      <GlassCard className="flex flex-col h-full">
        <div className="p-3 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ListMusic size={18} />
            <h3 className="font-medium">My Playlists</h3>
          </div>
          <div className="flex gap-2">
            <CustomButton
              size="icon"
              variant="ghost"
              onClick={() => setIsAddingVideo(!isAddingVideo)}
              className="h-8 w-8"
              title="Add video"
            >
              {isAddingVideo ? <X size={16} /> : <Plus size={16} />}
            </CustomButton>
            <CustomButton
              size="icon"
              variant="ghost"
              onClick={() => setIsCreatingPlaylist(!isCreatingPlaylist)}
              className="h-8 w-8"
              title="Create new playlist"
            >
              {isCreatingPlaylist ? <X size={16} /> : <FolderPlus size={16} />}
            </CustomButton>
          </div>
        </div>
        
        {isAddingVideo && activePlaylist && (
          <div className="p-3 border-b border-white/10">
            <div className="flex gap-2">
              <Input
                placeholder="Paste YouTube video URL..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="h-9 bg-white/5 border-white/10"
                autoFocus
              />
              <CustomButton
                size="sm"
                variant="glow"
                onClick={handleAddVideo}
                disabled={!videoUrl.trim()}
              >
                <Plus size={16} />
              </CustomButton>
            </div>
          </div>
        )}
        
        {isCreatingPlaylist && (
          <div className="p-3 border-b border-white/10">
            <div className="flex gap-2">
              <Input
                placeholder="New playlist name..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="h-9 bg-white/5 border-white/10"
                autoFocus
              />
              <CustomButton
                size="sm"
                variant="glow"
                onClick={createNewPlaylist}
                disabled={!newPlaylistName.trim()}
              >
                <FolderPlus size={16} />
              </CustomButton>
            </div>
          </div>
        )}
        
        <div className="p-3 border-b border-white/10 overflow-x-auto">
          <div className="flex gap-2 min-w-min">
            {playlistNames.length === 0 ? (
              <p className="text-sm text-muted-foreground">No playlists yet</p>
            ) : (
              playlistNames.map((name) => (
                <div key={name} className="relative">
                  <CustomButton
                    size="sm"
                    variant={activePlaylist === name ? "glow" : "ghost"}
                    onClick={() => setActivePlaylist(name)}
                    className="min-w-24 text-sm"
                  >
                    {isRenaming[name] ? (
                      <Input
                        value={newNames[name] || name}
                        onChange={(e) => setNewNames({...newNames, [name]: e.target.value})}
                        className="h-6 text-xs bg-white/5 border-white/10 px-1"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="truncate">{name}</span>
                    )}
                  </CustomButton>
                  
                  {activePlaylist === name && (
                    <div className="absolute top-full right-0 mt-1 flex bg-black/50 backdrop-blur-sm rounded overflow-hidden z-10">
                      {isRenaming[name] ? (
                        <button 
                          className="p-1 hover:bg-white/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            renamePlaylist(name);
                          }}
                        >
                          <Check size={14} />
                        </button>
                      ) : (
                        <button 
                          className="p-1 hover:bg-white/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            startRenamingPlaylist(name);
                          }}
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                      <button 
                        className="p-1 hover:bg-white/10 text-red-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePlaylist(name);
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        
        <ScrollArea className="flex-1 p-0">
          <div className="p-3">
            {activePlaylist && userPlaylists[activePlaylist]?.length > 0 ? (
              <div className="space-y-2">
                {userPlaylists[activePlaylist].map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-center gap-2 p-2 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="w-12 h-9 bg-black/40 rounded overflow-hidden flex-shrink-0">
                      <img 
                        src={`https://i.ytimg.com/vi/${item.video_id}/default.jpg`} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'public/placeholder.svg';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{item.title}</p>
                    </div>
                    <div className="flex gap-1">
                      <CustomButton
                        size="icon"
                        variant="ghost"
                        onClick={() => onPlayVideo(item.video_id)}
                        className="h-7 w-7 text-white hover:bg-white/10"
                        title="Play now"
                      >
                        <Play size={14} />
                      </CustomButton>
                      <CustomButton
                        size="icon"
                        variant="ghost"
                        onClick={() => addToRoomPlaylist(item.video_id, item.title)}
                        className="h-7 w-7 text-white hover:bg-white/10"
                        title="Add to room playlist"
                      >
                        <Plus size={14} />
                      </CustomButton>
                      <CustomButton
                        size="icon"
                        variant="ghost"
                        onClick={() => removeItemFromPlaylist(item.id, activePlaylist)}
                        className="h-7 w-7 text-white hover:bg-white/10 hover:text-red-400"
                        title="Remove from playlist"
                      >
                        <Trash2 size={14} />
                      </CustomButton>
                    </div>
                  </div>
                ))}
              </div>
            ) : activePlaylist ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <Music size={24} className="mb-2 opacity-50" />
                <p>This playlist is empty</p>
                <p className="text-sm mt-1 opacity-70">Add videos from room playlists</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <Library size={24} className="mb-2 opacity-50" />
                <p>Select a playlist</p>
                <p className="text-sm mt-1 opacity-70">Or create a new one</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </GlassCard>
    </>
  );
};

export default UserPlaylists;
