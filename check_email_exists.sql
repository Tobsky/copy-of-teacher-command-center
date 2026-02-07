-- Add this to your Supabase SQL Editor to enable email checking on sign-up

CREATE OR REPLACE FUNCTION public.email_exists(email_check text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth -- Secure execution context
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE email = email_check
  );
END;
$$;

-- IMPORTANT: Grant permission so anyone (including logged out users) can check if email exists
GRANT EXECUTE ON FUNCTION public.email_exists(text) TO anon, authenticated;
