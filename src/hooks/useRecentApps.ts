interface RecentApp {
  appId: string;
  lastUsed: number;
}

const STORAGE_KEY = 'kidfast_recent_apps';
const MAX_RECENT_APPS = 15;

export const useRecentApps = () => {
  const getRecentApps = (): RecentApp[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const apps = JSON.parse(stored) as RecentApp[];
      // Sort by lastUsed descending (most recent first)
      return apps.sort((a, b) => b.lastUsed - a.lastUsed);
    } catch (error) {
      console.error('Error reading recent apps:', error);
      return [];
    }
  };

  const trackAppUsage = (appId: string) => {
    try {
      const apps = getRecentApps();
      
      // Remove existing entry if present
      const filtered = apps.filter(app => app.appId !== appId);
      
      // Add new entry at the front
      const updated = [
        { appId, lastUsed: Date.now() },
        ...filtered
      ].slice(0, MAX_RECENT_APPS); // Keep only the most recent
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error tracking app usage:', error);
    }
  };

  const clearHistory = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  return {
    recentApps: getRecentApps(),
    trackAppUsage,
    clearHistory
  };
};
