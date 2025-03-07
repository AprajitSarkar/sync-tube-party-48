
import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Play, Trash2, Plus } from 'lucide-react';
import { CustomButton } from '@/components/ui/custom-button';

interface PlaylistItemProps {
  videoItem: {
    id: string;
    title: string;
    videoId: string;
  };
  index: number;
  isPlaying: boolean;
  onPlay: (id: string) => void;
  onRemove: (id: string) => void;
  onAddToUserPlaylist?: (videoId: string, title: string) => void;
}

const PlaylistItem = ({ 
  videoItem, 
  index, 
  isPlaying, 
  onPlay, 
  onRemove,
  onAddToUserPlaylist 
}: PlaylistItemProps) => {
  return (
    <Draggable draggableId={videoItem.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-2 p-2 rounded-md transition-colors ${
            isPlaying ? 'bg-primary/20 border border-primary/30' : 'bg-white/5 hover:bg-white/10'
          } ${snapshot.isDragging ? 'opacity-70' : ''}`}
        >
          <div className="flex items-center gap-2">
            <div className="w-10 h-8 bg-black/40 rounded overflow-hidden flex-shrink-0">
              <img 
                src={`https://i.ytimg.com/vi/${videoItem.videoId}/default.jpg`} 
                alt={videoItem.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
            </div>
            
            <div className="flex flex-col flex-1 min-w-0">
              <p className={`text-xs truncate mb-1 ${isPlaying ? 'text-primary' : 'text-white'}`}>
                {videoItem.title}
              </p>
              
              <div className="flex items-center gap-1">
                <CustomButton
                  size="sm"
                  variant="ghost"
                  onClick={() => onPlay(videoItem.videoId)}
                  className="h-5 px-1.5 text-[10px] text-white hover:bg-white/10 min-w-0"
                  title="Play now"
                >
                  <Play size={10} className={isPlaying ? 'fill-primary/20' : ''} />
                  <span className="ml-0.5">Play</span>
                </CustomButton>
                
                {onAddToUserPlaylist && (
                  <CustomButton
                    size="sm"
                    variant="ghost"
                    onClick={() => onAddToUserPlaylist(videoItem.videoId, videoItem.title)}
                    className="h-5 px-1.5 text-[10px] text-white hover:bg-white/10 min-w-0"
                    title="Add to my playlist"
                  >
                    <Plus size={10} />
                    <span className="ml-0.5">Save</span>
                  </CustomButton>
                )}
                
                <CustomButton
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemove(videoItem.id)}
                  className="h-5 px-1.5 text-[10px] text-white hover:bg-white/10 hover:text-red-400 min-w-0"
                  title="Remove from playlist"
                >
                  <Trash2 size={10} />
                  <span className="ml-0.5">Remove</span>
                </CustomButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default PlaylistItem;
