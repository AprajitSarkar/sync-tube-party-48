
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2, Eye, Edit, Check, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface Playlist {
  id: string;
  name: string;
  created_at: string;
}

const UserPlaylistManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [editingPlaylist, setEditingPlaylist] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchPlaylists();
  }, [user]);

  const fetchPlaylists = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('user_playlists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setPlaylists(data || []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your playlists',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createPlaylist = async () => {
    if (!newPlaylistName.trim() || !user) return;
    
    try {
      setIsCreating(true);
      const { data, error } = await supabase
        .from('user_playlists')
        .insert({
          name: newPlaylistName.trim(),
          user_id: user.id
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating playlist:', error);
        throw error;
      }
      
      setPlaylists([data, ...playlists]);
      setNewPlaylistName('');
      
      toast({
        title: 'Success',
        description: 'Playlist created successfully',
      });
    } catch (error: any) {
      console.error('Error creating playlist:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create playlist',
        variant: 'destructive'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const deletePlaylist = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_playlists')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setPlaylists(playlists.filter(playlist => playlist.id !== id));
      
      toast({
        title: 'Success',
        description: 'Playlist deleted successfully',
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

  const startEditingPlaylist = (playlist: Playlist) => {
    setEditingPlaylist(playlist.id);
    setEditName(playlist.name);
  };

  const cancelEditingPlaylist = () => {
    setEditingPlaylist(null);
    setEditName('');
  };

  const updatePlaylistName = async (id: string) => {
    if (!editName.trim()) return;
    
    try {
      const { error } = await supabase
        .from('user_playlists')
        .update({ name: editName.trim() })
        .eq('id', id);
        
      if (error) throw error;
      
      setPlaylists(playlists.map(playlist => 
        playlist.id === id ? { ...playlist, name: editName.trim() } : playlist
      ));
      
      cancelEditingPlaylist();
      
      toast({
        title: 'Success',
        description: 'Playlist name updated successfully',
      });
    } catch (error) {
      console.error('Error updating playlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to update playlist name',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className={`flex ${isMobile ? 'flex-col' : 'items-center'} gap-3`}>
        <Input
          placeholder="New playlist name"
          value={newPlaylistName}
          onChange={(e) => setNewPlaylistName(e.target.value)}
          className="bg-white/5 border-white/20"
        />
        <Button 
          onClick={createPlaylist}
          disabled={!newPlaylistName.trim() || isCreating}
          className={`${isMobile ? 'w-full' : 'shrink-0'}`}
        >
          {isCreating ? (
            <LoadingSpinner size="sm" className="mr-2" />
          ) : (
            <PlusCircle size={18} className="mr-2" />
          )}
          Create
        </Button>
      </div>
      
      <Separator className="bg-white/10" />
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <p>You don't have any playlists yet</p>
          <p className="text-sm mt-2">Create a new playlist to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {playlists.map((playlist) => (
            <div 
              key={playlist.id}
              className="border border-white/10 rounded-lg p-4 bg-white/5"
            >
              <div className={`flex ${isMobile ? 'flex-col' : 'justify-between'} items-center gap-3`}>
                {editingPlaylist === playlist.id ? (
                  <div className="flex items-center gap-2 flex-grow w-full">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="bg-white/10 border-white/20"
                      autoFocus
                    />
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => updatePlaylistName(playlist.id)}
                      disabled={!editName.trim()}
                    >
                      <Check size={18} className="text-green-500" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={cancelEditingPlaylist}
                    >
                      <X size={18} className="text-red-500" />
                    </Button>
                  </div>
                ) : (
                  <div className={`${isMobile ? 'text-center w-full' : ''}`}>
                    <h3 className="font-medium">{playlist.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(playlist.created_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
                
                {editingPlaylist !== playlist.id && (
                  <div className={`flex gap-2 ${isMobile ? 'mt-3 w-full justify-center' : ''}`}>
                    <Button size={isMobile ? "sm" : "icon"} variant="ghost" onClick={() => startEditingPlaylist(playlist)}>
                      {isMobile ? (
                        <>
                          <Edit size={16} className="mr-2" />
                          <span>Edit</span>
                        </>
                      ) : (
                        <Edit size={16} />
                      )}
                    </Button>
                    <Button size={isMobile ? "sm" : "icon"} variant="ghost" className="text-muted-foreground hover:text-foreground">
                      {isMobile ? (
                        <>
                          <Eye size={16} className="mr-2" />
                          <span>View</span>
                        </>
                      ) : (
                        <Eye size={16} />
                      )}
                    </Button>
                    <Button 
                      size={isMobile ? "sm" : "icon"} 
                      variant="ghost" 
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => deletePlaylist(playlist.id)}
                    >
                      {isMobile ? (
                        <>
                          <Trash2 size={16} className="mr-2" />
                          <span>Delete</span>
                        </>
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserPlaylistManager;
