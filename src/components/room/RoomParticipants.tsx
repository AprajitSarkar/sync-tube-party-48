
import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Share2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { CustomButton } from '@/components/ui/custom-button';

interface RoomParticipantsProps {
  roomId: string;
  currentUserId: string;
}

interface Participant {
  id: string;
  email: string;
  last_active: string;
}

const RoomParticipants = ({ roomId, currentUserId }: RoomParticipantsProps) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchParticipants();
    
    // Update user's presence
    updateUserPresence();
    
    // Set up a heartbeat to update presence
    const heartbeatInterval = setInterval(updateUserPresence, 30000);
    
    // Subscribe to presence changes
    const presenceSubscription = supabase
      .channel(`room-presence:${roomId}`)
      .on('presence', { event: 'sync' }, () => {
        fetchParticipants();
      })
      .subscribe();
      
    return () => {
      clearInterval(heartbeatInterval);
      presenceSubscription.unsubscribe();
    };
  }, [roomId, currentUserId]);

  const fetchParticipants = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('room_participants')
        .select('user_id, last_active')
        .eq('room_id', roomId)
        .order('last_active', { ascending: false });

      if (error) throw error;

      // Get user details for each participant
      const participantsWithDetails = await Promise.all(
        (data || []).map(async (participant) => {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', participant.user_id)
            .single();

          if (userError) throw userError;

          return {
            id: participant.user_id,
            email: userData?.email || 'Anonymous',
            last_active: participant.last_active,
          };
        })
      );

      setParticipants(participantsWithDetails);
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserPresence = async () => {
    try {
      // First check if the participant record exists
      const { data, error: checkError } = await supabase
        .from('room_participants')
        .select('user_id')
        .eq('room_id', roomId)
        .eq('user_id', currentUserId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      // If the record doesn't exist, insert it
      if (!data) {
        const { error: insertError } = await supabase
          .from('room_participants')
          .insert({
            room_id: roomId,
            user_id: currentUserId,
            last_active: new Date().toISOString(),
          });
        
        if (insertError) throw insertError;
      } else {
        // If the record exists, update it
        const { error: updateError } = await supabase
          .from('room_participants')
          .update({
            last_active: new Date().toISOString(),
          })
          .eq('room_id', roomId)
          .eq('user_id', currentUserId);
        
        if (updateError) throw updateError;
      }
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  };

  const shareRoom = () => {
    const shareUrl = `${window.location.origin}/room/${roomId}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join my Sync Tube Party room',
        text: 'Watch YouTube videos together!',
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast({
          title: 'Room link copied',
          description: 'Share this link with friends to invite them',
        });
      });
    }
  };

  // Detect if a user is active (less than 2 minutes ago)
  const isUserActive = (lastActive: string) => {
    const twoMinutesAgo = new Date();
    twoMinutesAgo.setMinutes(twoMinutesAgo.getMinutes() - 2);
    return new Date(lastActive) > twoMinutesAgo;
  };

  return (
    <GlassCard>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Room Participants</h3>
        <CustomButton 
          size="sm" 
          variant="outline"
          onClick={shareRoom}
          icon={<Share2 size={16} />}
        >
          Share
        </CustomButton>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-4">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="space-y-3">
          {participants.length === 0 ? (
            <p className="text-sm text-muted-foreground">No participants yet</p>
          ) : (
            participants.map((participant) => (
              <div key={participant.id} className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    {participant.email[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{participant.email}</p>
                </div>
                {participant.id === currentUserId && (
                  <Badge variant="outline" className="ml-2">You</Badge>
                )}
                <div className="w-2 h-2 rounded-full bg-green-500 ml-1">
                  {isUserActive(participant.last_active) && (
                    <div className="absolute w-2 h-2 rounded-full bg-green-500 animate-ping" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </GlassCard>
  );
};

export default RoomParticipants;
