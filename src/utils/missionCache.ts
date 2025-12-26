// Mission data caching for free tier users to reduce server load

const CACHE_KEY = 'kidfast_missions_cache';
const PENDING_QUEUE_KEY = 'kidfast_pending_mission_queue';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache freshness
const PENDING_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours for pending results

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

// === Pending Mission Queue Types ===
export interface PendingMissionResult {
  missionId: string;
  results: {
    total_questions: number;
    correct_answers: number;
    time_spent: number;
    question_attempts?: any[];
  };
  timestamp: number;
  retryCount: number;
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

// === Pending Mission Queue Functions ===

// Get pending mission queue
export const getPendingQueue = (): PendingMissionResult[] => {
  try {
    const queueStr = localStorage.getItem(PENDING_QUEUE_KEY);
    if (!queueStr) return [];
    
    const queue: PendingMissionResult[] = JSON.parse(queueStr);
    const now = Date.now();
    
    // Filter out expired items (older than 24 hours)
    return queue.filter(item => now - item.timestamp < PENDING_EXPIRY_MS);
  } catch (e) {
    console.error('Error reading pending queue:', e);
    return [];
  }
};

// Add to pending queue
export const addToPendingQueue = (result: Omit<PendingMissionResult, 'retryCount'>): void => {
  try {
    const queue = getPendingQueue();
    
    // Check if mission already in queue
    const existingIndex = queue.findIndex(item => item.missionId === result.missionId);
    
    if (existingIndex >= 0) {
      // Update existing entry
      queue[existingIndex] = { ...result, retryCount: queue[existingIndex].retryCount + 1 };
      console.log(`📝 Updated pending result for mission ${result.missionId} (retry ${queue[existingIndex].retryCount})`);
    } else {
      // Add new entry
      queue.push({ ...result, retryCount: 0 });
      console.log(`📝 Added new pending result for mission ${result.missionId}`);
    }
    
    localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(queue));
    console.log(`📦 Pending queue size: ${queue.length}`);
  } catch (e) {
    console.error('Error adding to pending queue:', e);
  }
};

// Remove from pending queue
export const removePendingFromQueue = (missionId: string): void => {
  try {
    const queue = getPendingQueue();
    const filtered = queue.filter(item => item.missionId !== missionId);
    
    if (filtered.length === 0) {
      localStorage.removeItem(PENDING_QUEUE_KEY);
    } else {
      localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(filtered));
    }
    
    console.log(`🗑️ Removed mission ${missionId} from pending queue`);
  } catch (e) {
    console.error('Error removing from pending queue:', e);
  }
};

// Get pending queue count
export const getPendingQueueCount = (): number => {
  return getPendingQueue().length;
};

// Clear entire pending queue
export const clearPendingQueue = (): void => {
  try {
    localStorage.removeItem(PENDING_QUEUE_KEY);
    console.log('🗑️ Cleared entire pending queue');
  } catch (e) {
    console.error('Error clearing pending queue:', e);
  }
};

// Migrate old single pending result to queue (backward compatibility)
export const migrateLegacyPendingResult = (): void => {
  try {
    const legacyKey = 'pendingMissionResult';
    const legacyStr = localStorage.getItem(legacyKey);
    if (!legacyStr) return;
    
    const legacy = JSON.parse(legacyStr);
    if (legacy.missionId && legacy.results && legacy.timestamp) {
      addToPendingQueue({
        missionId: legacy.missionId,
        results: legacy.results,
        timestamp: legacy.timestamp,
      });
      localStorage.removeItem(legacyKey);
      console.log('✅ Migrated legacy pending result to queue');
    }
  } catch (e) {
    console.error('Error migrating legacy pending result:', e);
  }
};
