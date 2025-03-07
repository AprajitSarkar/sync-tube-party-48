import React, { useRef, useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { CustomButton } from '@/components/ui/custom-button';
import { Maximize2, Play, Pause, Link2, SkipForward, SkipBack, Share2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface VideoPlayerProps {
  roomId: string;
  userId: string;
}

interface VideoState {
  isPlaying: boolean;
  timestamp: number;
  currentTime: number;
  videoId: string;
}

const VideoPlayer = ({ roomId, userId }: VideoPlayerProps) => {
  const playerRef = useRef<YTPlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoId, setVideoId] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const syncIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        if (firstScriptTag && firstScriptTag.parentNode) {
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else {
          document.head.appendChild(tag);
        }
      }
    };
    
    loadYouTubeAPI();

    const onYouTubeIframeAPIReady = () => {
      if (!playerRef.current && videoId) {
        createPlayer(videoId);
      }
    };

    if (window.YT && window.YT.Player) {
      onYouTubeIframeAPIReady();
    } else {
      window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      if (syncIntervalRef.current) {
        window.clearInterval(syncIntervalRef.current);
      }
    };
  }, [videoId]);

  useEffect(() => {
    const roomSubscription = supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'video_rooms',
        filter: `id=eq.${roomId}`,
      }, (payload: any) => {
        const videoState = payload.new?.video_state as VideoState | undefined;
        if (videoState) {
          handleRemoteStateChange(videoState);
        }
      })
      .subscribe();

    fetchRoomState();

    syncIntervalRef.current = window.setInterval(() => {
      if (playerRef.current && isPlaying) {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);
      }
    }, 1000);

    return () => {
      roomSubscription.unsubscribe();
      if (syncIntervalRef.current) {
        window.clearInterval(syncIntervalRef.current);
      }
    };
  }, [roomId, isPlaying]);

  const fetchRoomState = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('video_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (error) throw error;

      if (data && data.video_state) {
        const videoState = data.video_state as VideoState;
        setVideoId(videoState.videoId || '');
        setIsPlaying(videoState.isPlaying);

        if (playerRef.current && videoState.currentTime) {
          playerRef.current.seekTo(videoState.currentTime);
          if (videoState.isPlaying) {
            playerRef.current.playVideo();
          } else {
            playerRef.current.pauseVideo();
          }
        }
      }
    } catch (error) {
      console.error('Error fetching room state:', error);
      toast({
        title: 'Error',
        description: 'Failed to load room state',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoteStateChange = (videoState: VideoState) => {
    console.log('Remote state change:', videoState);
    
    if (videoState.videoId && videoState.videoId !== videoId) {
      setVideoId(videoState.videoId);
      if (playerRef.current) {
        playerRef.current.loadVideoById(videoState.videoId);
      }
    }

    if (videoState.isPlaying !== isPlaying) {
      setIsPlaying(videoState.isPlaying);
      if (playerRef.current) {
        if (videoState.isPlaying) {
          playerRef.current.playVideo();
        } else {
          playerRef.current.pauseVideo();
        }
      }
    }

    if (playerRef.current && videoState.currentTime !== undefined) {
      const currentTime = playerRef.current.getCurrentTime();
      const timeDiff = Math.abs(currentTime - videoState.currentTime);
      
      if (timeDiff > 3) {
        console.log('Syncing time:', videoState.currentTime);
        playerRef.current.seekTo(videoState.currentTime);
      }
    }
  };

  const createPlayer = (initialVideoId: string) => {
    if (!initialVideoId || !window.YT) return;
    
    try {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      
      if (!document.getElementById('youtube-player')) {
        console.error('YouTube player container not found');
        return;
      }
      
      playerRef.current = new window.YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: initialVideoId,
        playerVars: {
          playsinline: 1,
          modestbranding: 1,
          rel: 0,
          enablejsapi: 1,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: (event) => {
            console.error('YouTube player error:', event.data);
            setIsLoading(false);
            toast({
              title: 'Error',
              description: 'Failed to load video. Please try another one.',
              variant: 'destructive'
            });
          }
        },
      });
    } catch (error) {
      console.error('Error creating YouTube player:', error);
      setIsLoading(false);
    }
  };

  const onPlayerReady = () => {
    setIsPlayerReady(true);
    setIsLoading(false);
  };

  const onPlayerStateChange = (event: YTPlayerEvent) => {
    if (event.data === window.YT?.PlayerState.PLAYING) {
      setIsPlaying(true);
      updateRoomState(true);
    } else if (event.data === window.YT?.PlayerState.PAUSED) {
      setIsPlaying(false);
      updateRoomState(false);
    }
  };

  const updateRoomState = async (playing: boolean) => {
    try {
      if (!playerRef.current) return;
      
      const currentTime = playerRef.current.getCurrentTime();
      
      await supabase
        .from('video_rooms')
        .update({
          video_state: {
            isPlaying: playing,
            timestamp: Date.now(),
            currentTime: Math.floor(currentTime),
            videoId
          }
        })
        .eq('id', roomId);
    } catch (error) {
      console.error('Error updating room state:', error);
    }
  };

  const togglePlayPause = () => {
    if (!playerRef.current) return;
    
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const skipForward = () => {
    if (!playerRef.current) return;
    
    const currentTime = playerRef.current.getCurrentTime();
    const newTime = currentTime + 10;
    playerRef.current.seekTo(newTime);
    
    updateRoomState(isPlaying);
  };

  const skipBackward = () => {
    if (!playerRef.current) return;
    
    const currentTime = playerRef.current.getCurrentTime();
    const newTime = Math.max(0, currentTime - 10);
    playerRef.current.seekTo(newTime);
    
    updateRoomState(isPlaying);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    
    setIsFullscreen(!isFullscreen);
  };

  const extractVideoId = (url: string): string | null => {
    const standardMatch = url.match(/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (standardMatch) return standardMatch[1];
    
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
    
    return null;
  };

  const handleSearch = async () => {
    if (!urlInput.trim()) {
      toast({
        title: 'Empty Search',
        description: 'Please enter a search term or YouTube URL',
        variant: 'destructive'
      });
      return;
    }

    const videoId = extractVideoId(urlInput);
    
    if (videoId) {
      changeVideo(videoId);
      return;
    }
    
    try {
      setIsSearching(true);
      setSearchResults([]);
      
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(urlInput)}`;
      const response = await fetch(searchUrl);
      const html = await response.text();
      
      const videoPattern = /\/watch\?v=([\w-]{11})/g;
      const matches = html.matchAll(videoPattern);
      const uniqueIds = [...new Set([...matches].map(match => match[1]))].slice(0, 5);
      
      const results = await Promise.all(uniqueIds.map(async (id) => {
        try {
          const response = await fetch(`https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=${id}&format=json`);
          const data = await response.json();
          return {
            id,
            url: `https://www.youtube.com/watch?v=${id}`,
            title: data.title || 'Untitled Video'
          };
        } catch (error) {
          return {
            id,
            url: `https://www.youtube.com/watch?v=${id}`,
            title: 'Untitled Video'
          };
        }
      }));
      
      setSearchResults(results);
      
      if (results.length === 0) {
        toast({
          title: 'No Results',
          description: 'No videos found for your search query',
          variant: 'destructive'
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

  const loadSearchResult = (result: { id: string; title: string }) => {
    changeVideo(result.id);
    setSearchResults([]);
  };

  const changeVideo = async (newVideoId: string) => {
    try {
      setVideoId(newVideoId);
      
      await supabase
        .from('video_rooms')
        .update({
          video_state: {
            isPlaying: false,
            timestamp: Date.now(),
            currentTime: 0,
            videoId: newVideoId
          }
        })
        .eq('id', roomId);
        
      setUrlInput('');
      
      toast({
        title: 'Video Changed',
        description: 'New video has been loaded',
      });
    } catch (error) {
      console.error('Error changing video:', error);
      toast({
        title: 'Error',
        description: 'Failed to change video',
        variant: 'destructive'
      });
    }
  };

  const shareRoom = () => {
    const shareUrl = `${window.location.origin}/room/${roomId}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join my Sync Tube Party room',
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

  return (
    <GlassCard className="p-0 overflow-hidden" ref={containerRef}>
      <div className="relative w-full aspect-video">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <LoadingSpinner size="lg" />
          </div>
        )}
        <div id="youtube-player" className="w-full h-full" />
      </div>
      
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-2">
            <CustomButton
              size="icon"
              variant="ghost"
              onClick={skipBackward}
              disabled={!isPlayerReady}
              title="Skip back 10 seconds"
            >
              <SkipBack size={20} />
            </CustomButton>
            
            <CustomButton
              size="icon"
              variant="ghost"
              onClick={togglePlayPause}
              disabled={!isPlayerReady}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </CustomButton>
            
            <CustomButton
              size="icon"
              variant="ghost"
              onClick={skipForward}
              disabled={!isPlayerReady}
              title="Skip forward 10 seconds"
            >
              <SkipForward size={20} />
            </CustomButton>
            
            <CustomButton
              size="icon"
              variant="ghost"
              onClick={toggleFullscreen}
            >
              <Maximize2 size={20} />
            </CustomButton>
            
            <CustomButton
              size="icon"
              variant="ghost"
              onClick={shareRoom}
              title="Share room"
            >
              <Share2 size={20} />
            </CustomButton>
          </div>
          
          <div className="flex-1 max-w-md">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="YouTube URL or search term"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="h-10 bg-white/5 border-white/10"
              />
              <CustomButton
                variant="glow"
                size="sm"
                onClick={handleSearch}
                isLoading={isSearching}
                icon={<Link2 size={16} />}
              >
                Search
              </CustomButton>
            </div>
          </div>
        </div>
        
        {searchResults.length > 0 && (
          <div className="bg-black/30 backdrop-blur-sm rounded-md p-3 max-h-60 overflow-y-auto">
            <h3 className="text-sm font-medium mb-2">Search Results</h3>
            <div className="space-y-2">
              {searchResults.map((result) => (
                <div 
                  key={result.id}
                  onClick={() => loadSearchResult(result)}
                  className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-md cursor-pointer transition-colors"
                >
                  <img 
                    src={`https://i.ytimg.com/vi/${result.id}/default.jpg`}
                    alt={result.title}
                    className="w-16 h-12 object-cover rounded"
                  />
                  <div className="flex-1 truncate">
                    <p className="text-sm font-medium truncate">{result.title}</p>
                  </div>
                  <Play size={16} className="text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default VideoPlayer;
