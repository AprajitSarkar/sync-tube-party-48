
interface YT {
  Player: {
    new (
      elementId: string,
      options: {
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
          listType?: 'playlist' | 'search' | 'user_uploads';
          loop?: 0 | 1;
          modestbranding?: 0 | 1;
          origin?: string;
          playlist?: string;
          playsinline?: 0 | 1;
          rel?: 0 | 1;
          start?: number;
          widget_referrer?: string;
        };
        events?: {
          onReady?: (event: YT.PlayerEvent) => void;
          onStateChange?: (event: YT.PlayerEvent) => void;
          onPlaybackQualityChange?: (event: YT.PlayerEvent) => void;
          onPlaybackRateChange?: (event: YT.PlayerEvent) => void;
          onError?: (event: YT.PlayerEvent) => void;
          onApiChange?: (event: YT.PlayerEvent) => void;
        };
      }
    ): YT.Player;
  };
  PlayerState: {
    UNSTARTED: -1;
    ENDED: 0;
    PLAYING: 1;
    PAUSED: 2;
    BUFFERING: 3;
    CUED: 5;
  };
}

declare namespace YT {
  interface Player {
    playVideo(): void;
    pauseVideo(): void;
    stopVideo(): void;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    clearVideo(): void;
    nextVideo(): void;
    previousVideo(): void;
    playVideoAt(index: number): void;
    mute(): void;
    unMute(): void;
    isMuted(): boolean;
    setVolume(volume: number): void;
    getVolume(): number;
    setSize(width: number, height: number): object;
    getPlaybackRate(): number;
    setPlaybackRate(suggestedRate: number): void;
    getAvailablePlaybackRates(): number[];
    setLoop(loopPlaylists: boolean): void;
    setShuffle(shufflePlaylist: boolean): void;
    getVideoLoadedFraction(): number;
    getPlayerState(): number;
    getCurrentTime(): number;
    getPlaybackQuality(): string;
    setPlaybackQuality(suggestedQuality: string): void;
    getAvailableQualityLevels(): string[];
    getDuration(): number;
    getVideoUrl(): string;
    getVideoEmbedCode(): string;
    getVideoData(): {
      video_id?: string;
      author?: string;
      title?: string;
    };
    addEventListener(event: string, listener: (event: PlayerEvent) => void): void;
    removeEventListener(event: string, listener: (event: PlayerEvent) => void): void;
    getIframe(): HTMLIFrameElement;
    destroy(): void;
    cueVideoById(videoId: string, startSeconds?: number, suggestedQuality?: string): void;
    loadVideoById(videoId: string, startSeconds?: number, suggestedQuality?: string): void;
    cueVideoByUrl(mediaContentUrl: string, startSeconds?: number, suggestedQuality?: string): void;
    loadVideoByUrl(mediaContentUrl: string, startSeconds?: number, suggestedQuality?: string): void;
  }

  interface PlayerEvent {
    target: Player;
    data: any;
  }
}

interface Window {
  YT?: YT;
  onYouTubeIframeAPIReady?: () => void;
}
