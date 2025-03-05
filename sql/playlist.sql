
-- Create playlist_items table for storing videos in a room's playlist
CREATE TABLE IF NOT EXISTS public.playlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.video_rooms(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  title TEXT NOT NULL,
  added_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Add constraints
  CONSTRAINT fk_room FOREIGN KEY (room_id) REFERENCES video_rooms(id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_playlist_room_id ON public.playlist_items(room_id);

-- Enable RLS
ALTER TABLE public.playlist_items ENABLE ROW LEVEL SECURITY;

-- Create policies for playlist items
CREATE POLICY "Allow users to view playlist items" ON public.playlist_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow users to add playlist items" ON public.playlist_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = added_by);

CREATE POLICY "Allow users to update playlist items in their rooms" ON public.playlist_items
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM room_participants 
      WHERE room_id = playlist_items.room_id
    )
  );

CREATE POLICY "Allow users to delete playlist items they added" ON public.playlist_items
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = added_by OR 
    auth.uid() IN (
      SELECT created_by FROM video_rooms 
      WHERE id = playlist_items.room_id
    )
  );
