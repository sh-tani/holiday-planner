CREATE OR REPLACE FUNCTION public.delete_user_account_data(
  target_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Target user is required';
  END IF;

  DELETE FROM public.schedule
  WHERE user_id = target_user_id;

  DELETE FROM public.user_mountains
  WHERE user_id = target_user_id;

  DELETE FROM public.profiles
  WHERE id = target_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_user_account_data(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_user_account_data(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.delete_user_account_data(uuid) FROM authenticated;

GRANT EXECUTE ON FUNCTION public.delete_user_account_data(uuid) TO service_role;