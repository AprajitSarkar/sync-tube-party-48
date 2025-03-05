
import React from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Draggable } from 'react-beautiful-dnd';
import { Play, Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlaylistItemProps {
  videoItem: {
    id: string;
    title: string;
    videoId: string;
  };
  index: number;
  isPlaying: boolean;
  onPlay: (videoId: string) => void;
  onRemove: (id: string) => void;
}

const PlaylistItem = ({ videoItem, index, isPlaying, onPlay, onRemove }: PlaylistItemProps) => {
  return (
    <Draggable draggableId={videoItem.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="mb-2"
        >
          <GlassCard
            className={cn(
              "transition-all duration-200 p-2",
              isPlaying ? "border-accent bg-accent/10" : "bg-white/5",
              snapshot.isDragging && "shadow-lg rotate-1"
            )}
          >
            <div className="flex items-center gap-2">
              <div {...provided.dragHandleProps} className="cursor-grab p-1">
                <GripVertical size={16} className="text-muted-foreground" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {videoItem.title}
                </p>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onPlay(videoItem.videoId)}
                  className="p-1 rounded-full hover:bg-white/10 transition"
                >
                  <Play size={16} className={isPlaying ? "text-accent" : ""} />
                </button>
                <button
                  onClick={() => onRemove(videoItem.id)}
                  className="p-1 rounded-full hover:bg-white/10 transition"
                >
                  <Trash2 size={16} className="text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </Draggable>
  );
};

export default PlaylistItem;
