// Rate limiter specifically for free tier users to prevent server overload

const RATE_LIMIT_KEY = 'kidfast_free_tier_rate_limit';

interface RateLimitData {
  apiCalls: { timestamp: number }[];
  lastWarningShown: number | null;
}

// Configuration for free tier rate limiting
const FREE_TIER_LIMITS = {
  maxCallsPerHour: 60, // Max API calls per hour
  warningThreshold: 50, // Show warning at this many calls
  windowMs: 60 * 60 * 1000, // 1 hour window
};

// Get current rate limit data
const getRateLimitData = (): RateLimitData => {
  try {
    const data = localStorage.getItem(RATE_LIMIT_KEY);
    if (!data) {
      return { apiCalls: [], lastWarningShown: null };
    }
    return JSON.parse(data);
  } catch (e) {
    return { apiCalls: [], lastWarningShown: null };
  }
};

// Save rate limit data
const saveRateLimitData = (data: RateLimitData): void => {
  try {
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving rate limit data:', e);
  }
};

// Clean old entries outside the window
const cleanOldEntries = (data: RateLimitData): RateLimitData => {
  const cutoff = Date.now() - FREE_TIER_LIMITS.windowMs;
  return {
    ...data,
    apiCalls: data.apiCalls.filter(call => call.timestamp > cutoff),
  };
};

// Check if user is within rate limits
export const checkFreeTierRateLimit = (): { 
  allowed: boolean; 
  remaining: number; 
  shouldWarn: boolean;
  callsInWindow: number;
} => {
  let data = getRateLimitData();
  data = cleanOldEntries(data);
  saveRateLimitData(data);
  
  const callsInWindow = data.apiCalls.length;
  const remaining = Math.max(0, FREE_TIER_LIMITS.maxCallsPerHour - callsInWindow);
  const allowed = callsInWindow < FREE_TIER_LIMITS.maxCallsPerHour;
  
  // Should warn if approaching limit and haven't warned recently (within 5 minutes)
  const shouldWarn = 
    callsInWindow >= FREE_TIER_LIMITS.warningThreshold &&
    (!data.lastWarningShown || Date.now() - data.lastWarningShown > 5 * 60 * 1000);
  
  return { allowed, remaining, shouldWarn, callsInWindow };
};

// Record an API call
export const recordFreeTierApiCall = (): void => {
  let data = getRateLimitData();
  data = cleanOldEntries(data);
  
  data.apiCalls.push({ timestamp: Date.now() });
  
  saveRateLimitData(data);
};

// Mark that we showed a warning
export const markWarningShown = (): void => {
  const data = getRateLimitData();
  data.lastWarningShown = Date.now();
  saveRateLimitData(data);
};

// Get current usage stats
export const getFreeTierUsageStats = (): {
  callsThisHour: number;
  maxCalls: number;
  percentUsed: number;
} => {
  let data = getRateLimitData();
  data = cleanOldEntries(data);
  
  const callsThisHour = data.apiCalls.length;
  const maxCalls = FREE_TIER_LIMITS.maxCallsPerHour;
  const percentUsed = Math.round((callsThisHour / maxCalls) * 100);
  
  return { callsThisHour, maxCalls, percentUsed };
};

// Reset rate limit (for testing or admin override)
export const resetFreeTierRateLimit = (): void => {
  localStorage.removeItem(RATE_LIMIT_KEY);
};

// Check subscription tier from localStorage
export const isFreeTier = (): boolean => {
  try {
    const authData = localStorage.getItem('kidfast_auth');
    if (!authData) return true; // Assume free if no auth
    
    const parsed = JSON.parse(authData);
    // Free tier = 'basic' or undefined
    return !parsed.subscriptionTier || parsed.subscriptionTier === 'basic';
  } catch (e) {
    return true; // Assume free on error
  }
};
