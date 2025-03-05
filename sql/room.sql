
-- Video rooms table
CREATE TABLE video_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  video_state JSONB DEFAULT '{
    "isPlaying": false,
    "timestamp": 0,
    "currentTime": 0,
    "videoId": ""
  }'::jsonb
);

-- Trigger to delete related data when a room is deleted
CREATE OR REPLACE FUNCTION delete_room_related_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete messages associated with the room
  DELETE FROM messages WHERE room_id = OLD.id;
  
  -- Delete playlist items associated with the room
  DELETE FROM playlist_items WHERE room_id = OLD.id;
  
  -- Delete room participants
  DELETE FROM room_participants WHERE room_id = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_room_delete
  BEFORE DELETE ON video_rooms
  FOR EACH ROW
  EXECUTE FUNCTION delete_room_related_data();

-- Room participants (for tracking users in rooms)
CREATE TABLE room_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES video_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- Index for faster room participant queries
CREATE INDEX room_participants_room_id_idx ON room_participants(room_id);
CREATE INDEX room_participants_user_id_idx ON room_participants(user_id);
