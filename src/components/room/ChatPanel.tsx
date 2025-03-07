
import React, { useState, useEffect, useRef } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { CustomButton } from '@/components/ui/custom-button';
import { SendHorizontal } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import ChatMessage from './ChatMessage';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import LogToast from '@/components/common/LogToast';

interface ChatPanelProps {
  roomId: string;
}

interface Message {
  id: string;
  user_id: string;
  room_id: string;
  content: string;
  created_at: string;
  user_email?: string;
}

const ChatPanel = ({ roomId }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [logMessage, setLogMessage] = useState('');
  const [logVisible, setLogVisible] = useState(false);

  // Fetch messages and subscribe to new ones
  useEffect(() => {
    fetchMessages();

    const messagesSubscription = supabase
      .channel(`messages:${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `room_id=eq.${roomId}`,
      }, (payload) => {
        const newMessage = payload.new as Message;
        
        // Add user email to the message
        getUserEmail(newMessage.user_id).then((userEmail) => {
          setMessages((prev) => [
            ...prev, 
            { ...newMessage, user_email: userEmail }
          ]);
        });
      })
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [roomId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const showLog = (message: string) => {
    setLogMessage(message);
    setLogVisible(true);
  };

  const hideLog = () => {
    setLogVisible(false);
  };

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      showLog("Loading messages...");
      
      // Check if roomId is valid UUID
      if (!roomId || !roomId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
        // For string IDs, convert to proper format
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('room_id', roomId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        
        // Add user emails to messages
        const messagesWithUserEmails = await Promise.all(
          (data || []).map(async (message) => {
            const userEmail = await getUserEmail(message.user_id);
            return { ...message, user_email: userEmail };
          })
        );

        setMessages(messagesWithUserEmails);
      } else {
        // For UUID format
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('room_id', roomId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        
        // Add user emails to messages
        const messagesWithUserEmails = await Promise.all(
          (data || []).map(async (message) => {
            const userEmail = await getUserEmail(message.user_id);
            return { ...message, user_email: userEmail };
          })
        );

        setMessages(messagesWithUserEmails);
      }
      
      showLog("Messages loaded");
    } catch (error) {
      console.error('Error fetching messages:', error);
      showLog("Failed to load messages");
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getUserEmail = async (userId: string): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data?.email || 'Anonymous';
    } catch {
      return 'Anonymous';
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !user) return;

    try {
      setIsSending(true);
      showLog("Sending message...");
      
      const { error } = await supabase
        .from('messages')
        .insert({
          room_id: roomId,
          user_id: user.id,
          content: inputMessage.trim(),
        });

      if (error) throw error;
      setInputMessage('');
      showLog("Message sent");
    } catch (error) {
      console.error('Error sending message:', error);
      showLog("Failed to send message");
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <LogToast 
        message={logMessage} 
        visible={logVisible} 
        onHide={hideLog} 
        duration={1000}
      />
      
      <GlassCard className="flex flex-col h-full">
        <div className="p-3 border-b border-white/10">
          <h3 className="font-medium">Chat</h3>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <p>No messages yet. Say hello!</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {messages.map((message) => (
                <ChatMessage 
                  key={message.id} 
                  message={message} 
                  currentUser={user}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
        
        <div className="p-3 border-t border-white/10">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-10 bg-white/5 border-white/10"
              disabled={isSending}
            />
            <CustomButton
              size="sm"
              variant="glow"
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isSending}
              isLoading={isSending}
            >
              <SendHorizontal size={18} />
            </CustomButton>
          </div>
        </div>
      </GlassCard>
    </>
  );
};

export default ChatPanel;
