
-- Create user playlists table
CREATE TABLE IF NOT EXISTS public.user_playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Combination of user_id and name must be unique
  CONSTRAINT unique_playlist_name_per_user UNIQUE (user_id, name)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_playlists_user_id ON public.user_playlists(user_id);

-- Enable RLS
ALTER TABLE public.user_playlists ENABLE ROW LEVEL SECURITY;

-- Create policies for user playlists
CREATE POLICY "Allow users to view their own playlists" ON public.user_playlists
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own playlists" ON public.user_playlists
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own playlists" ON public.user_playlists
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own playlists" ON public.user_playlists
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create user playlist items table
CREATE TABLE IF NOT EXISTS public.user_playlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID NOT NULL REFERENCES public.user_playlists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  title TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indices for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_playlist_items_user_id ON public.user_playlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_user_playlist_items_playlist_id ON public.user_playlist_items(playlist_id);

-- Enable RLS
ALTER TABLE public.user_playlist_items ENABLE ROW LEVEL SECURITY;

-- Create policies for user playlist items
CREATE POLICY "Allow users to view their own playlist items" ON public.user_playlist_items
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own playlist items" ON public.user_playlist_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own playlist items" ON public.user_playlist_items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own playlist items" ON public.user_playlist_items
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
