import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseUserPresenceProps {
  userId?: string;
  userInfo?: {
    nickname: string;
    status: string;
  };
  registrationId?: string; // For users who login through authenticate_user
}

export const useUserPresence = ({ userId, userInfo, registrationId }: UseUserPresenceProps) => {
  useEffect(() => {
    if ((!userId && !registrationId) || !userInfo) return;

    // Use registrationId for non-Supabase auth users, userId for Supabase auth users
    const trackingId = registrationId || userId;
    if (!trackingId) return;

    const channel = supabase.channel('admin-dashboard', {
      config: {
        presence: { key: trackingId }
      }
    });

    const userPresence = {
      user_id: trackingId,
      nickname: userInfo.nickname,
      status: userInfo.status,
      online_at: new Date().toISOString(),
    };

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track(userPresence);
      }
    });

    // Update presence every 30 seconds to keep it alive
    const intervalId = setInterval(async () => {
      await channel.track({
        ...userPresence,
        online_at: new Date().toISOString(),
      });
    }, 30000);

    return () => {
      clearInterval(intervalId);
      supabase.removeChannel(channel);
    };
  }, [userId, userInfo, registrationId]);
};
