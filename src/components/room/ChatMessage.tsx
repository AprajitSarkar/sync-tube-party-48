
import React from 'react';
import { User } from '@supabase/supabase-js';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { GlassCard } from '@/components/ui/glass-card';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessageProps {
  message: {
    id: string;
    user_id: string;
    room_id: string;
    content: string;
    created_at: string;
    user_email?: string;
  };
  currentUser: User | null;
}

const ChatMessage = ({ message, currentUser }: ChatMessageProps) => {
  const isCurrentUser = message.user_id === currentUser?.id;
  const userInitial = message.user_email ? message.user_email[0].toUpperCase() : '?';
  const messageTime = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });

  // Generate random but consistent color based on user_id
  const getColorFromUserId = (userId: string) => {
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  const userColor = getColorFromUserId(message.user_id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 mb-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isCurrentUser && (
        <Avatar className="w-8 h-8">
          <AvatarFallback style={{ backgroundColor: userColor }}>
            {userInitial}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-[75%] flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        <GlassCard 
          className={`p-3 ${isCurrentUser ? 'bg-accent/20' : 'bg-white/10'}`}
          withBorder={true}
          padding="none"
        >
          <p className="text-sm">{message.content}</p>
        </GlassCard>
        <span className="text-xs text-muted-foreground mt-1">{messageTime}</span>
      </div>
      
      {isCurrentUser && (
        <Avatar className="w-8 h-8">
          <AvatarFallback style={{ backgroundColor: userColor }}>
            {userInitial}
          </AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  );
};

export default ChatMessage;
