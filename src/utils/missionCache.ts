// Mission data caching for free tier users to reduce server load

const CACHE_KEY = 'kidfast_missions_cache';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache freshness

interface CachedMissions {
  data: any[];
  userId: string;
  month: number;
  year: number;
  cachedAt: number;
}

interface MissionCache {
  missions: CachedMissions | null;
  streak: {
    data: any;
    userId: string;
    cachedAt: number;
  } | null;
}

// Get cached missions if fresh
export const getCachedMissions = (userId: string, month: number, year: number): any[] | null => {
  try {
    const cacheStr = localStorage.getItem(CACHE_KEY);
    if (!cacheStr) return null;
    
    const cache: MissionCache = JSON.parse(cacheStr);
    if (!cache.missions) return null;
    
    const { data, userId: cachedUserId, month: cachedMonth, year: cachedYear, cachedAt } = cache.missions;
    
    // Check if cache is for same user, month, year and still fresh
    if (
      cachedUserId === userId &&
      cachedMonth === month &&
      cachedYear === year &&
      Date.now() - cachedAt < CACHE_TTL_MS
    ) {
      console.log('📦 Using cached missions data');
      return data;
    }
    
    return null;
  } catch (e) {
    console.error('Error reading mission cache:', e);
    return null;
  }
};

// Save missions to cache
export const cacheMissions = (userId: string, month: number, year: number, data: any[]): void => {
  try {
    const cacheStr = localStorage.getItem(CACHE_KEY);
    const cache: MissionCache = cacheStr ? JSON.parse(cacheStr) : { missions: null, streak: null };
    
    cache.missions = {
      data,
      userId,
      month,
      year,
      cachedAt: Date.now(),
    };
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    console.log('💾 Missions cached successfully');
  } catch (e) {
    console.error('Error caching missions:', e);
  }
};

// Get cached streak if fresh
export const getCachedStreak = (userId: string): any | null => {
  try {
    const cacheStr = localStorage.getItem(CACHE_KEY);
    if (!cacheStr) return null;
    
    const cache: MissionCache = JSON.parse(cacheStr);
    if (!cache.streak) return null;
    
    const { data, userId: cachedUserId, cachedAt } = cache.streak;
    
    // Check if cache is for same user and still fresh
    if (cachedUserId === userId && Date.now() - cachedAt < CACHE_TTL_MS) {
      console.log('📦 Using cached streak data');
      return data;
    }
    
    return null;
  } catch (e) {
    console.error('Error reading streak cache:', e);
    return null;
  }
};

// Save streak to cache
export const cacheStreak = (userId: string, data: any): void => {
  try {
    const cacheStr = localStorage.getItem(CACHE_KEY);
    const cache: MissionCache = cacheStr ? JSON.parse(cacheStr) : { missions: null, streak: null };
    
    cache.streak = {
      data,
      userId,
      cachedAt: Date.now(),
    };
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    console.log('💾 Streak cached successfully');
  } catch (e) {
    console.error('Error caching streak:', e);
  }
};

// Invalidate cache (call after mission completion)
export const invalidateMissionCache = (): void => {
  try {
    localStorage.removeItem(CACHE_KEY);
    console.log('🗑️ Mission cache invalidated');
  } catch (e) {
    console.error('Error invalidating cache:', e);
  }
};

// Clear old cache entries
export const cleanupCache = (): void => {
  try {
    const cacheStr = localStorage.getItem(CACHE_KEY);
    if (!cacheStr) return;
    
    const cache: MissionCache = JSON.parse(cacheStr);
    const now = Date.now();
    let changed = false;
    
    // Clear expired missions cache
    if (cache.missions && now - cache.missions.cachedAt > CACHE_TTL_MS * 2) {
      cache.missions = null;
      changed = true;
    }
    
    // Clear expired streak cache
    if (cache.streak && now - cache.streak.cachedAt > CACHE_TTL_MS * 2) {
      cache.streak = null;
      changed = true;
    }
    
    if (changed) {
      if (!cache.missions && !cache.streak) {
        localStorage.removeItem(CACHE_KEY);
      } else {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      }
    }
  } catch (e) {
    console.error('Error cleaning up cache:', e);
  }
};
