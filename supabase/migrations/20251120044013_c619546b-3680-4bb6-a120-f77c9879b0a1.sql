-- Create stem_activities table to track user progress in STEM activities
CREATE TABLE IF NOT EXISTS public.stem_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('science', 'technology', 'engineering', 'mathematics')),
  activity_type TEXT NOT NULL,
  activity_name TEXT NOT NULL,
  points_earned INTEGER NOT NULL DEFAULT 0,
  time_spent INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  accuracy NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stem_badges table for achievements
CREATE TABLE IF NOT EXISTS public.stem_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_code TEXT NOT NULL,
  badge_category TEXT NOT NULL CHECK (badge_category IN ('science', 'technology', 'engineering', 'mathematics', 'overall')),
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_code)
);

-- Create stem_daily_stats table for daily statistics
CREATE TABLE IF NOT EXISTS public.stem_daily_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL CHECK (category IN ('science', 'technology', 'engineering', 'mathematics')),
  activities_completed INTEGER NOT NULL DEFAULT 0,
  total_time_spent INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date, category)
);

-- Enable Row Level Security
ALTER TABLE public.stem_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stem_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stem_daily_stats ENABLE ROW LEVEL SECURITY;

-- Policies for stem_activities
CREATE POLICY "Users can view their own STEM activities"
  ON public.stem_activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own STEM activities"
  ON public.stem_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own STEM activities"
  ON public.stem_activities FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies for stem_badges
CREATE POLICY "Users can view their own STEM badges"
  ON public.stem_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own STEM badges"
  ON public.stem_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies for stem_daily_stats
CREATE POLICY "Users can view their own STEM daily stats"
  ON public.stem_daily_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own STEM daily stats"
  ON public.stem_daily_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own STEM daily stats"
  ON public.stem_daily_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_stem_activities_user_id ON public.stem_activities(user_id);
CREATE INDEX idx_stem_activities_category ON public.stem_activities(category);
CREATE INDEX idx_stem_activities_created_at ON public.stem_activities(created_at);
CREATE INDEX idx_stem_badges_user_id ON public.stem_badges(user_id);
CREATE INDEX idx_stem_daily_stats_user_date ON public.stem_daily_stats(user_id, date);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_stem_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_stem_activities_updated_at
  BEFORE UPDATE ON public.stem_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_stem_updated_at();

CREATE TRIGGER update_stem_daily_stats_updated_at
  BEFORE UPDATE ON public.stem_daily_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_stem_updated_at();
