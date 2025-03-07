
import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { CustomButton } from '@/components/ui/custom-button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ListMusic, Music, Trash2, Plus, X, 
  Pencil, Check, FolderPlus 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface PlaylistItem {
  id: string;
  video_id: string;
  title: string;
  position: number;
  playlist_name: string;
}

const UserPlaylistManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userPlaylists, setUserPlaylists] = useState<{[key: string]: PlaylistItem[]}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [activePlaylist, setActivePlaylist] = useState<string | null>(null);
  const [playlistNames, setPlaylistNames] = useState<string[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [isRenaming, setIsRenaming] = useState<{[key: string]: boolean}>({});
  const [newNames, setNewNames] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (user) {
      fetchUserPlaylists();
    }
  }, [user]);

  const fetchUserPlaylists = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // First get all playlist names for the user
      const { data: playlistsData, error: playlistsError } = await supabase
        .from('user_playlists')
        .select('playlist_name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (playlistsError) throw playlistsError;

      const uniquePlaylistNames = [...new Set(playlistsData?.map(p => p.playlist_name) || [])];
      setPlaylistNames(uniquePlaylistNames);

      // Then fetch all playlist items
      const { data: itemsData, error: itemsError } = await supabase
        .from('user_playlist_items')
        .select('*')
        .eq('user_id', user.id)
        .order('position', { ascending: true });

      if (itemsError) throw itemsError;

      // Group by playlist name
      const groupedPlaylists: {[key: string]: PlaylistItem[]} = {};
      uniquePlaylistNames.forEach(name => {
        groupedPlaylists[name] = (itemsData || [])
          .filter(item => item.playlist_name === name)
          .sort((a, b) => a.position - b.position);
      });

      setUserPlaylists(groupedPlaylists);
      
      // Set the active playlist to the first one if there are any
      if (uniquePlaylistNames.length > 0 && !activePlaylist) {
        setActivePlaylist(uniquePlaylistNames[0]);
      }
    } catch (error) {
      console.error('Error fetching user playlists:', error);
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
      // Check if playlist name already exists
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
      
      // Update the list of playlists
      setPlaylistNames(prev => [newPlaylistName.trim(), ...prev]);
      setUserPlaylists(prev => ({
        ...prev,
        [newPlaylistName.trim()]: []
      }));
      
      // Set as active playlist
      setActivePlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setIsCreatingPlaylist(false);
      
      toast({
        title: 'Success',
        description: 'New playlist created',
      });
    } catch (error) {
      console.error('Error creating playlist:', error);
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
      // Check if new name already exists
      if (playlistNames.includes(newNames[oldName].trim()) && newNames[oldName].trim() !== oldName) {
        toast({
          title: 'Playlist exists',
          description: 'A playlist with this name already exists',
          variant: 'destructive'
        });
        return;
      }
      
      // Update playlist name in user_playlists table
      const { error: playlistsError } = await supabase
        .from('user_playlists')
        .update({ playlist_name: newNames[oldName].trim() })
        .eq('user_id', user.id)
        .eq('playlist_name', oldName);
        
      if (playlistsError) throw playlistsError;
      
      // Update playlist name in user_playlist_items table
      const { error: itemsError } = await supabase
        .from('user_playlist_items')
        .update({ playlist_name: newNames[oldName].trim() })
        .eq('user_id', user.id)
        .eq('playlist_name', oldName);
        
      if (itemsError) throw itemsError;
      
      // Update local state
      setPlaylistNames(prev => prev.map(name => name === oldName ? newNames[oldName].trim() : name));
      
      // Update userPlaylists
      setUserPlaylists(prev => {
        const updated = { ...prev };
        updated[newNames[oldName].trim()] = updated[oldName];
        delete updated[oldName];
        return updated;
      });
      
      // Update active playlist if needed
      if (activePlaylist === oldName) {
        setActivePlaylist(newNames[oldName].trim());
      }
      
      // Reset renaming state
      setIsRenaming(prev => ({ ...prev, [oldName]: false }));
      
      toast({
        title: 'Success',
        description: 'Playlist renamed',
      });
    } catch (error) {
      console.error('Error renaming playlist:', error);
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
      // Delete from user_playlists table
      const { error: playlistsError } = await supabase
        .from('user_playlists')
        .delete()
        .eq('user_id', user.id)
        .eq('playlist_name', name);
        
      if (playlistsError) throw playlistsError;
      
      // Delete from user_playlist_items table
      const { error: itemsError } = await supabase
        .from('user_playlist_items')
        .delete()
        .eq('user_id', user.id)
        .eq('playlist_name', name);
        
      if (itemsError) throw itemsError;
      
      // Update local state
      setPlaylistNames(prev => prev.filter(n => n !== name));
      
      setUserPlaylists(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
      
      // Update active playlist if needed
      if (activePlaylist === name) {
        setActivePlaylist(playlistNames.filter(n => n !== name)[0] || null);
      }
      
      toast({
        title: 'Success',
        description: 'Playlist deleted',
      });
    } catch (error) {
      console.error('Error deleting playlist:', error);
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
      // Delete the item
      const { error } = await supabase
        .from('user_playlist_items')
        .delete()
        .eq('id', itemId);
        
      if (error) throw error;
      
      // Update the positions of remaining items
      const updatedItems = userPlaylists[playlistName].filter(item => item.id !== itemId);
      
      updatedItems.forEach(async (item, index) => {
        await supabase
          .from('user_playlist_items')
          .update({ position: index })
          .eq('id', item.id);
      });
      
      // Update local state
      setUserPlaylists(prev => ({
        ...prev,
        [playlistName]: updatedItems
      }));
      
      toast({
        title: 'Success',
        description: 'Video removed from playlist',
      });
    } catch (error) {
      console.error('Error removing item from playlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove video from playlist',
        variant: 'destructive'
      });
    }
  };

  return (
    <GlassCard className="p-6">
      <h2 className="text-xl font-semibold mb-4">Manage Playlists</h2>
      
      <div className="mb-4">
        {isCreatingPlaylist ? (
          <div className="flex gap-2">
            <Input
              placeholder="New playlist name..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="bg-white/5 border-white/10"
            />
            <CustomButton
              size="icon"
              variant="glow"
              onClick={createNewPlaylist}
              disabled={!newPlaylistName.trim()}
              className="shrink-0"
            >
              <Check size={18} />
            </CustomButton>
            <CustomButton
              size="icon"
              variant="outline"
              onClick={() => setIsCreatingPlaylist(false)}
              className="shrink-0"
            >
              <X size={18} />
            </CustomButton>
          </div>
        ) : (
          <CustomButton
            onClick={() => setIsCreatingPlaylist(true)}
            variant="outline"
            icon={<FolderPlus size={18} />}
          >
            Create New Playlist
          </CustomButton>
        )}
      </div>
      
      {playlistNames.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          <ListMusic size={24} className="mx-auto mb-2 opacity-50" />
          <p>You don't have any playlists yet</p>
          <p className="text-sm mt-1 opacity-70">Create one to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {playlistNames.map((name) => (
              <CustomButton
                key={name}
                size="sm"
                variant={activePlaylist === name ? "glow" : "outline"}
                onClick={() => setActivePlaylist(name)}
                className="relative"
              >
                {name}
              </CustomButton>
            ))}
          </div>
          
          {activePlaylist && (
            <div className="rounded-md border border-white/10 overflow-hidden">
              <div className="p-4 flex items-center justify-between bg-white/5">
                <h3 className="font-medium">{activePlaylist}</h3>
                <div className="flex gap-2">
                  {isRenaming[activePlaylist] ? (
                    <div className="flex gap-1">
                      <Input
                        value={newNames[activePlaylist] || activePlaylist}
                        onChange={(e) => setNewNames({...newNames, [activePlaylist]: e.target.value})}
                        className="h-8 text-sm bg-white/5 border-white/10 w-40"
                        autoFocus
                      />
                      <CustomButton
                        size="icon"
                        variant="ghost"
                        onClick={() => renamePlaylist(activePlaylist)}
                        className="h-8 w-8"
                        title="Save"
                      >
                        <Check size={16} />
                      </CustomButton>
                      <CustomButton
                        size="icon"
                        variant="ghost"
                        onClick={() => setIsRenaming(prev => ({ ...prev, [activePlaylist]: false }))}
                        className="h-8 w-8"
                        title="Cancel"
                      >
                        <X size={16} />
                      </CustomButton>
                    </div>
                  ) : (
                    <>
                      <CustomButton
                        size="icon"
                        variant="ghost"
                        onClick={() => startRenamingPlaylist(activePlaylist)}
                        className="h-8 w-8"
                        title="Rename playlist"
                      >
                        <Pencil size={16} />
                      </CustomButton>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <CustomButton
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                            title="Delete playlist"
                          >
                            <Trash2 size={16} />
                          </CustomButton>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete playlist?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the "{activePlaylist}" playlist and all its videos.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deletePlaylist(activePlaylist)} 
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </div>
              
              <ScrollArea className="h-[300px]">
                {userPlaylists[activePlaylist]?.length > 0 ? (
                  <div className="p-2">
                    {userPlaylists[activePlaylist].map((item) => (
                      <div 
                        key={item.id}
                        className="flex items-center gap-2 p-2 rounded-md bg-white/5 hover:bg-white/10 transition-colors mb-2"
                      >
                        <div className="w-12 h-9 bg-black/40 rounded overflow-hidden flex-shrink-0">
                          <img 
                            src={`https://i.ytimg.com/vi/${item.video_id}/default.jpg`} 
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder.svg';
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
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
                    <Music size={24} className="mb-2 opacity-50" />
                    <p>This playlist is empty</p>
                    <p className="text-sm mt-1 opacity-70">Add videos from room playlists</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
};

export default UserPlaylistManager;
