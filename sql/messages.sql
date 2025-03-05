
-- Messages table for storing chat messages in rooms
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.video_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Add indices for faster lookups
  CONSTRAINT fk_room FOREIGN KEY (room_id) REFERENCES video_rooms(id) ON DELETE CASCADE
);

-- Create an index on the room_id column for faster message retrieval by room
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON public.messages(room_id);

-- Enable RLS to control row access
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for message access
-- Allow any authenticated user to view messages in rooms they have access to
CREATE POLICY "Allow users to view messages in accessible rooms" ON public.messages
  FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM room_participants WHERE room_id = messages.room_id
  ));

-- Allow any authenticated user to insert their own messages
CREATE POLICY "Allow users to insert their own messages" ON public.messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profile access
CREATE POLICY "Allow users to view all profiles" ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow users to update their own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Ensure room_participants table has the correct structure
CREATE TABLE IF NOT EXISTS public.room_participants (
  room_id UUID NOT NULL REFERENCES public.video_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_active TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (room_id, user_id)
);

-- Enable RLS for room participants
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;

-- Create policies for room participant access
CREATE POLICY "Allow users to view room participants" ON public.room_participants
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow users to join rooms" ON public.room_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Trigger function to create profile entry on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update function for room_participants to update last_active
CREATE OR REPLACE FUNCTION public.update_room_participant()
RETURNS TRIGGER AS $$
BEGIN
  -- If the record already exists, update the last_active timestamp
  IF (TG_OP = 'INSERT' AND EXISTS (
    SELECT 1 FROM public.room_participants 
    WHERE room_id = NEW.room_id AND user_id = NEW.user_id
  )) THEN
    UPDATE public.room_participants
    SET last_active = NEW.last_active
    WHERE room_id = NEW.room_id AND user_id = NEW.user_id;
    RETURN NULL; -- Prevent insert
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for room participants upsert
DROP TRIGGER IF EXISTS before_participant_insert ON public.room_participants;
CREATE TRIGGER before_participant_insert
  BEFORE INSERT ON public.room_participants
  FOR EACH ROW EXECUTE FUNCTION public.update_room_participant();
