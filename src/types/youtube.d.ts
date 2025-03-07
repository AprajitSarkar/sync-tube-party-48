
interface YTPlayer {
  destroy: () => void;
  loadVideoById: (videoId: string) => void;
  cueVideoById: (videoId: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getVideoLoadedFraction: () => number;
  getPlayerState: () => number;
  getPlaybackRate: () => number;
  setPlaybackRate: (rate: number) => void;
  getAvailablePlaybackRates: () => number[];
  getPlaybackQuality: () => string;
  setPlaybackQuality: (quality: string) => void;
  getAvailableQualityLevels: () => string[];
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
  data: number;
}

interface YTPlayerOptions {
  height?: string | number;
  width?: string | number;
  videoId?: string;
  playerVars?: {
    autoplay?: 0 | 1;
    cc_load_policy?: 1;
    color?: 'red' | 'white';
    controls?: 0 | 1 | 2;
    disablekb?: 0 | 1;
    enablejsapi?: 0 | 1;
    end?: number;
    fs?: 0 | 1;
    hl?: string;
    iv_load_policy?: 1 | 3;
    list?: string;
    listType?: 'playlist' | 'user_uploads' | 'search';
    loop?: 0 | 1;
    modestbranding?: 0 | 1;
    origin?: string;
    playlist?: string;
    playsinline?: 0 | 1;
    rel?: 0 | 1;
    start?: number;
    mute?: 0 | 1;
  };
  events?: {
    onReady?: (event: YTPlayerEvent) => void;
    onStateChange?: (event: YTPlayerEvent) => void;
    onPlaybackQualityChange?: (event: YTPlayerEvent) => void;
    onPlaybackRateChange?: (event: YTPlayerEvent) => void;
    onError?: (event: YTPlayerEvent) => void;
    onApiChange?: (event: YTPlayerEvent) => void;
  };
}

interface YTPlayerConstructor {
  new (elementId: string, options: YTPlayerOptions): YTPlayer;
}

interface YT {
  Player: YTPlayerConstructor;
  PlayerState: {
    UNSTARTED: number;
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
}

// Extend the Window interface
interface Window {
  YT?: YT;
  onYouTubeIframeAPIReady?: () => void;
}
