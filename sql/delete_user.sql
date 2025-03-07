
-- Function to delete a user account and associated data
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  uid uuid;
BEGIN
  -- Get the current user ID
  uid := auth.uid();

  -- Delete user's playlist items
  DELETE FROM public.user_playlist_items
  WHERE user_id = uid;

  -- Delete user's playlists
  DELETE FROM public.user_playlists
  WHERE user_id = uid;

  -- Delete user's room participations
  DELETE FROM public.room_participants
  WHERE user_id = uid;

  -- Note: To actually delete the auth.users record, 
  -- you would need to use the Supabase admin API
  -- This function just cleans up the user's data
END;
$$;

-- Set appropriate permissions
GRANT EXECUTE ON FUNCTION public.delete_user() TO authenticated;
