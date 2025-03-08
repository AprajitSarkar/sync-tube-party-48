
-- Create playlist_items table for storing videos in a room's playlist
CREATE TABLE IF NOT EXISTS public.playlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id TEXT NOT NULL REFERENCES public.video_rooms(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_playlist_video_id ON public.playlist_items(video_id);
CREATE INDEX IF NOT EXISTS idx_playlist_position ON public.playlist_items(position);

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

-- Create user playlists tables
CREATE TABLE IF NOT EXISTS public.user_playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  playlist_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, playlist_name)
);

-- Update the user_playlist_items table with a more comprehensive structure
CREATE TABLE IF NOT EXISTS public.user_playlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID REFERENCES public.user_playlists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  playlist_name TEXT NOT NULL,
  title TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_playlists_user_id ON public.user_playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_user_playlist_items_playlist_id ON public.user_playlist_items(playlist_id);
CREATE INDEX IF NOT EXISTS idx_user_playlist_items_user_id ON public.user_playlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_user_playlist_items_playlist_name ON public.user_playlist_items(playlist_name);

-- Enable RLS
ALTER TABLE public.user_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_playlist_items ENABLE ROW LEVEL SECURITY;

-- Create policies for user playlists
CREATE POLICY "Users can view their own playlists" ON public.user_playlists
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own playlists" ON public.user_playlists
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists" ON public.user_playlists
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists" ON public.user_playlists
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for user playlist items
CREATE POLICY "Users can view their own playlist items" ON public.user_playlist_items
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add items to their own playlists" ON public.user_playlist_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlist items" ON public.user_playlist_items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlist items" ON public.user_playlist_items
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
