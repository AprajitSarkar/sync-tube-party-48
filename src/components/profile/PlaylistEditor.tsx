
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { CustomButton } from '@/components/ui/custom-button';
import { Plus, Search, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// Default YouTube API key
const DEFAULT_YOUTUBE_API_KEY = 'AIzaSyB-qDaqVOnqVjiSIYfxJl2SZRySLjG9SR0';

interface PlaylistEditorProps {
  playlistId: string;
  onVideoAdded: () => void;
}

const PlaylistEditor = ({ playlistId, onVideoAdded }: PlaylistEditorProps) => {
  const { user } = useAuth();
  const [videoUrl, setVideoUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const addVideoToPlaylist = async (videoId: string) => {
    try {
      // Use the stored API key from local storage or fall back to the default key
      const storedKey = user?.id ? localStorage.getItem(`youtube_api_key_${user.id}`) : null;
      const apiKey = storedKey || DEFAULT_YOUTUBE_API_KEY;
      
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
      );
      
      const data = await response.json();

      if (!data.items?.[0]) {
        toast({
          title: 'Error',
          description: 'Video not found',
          variant: 'destructive',
        });
        return;
      }

      const videoTitle = data.items[0].snippet.title;

      // Get current position
      const { data: currentItems } = await supabase
        .from('user_playlist_items')
        .select('position')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: false })
        .limit(1);

      const nextPosition = (currentItems?.[0]?.position ?? -1) + 1;

      const { error } = await supabase
        .from('user_playlist_items')
        .insert({
          playlist_id: playlistId,
          user_id: user?.id,
          video_id: videoId,
          title: videoTitle,
          position: nextPosition,
          playlist_name: '' // Add empty string as a fallback
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Video added to playlist',
      });

      setVideoUrl('');
      setSearchQuery('');
      onVideoAdded();
    } catch (error) {
      console.error('Error adding video:', error);
      toast({
        title: 'Error',
        description: 'Failed to add video',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddVideo = async () => {
    if (!videoUrl.trim()) return;
    
    setIsAdding(true);
    const videoId = extractVideoId(videoUrl);
    
    if (!videoId) {
      toast({
        title: 'Error',
        description: 'Invalid YouTube URL',
        variant: 'destructive',
      });
      setIsAdding(false);
      return;
    }

    await addVideoToPlaylist(videoId);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setIsAdding(true);
      
      // Use the stored API key from local storage or fall back to the default key
      const storedKey = user?.id ? localStorage.getItem(`youtube_api_key_${user.id}`) : null;
      const apiKey = storedKey || DEFAULT_YOUTUBE_API_KEY;
      
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
          searchQuery
        )}&type=video&key=${apiKey}`
      );
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      if (!data.items?.[0]) {
        toast({
          title: 'No results',
          description: 'No videos found for your search',
          variant: 'destructive',
        });
        return;
      }

      const videoId = data.items[0].id.videoId;
      await addVideoToPlaylist(videoId);
    } catch (error) {
      console.error('Error searching videos:', error);
      toast({
        title: 'Error',
        description: 'Failed to search videos',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Add from URL</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Paste YouTube video URL..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="bg-white/5 border-white/20"
          />
          <CustomButton
            onClick={handleAddVideo}
            disabled={!videoUrl.trim() || isAdding}
            className="shrink-0"
          >
            <ExternalLink size={16} />
            <span>Add</span>
          </CustomButton>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Search YouTube</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Search for videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white/5 border-white/20"
          />
          <CustomButton
            onClick={handleSearch}
            disabled={!searchQuery.trim() || isAdding}
            className="shrink-0"
          >
            <Search size={16} />
            <span>Search</span>
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default PlaylistEditor;
