
import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { CustomButton } from '@/components/ui/custom-button';
import { Search, Plus, Play } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import PlaylistItem from './PlaylistItem';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';

interface PlaylistPanelProps {
  roomId: string;
  currentVideoId: string;
  onPlayVideo: (videoId: string) => void;
}

interface PlaylistItem {
  id: string;
  room_id: string;
  video_id: string;
  title: string;
  position: number;
}

const PlaylistPanel = ({ roomId, currentVideoId, onPlayVideo }: PlaylistPanelProps) => {
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchPlaylist();

    const playlistSubscription = supabase
      .channel(`playlist:${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'playlist_items',
        filter: `room_id=eq.${roomId}`,
      }, () => {
        fetchPlaylist();
      })
      .subscribe();

    return () => {
      playlistSubscription.unsubscribe();
    };
  }, [roomId]);

  const fetchPlaylist = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('playlist_items')
        .select('*')
        .eq('room_id', roomId)
        .order('position', { ascending: true });

      if (error) throw error;
      setPlaylist(data || []);
    } catch (error) {
      console.error('Error fetching playlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to load playlist',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const extractVideoId = (url: string): string | null => {
    // Handle standard YouTube URLs
    const standardMatch = url.match(/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (standardMatch) return standardMatch[1];
    
    // Handle direct video ID input (if it's exactly 11 chars)
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
    
    return null;
  };

  const addToPlaylist = async () => {
    // If the input is not a URL, treat it as a search query
    if (!urlInput.includes('youtube.com') && !urlInput.includes('youtu.be') && !/^[a-zA-Z0-9_-]{11}$/.test(urlInput)) {
      handleSearch(urlInput);
      return;
    }

    const videoId = extractVideoId(urlInput);
    
    if (!videoId) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid YouTube URL or video ID',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      // Get video title from oEmbed API
      const response = await fetch(`https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=${videoId}&format=json`);
      const data = await response.json();
      const title = data.title || 'Untitled Video';
      
      // Get the new position (max position + 1)
      const maxPosition = playlist.length > 0 
        ? Math.max(...playlist.map(item => item.position)) 
        : -1;
      
      const { error } = await supabase
        .from('playlist_items')
        .insert({
          room_id: roomId,
          video_id: videoId,
          title,
          position: maxPosition + 1,
          added_by: user?.id
        });

      if (error) {
        console.error('Error adding to playlist:', error);
        throw error;
      }
      
      setUrlInput('');
      toast({
        title: 'Video Added',
        description: `"${title}" added to playlist`,
      });
    } catch (error) {
      console.error('Error adding to playlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to add video to playlist. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      toast({
        title: 'Empty Search',
        description: 'Please enter a search term',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setIsSearching(true);
      
      // Using YouTube Data API would be better, but for demonstration:
      // Fetch a few sample videos based on the query
      const mockResults = [
        { id: 'dQw4w9WgXcQ', title: 'Rick Astley - Never Gonna Give You Up' },
        { id: '9bZkp7q19f0', title: 'PSY - Gangnam Style' },
        { id: 'JGwWNGJdvx8', title: 'Ed Sheeran - Shape of You' },
        { id: 'kJQP7kiw5Fk', title: 'Luis Fonsi - Despacito ft. Daddy Yankee' },
        { id: 'OPf0YbXqDm0', title: 'Mark Ronson - Uptown Funk ft. Bruno Mars' }
      ];
      
      // Filter results by search term for demo purposes
      const filteredResults = mockResults.filter(r => 
        r.title.toLowerCase().includes(query.toLowerCase())
      );
      
      setSearchResults(filteredResults.length > 0 ? filteredResults : mockResults);
      
      if (filteredResults.length === 0 && mockResults.length > 0) {
        toast({
          title: 'No exact matches',
          description: 'Showing popular videos instead',
        });
      }
    } catch (error) {
      console.error('Error searching videos:', error);
      toast({
        title: 'Error',
        description: 'Failed to search videos',
        variant: 'destructive'
      });
    } finally {
      setIsSearching(false);
    }
  };

  const addSearchResultToPlaylist = async (result: any) => {
    try {
      // Get the new position (max position + 1)
      const maxPosition = playlist.length > 0 
        ? Math.max(...playlist.map(item => item.position)) 
        : -1;
      
      const { error } = await supabase
        .from('playlist_items')
        .insert({
          room_id: roomId,
          video_id: result.id,
          title: result.title,
          position: maxPosition + 1,
          added_by: user?.id
        });

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }
      
      setSearchResults([]);
      setUrlInput('');
      toast({
        title: 'Video Added',
        description: `"${result.title}" added to playlist`,
      });
    } catch (error) {
      console.error('Error adding to playlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to add video to playlist',
        variant: 'destructive'
      });
    }
  };

  const removeFromPlaylist = async (id: string) => {
    try {
      const { error } = await supabase
        .from('playlist_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Update positions after deletion
      const updatedPlaylist = playlist.filter(item => item.id !== id);
      updatePositions(updatedPlaylist);
      
      toast({
        title: 'Video Removed',
        description: 'Video removed from playlist',
      });
    } catch (error) {
      console.error('Error removing from playlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove video from playlist',
        variant: 'destructive'
      });
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;
    
    // Reorder the playlist
    const newPlaylist = [...playlist];
    const [removed] = newPlaylist.splice(sourceIndex, 1);
    newPlaylist.splice(destinationIndex, 0, removed);
    
    // Update positions
    updatePositions(newPlaylist);
  };

  const updatePositions = async (newPlaylist: PlaylistItem[]) => {
    // Update local state immediately for a snappy UI
    setPlaylist(newPlaylist);
    
    try {
      // Update each item's position in the database
      const updates = newPlaylist.map((item, index) => ({
        id: item.id,
        position: index,
      }));
      
      for (const update of updates) {
        await supabase
          .from('playlist_items')
          .update({ position: update.position })
          .eq('id', update.id);
      }
    } catch (error) {
      console.error('Error updating positions:', error);
      toast({
        title: 'Error',
        description: 'Failed to update playlist order',
        variant: 'destructive'
      });
      
      // Refetch to ensure UI matches the database
      fetchPlaylist();
    }
  };

  return (
    <GlassCard className="flex flex-col h-full">
      <div className="p-3 border-b border-white/10">
        <h3 className="font-medium text-white">Playlist</h3>
      </div>
      
      <div className="p-3 border-b border-white/10">
        <div className="flex gap-2">
          <Input
            placeholder="YouTube URL or search..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="h-10 bg-background/30 border-white/20 text-white"
          />
          <CustomButton
            size="sm"
            variant="glow"
            onClick={addToPlaylist}
            isLoading={isSearching}
            icon={urlInput.includes('youtube.com') || urlInput.includes('youtu.be') ? <Plus size={16} /> : <Search size={16} />}
          >
            {urlInput.includes('youtube.com') || urlInput.includes('youtu.be') ? 'Add' : 'Search'}
          </CustomButton>
        </div>
        
        {searchResults.length > 0 && (
          <div className="mt-3">
            <GlassCard className="p-2" intensity="light">
              <h4 className="text-sm font-medium mb-2 text-white">Search Results</h4>
              <div className="space-y-2">
                {searchResults.map((result) => (
                  <div 
                    key={result.id} 
                    className="flex items-center p-2 hover:bg-white/10 rounded cursor-pointer"
                    onClick={() => addSearchResultToPlaylist(result)}
                  >
                    <div className="w-12 h-9 bg-black/40 rounded overflow-hidden flex-shrink-0 mr-2">
                      <img 
                        src={`https://i.ytimg.com/vi/${result.id}/default.jpg`} 
                        alt={result.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'public/placeholder.svg';
                        }}
                      />
                    </div>
                    <p className="text-sm truncate flex-1 text-white">{result.title}</p>
                    <button 
                      className="p-2 rounded-full hover:bg-white/10 transition flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        addSearchResultToPlaylist(result);
                      }}
                    >
                      <Play size={16} className="text-white fill-white/20" />
                    </button>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-3">
            {playlist.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-white">
                <p>Playlist is empty</p>
                <p className="text-sm mt-1 text-white/70">Add videos using the search box above</p>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="playlist">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {playlist.map((item, index) => (
                        <PlaylistItem
                          key={item.id}
                          videoItem={{
                            id: item.id,
                            title: item.title,
                            videoId: item.video_id,
                          }}
                          index={index}
                          isPlaying={item.video_id === currentVideoId}
                          onPlay={() => onPlayVideo(item.video_id)}
                          onRemove={removeFromPlaylist}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        </ScrollArea>
      </div>
    </GlassCard>
  );
};

export default PlaylistPanel;
