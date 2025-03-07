
-- Add extension for UUID support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add extension for generating random strings (used for short room IDs)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to generate short room IDs (5 characters)
CREATE OR REPLACE FUNCTION generate_short_id(length integer DEFAULT 5)
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  result text := '';
  i integer := 0;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Video rooms table with short IDs
CREATE TABLE video_rooms (
  id TEXT PRIMARY KEY DEFAULT generate_short_id(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  video_state JSONB DEFAULT '{
    "isPlaying": false,
    "timestamp": 0,
    "currentTime": 0,
    "videoId": ""
  }'::jsonb
);

-- Add function to update last_activity timestamp
CREATE OR REPLACE FUNCTION update_room_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_activity when room is updated
CREATE TRIGGER update_room_last_activity
  BEFORE UPDATE ON video_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_room_activity();

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
  room_id TEXT NOT NULL REFERENCES video_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- Index for faster room participant queries
CREATE INDEX room_participants_room_id_idx ON room_participants(room_id);
CREATE INDEX room_participants_user_id_idx ON room_participants(user_id);

-- Function to clean up inactive rooms (no activity for 24 hours)
CREATE OR REPLACE FUNCTION cleanup_inactive_rooms()
RETURNS void AS $$
BEGIN
  -- Delete rooms with no activity for 24 hours
  DELETE FROM video_rooms
  WHERE last_activity < NOW() - INTERVAL '24 hours';
  
  -- Delete participant records with no activity for 2 hours
  DELETE FROM room_participants
  WHERE last_active < NOW() - INTERVAL '2 hours';
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE video_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;

-- Policy for video_rooms table
-- Anyone can view public rooms
CREATE POLICY "Anyone can view rooms" 
  ON video_rooms 
  FOR SELECT 
  USING (true);

-- Only authenticated users can create rooms
CREATE POLICY "Authenticated users can create rooms" 
  ON video_rooms 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = created_by);

-- Only room creators can update their own rooms
CREATE POLICY "Room creators can update their own rooms" 
  ON video_rooms 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = created_by OR
        -- Allow all participants to update video_state
        EXISTS (
          SELECT 1 FROM room_participants
          WHERE room_participants.room_id = video_rooms.id
          AND room_participants.user_id = auth.uid()
        ));

-- Only room creators can delete their own rooms
CREATE POLICY "Room creators can delete their own rooms" 
  ON video_rooms 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = created_by);

-- Policies for room_participants table
-- Anyone can view participants in a room
CREATE POLICY "Anyone can view room participants" 
  ON room_participants 
  FOR SELECT 
  USING (true);

-- Users can insert themselves as participants
CREATE POLICY "Users can add themselves as participants" 
  ON room_participants 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own participant data
CREATE POLICY "Users can update their own participant data" 
  ON room_participants 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own participant data
CREATE POLICY "Users can delete their own participant data" 
  ON room_participants 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Room creators can manage all participants in their rooms
CREATE POLICY "Room creators can manage all participants" 
  ON room_participants 
  FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM video_rooms 
      WHERE video_rooms.id = room_participants.room_id 
      AND video_rooms.created_by = auth.uid()
    )
  );
