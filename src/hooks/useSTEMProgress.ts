import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface STEMActivity {
  id: string;
  category: "science" | "technology" | "engineering" | "mathematics";
  activity_type: string;
  activity_name: string;
  points_earned: number;
  time_spent: number;
  completed: boolean;
  accuracy: number | null;
  created_at: string;
}

export interface STEMBadge {
  id: string;
  badge_code: string;
  badge_category: "science" | "technology" | "engineering" | "mathematics" | "overall";
  earned_at: string;
}

export interface STEMDailyStat {
  id: string;
  date: string;
  category: "science" | "technology" | "engineering" | "mathematics";
  activities_completed: number;
  total_time_spent: number;
  total_points: number;
}

export const useSTEMProgress = () => {
  const { user } = useAuth();

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["stem-activities", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("stem_activities")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as STEMActivity[];
    },
    enabled: !!user?.id,
  });

  const { data: badges, isLoading: badgesLoading } = useQuery({
    queryKey: ["stem-badges", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("stem_badges")
        .select("*")
        .eq("user_id", user.id)
        .order("earned_at", { ascending: false });

      if (error) throw error;
      return data as STEMBadge[];
    },
    enabled: !!user?.id,
  });

  const { data: dailyStats, isLoading: statsLoading } = useQuery({
    queryKey: ["stem-daily-stats", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("stem_daily_stats")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(30); // Last 30 days

      if (error) throw error;
      return data as STEMDailyStat[];
    },
    enabled: !!user?.id,
  });

  // Calculate summary statistics
  const summary = {
    totalActivities: activities?.length || 0,
    totalPoints: activities?.reduce((sum, a) => sum + a.points_earned, 0) || 0,
    totalTime: activities?.reduce((sum, a) => sum + a.time_spent, 0) || 0,
    completedActivities: activities?.filter(a => a.completed).length || 0,
    badgesEarned: badges?.length || 0,
    scienceActivities: activities?.filter(a => a.category === "science").length || 0,
    technologyActivities: activities?.filter(a => a.category === "technology").length || 0,
    engineeringActivities: activities?.filter(a => a.category === "engineering").length || 0,
    mathematicsActivities: activities?.filter(a => a.category === "mathematics").length || 0,
  };

  return {
    activities,
    badges,
    dailyStats,
    summary,
    isLoading: activitiesLoading || badgesLoading || statsLoading,
  };
};
