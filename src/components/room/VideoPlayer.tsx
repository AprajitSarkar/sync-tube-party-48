
import React, { useRef, useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { CustomButton } from '@/components/ui/custom-button';
import { Maximize2, Play, Pause, Search, Link2 } from 'lucide-react';
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
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoId, setVideoId] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // Initialize player when API is ready
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
    };
  }, [videoId]);

  useEffect(() => {
    // Subscribe to room updates
    const roomSubscription = supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'video_rooms',
        filter: `id=eq.${roomId}`,
      }, (payload) => {
        const videoState = payload.new.video_state as VideoState;
        if (videoState) {
          handleRemoteStateChange(videoState);
        }
      })
      .subscribe();

    // Get initial room state
    fetchRoomState();

    return () => {
      roomSubscription.unsubscribe();
    };
  }, [roomId]);

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
    // Update local state based on remote changes
    if (videoState.videoId && videoState.videoId !== videoId) {
      setVideoId(videoState.videoId);
      if (playerRef.current) {
        playerRef.current.loadVideoById(videoState.videoId);
      }
    }

    // Handle play/pause state
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

    // Handle time sync (with 3-second threshold to avoid constant seeking)
    if (playerRef.current && videoState.currentTime) {
      const currentTime = playerRef.current.getCurrentTime();
      const timeDiff = Math.abs(currentTime - videoState.currentTime);
      
      if (timeDiff > 3) {
        playerRef.current.seekTo(videoState.currentTime);
      }
    }
  };

  const createPlayer = (initialVideoId: string) => {
    if (!initialVideoId) return;
    
    playerRef.current = new window.YT.Player('youtube-player', {
      height: '100%',
      width: '100%',
      videoId: initialVideoId,
      playerVars: {
        playsinline: 1,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    });
  };

  const onPlayerReady = () => {
    setIsPlayerReady(true);
    setIsLoading(false);
  };

  const onPlayerStateChange = (event: any) => {
    // Update local state
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      updateRoomState(true);
    } else if (event.data === window.YT.PlayerState.PAUSED) {
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
    // Handle standard YouTube URLs
    const standardMatch = url.match(/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (standardMatch) return standardMatch[1];
    
    // Handle direct video ID input (if it's exactly 11 chars)
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
    
    return null;
  };

  const changeVideo = async () => {
    const newVideoId = extractVideoId(urlInput);
    
    if (!newVideoId) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid YouTube URL or video ID',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setVideoId(newVideoId);
      
      // Update room with new video
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
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
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
              onClick={toggleFullscreen}
            >
              <Maximize2 size={20} />
            </CustomButton>
          </div>
          
          <div className="flex-1 max-w-md mx-auto">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="YouTube URL or video ID"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="h-10 bg-white/5 border-white/10"
              />
              <CustomButton
                variant="glow"
                size="sm"
                onClick={changeVideo}
                icon={<Link2 size={16} />}
              >
                Load
              </CustomButton>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default VideoPlayer;
