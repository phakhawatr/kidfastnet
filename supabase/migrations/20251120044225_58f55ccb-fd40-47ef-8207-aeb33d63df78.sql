-- Fix security warning: Add search_path to update_stem_updated_at function
CREATE OR REPLACE FUNCTION public.update_stem_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
