
import React from 'react';
import { User } from '@supabase/supabase-js';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
    const colors = [
      '#5B68DF', // Blue
      '#D259A1', // Pink
      '#FF7A50', // Orange
      '#61C454', // Green
      '#8A5CF5', // Purple
    ];
    
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const userColor = getColorFromUserId(message.user_id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-5 relative"
    >
      <div className="flex items-start gap-3">
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarFallback style={{ backgroundColor: userColor, color: 'white' }}>
            {userInitial}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className="font-medium text-sm text-white">
              {isCurrentUser ? 'You' : (message.user_email?.split('@')[0] || 'Anonymous')}
            </span>
            <span className="text-xs text-gray-400">{messageTime}</span>
          </div>
          
          <div className="text-sm bg-transparent text-white mt-1 max-w-[250px]">
            {message.content}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
