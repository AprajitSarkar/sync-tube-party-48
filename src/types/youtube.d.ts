
interface Window {
  YT: {
    Player: new (
      elementId: string,
      options: {
        height: string | number;
        width: string | number;
        videoId: string;
        playerVars?: Record<string, any>;
        events?: {
          onReady?: (event: YTPlayerEvent) => void;
          onStateChange?: (event: YTPlayerEvent) => void;
          onError?: (event: YTPlayerEvent) => void;
        };
      }
    ) => YTPlayer;
    PlayerState: {
      UNSTARTED: number;
      ENDED: number;
      PLAYING: number;
      PAUSED: number;
      BUFFERING: number;
      CUED: number;
    };
  };
  onYouTubeIframeAPIReady: () => void;
}

interface YTPlayer {
  destroy: () => void;
  loadVideoById: (videoId: string, startSeconds?: number) => void;
  cueVideoById: (videoId: string, startSeconds?: number) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getVideoLoadedFraction: () => number;
  getPlayerState: () => number;
  getVolume: () => number;
  setVolume: (volume: number) => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  getVideoData: () => {
    video_id: string;
    author: string;
    title: string;
    isPlayable: boolean;
    errorCode: string | null;
    [key: string]: any;
  };
}

interface YTPlayerEvent {
  target: YTPlayer;
  data?: any;
}
