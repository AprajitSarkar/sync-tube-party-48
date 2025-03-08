
-- Create extension for UUID support
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
CREATE TABLE IF NOT EXISTS video_rooms (
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

-- Function to update last_activity timestamp
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

-- Room participants
CREATE TABLE IF NOT EXISTS room_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id TEXT NOT NULL REFERENCES video_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- Index for faster participant queries
CREATE INDEX IF NOT EXISTS idx_room_participants_room_id ON room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_user_id ON room_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_last_active ON room_participants(last_active);

-- Function to update participant last_active timestamp
CREATE OR REPLACE FUNCTION update_participant_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_active := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_active when participant is updated
CREATE TRIGGER update_participant_last_activity
  BEFORE UPDATE ON room_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_participant_activity();

-- Function to clean up inactive participants and rooms
CREATE OR REPLACE FUNCTION cleanup_inactive_rooms()
RETURNS void AS $$
BEGIN
  -- Delete participants inactive for more than 30 minutes
  DELETE FROM room_participants
  WHERE last_active < NOW() - INTERVAL '30 minutes';
  
  -- Only delete rooms that have no participants and no activity for 24 hours
  DELETE FROM video_rooms
  WHERE id IN (
    SELECT v.id 
    FROM video_rooms v
    LEFT JOIN room_participants p ON v.id = p.room_id
    WHERE p.id IS NULL 
    AND v.last_activity < NOW() - INTERVAL '24 hours'
  );
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE video_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;

-- Policies for video_rooms
CREATE POLICY "Anyone can view rooms" 
  ON video_rooms FOR SELECT USING (true);

CREATE POLICY "Users can create rooms" 
  ON video_rooms FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Room creators and participants can update rooms" 
  ON video_rooms FOR UPDATE 
  TO authenticated 
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM room_participants
      WHERE room_participants.room_id = video_rooms.id
      AND room_participants.user_id = auth.uid()
      AND room_participants.last_active > NOW() - INTERVAL '30 minutes'
    )
  );

CREATE POLICY "Room creators can delete their rooms" 
  ON video_rooms FOR DELETE 
  TO authenticated 
  USING (auth.uid() = created_by);

-- Policies for room_participants
CREATE POLICY "Anyone can view participants" 
  ON room_participants FOR SELECT 
  USING (true);

CREATE POLICY "Users can join rooms" 
  ON room_participants FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their presence" 
  ON room_participants FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can leave rooms" 
  ON room_participants FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);
