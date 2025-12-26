// Subscription tier configuration
// Defines which apps are accessible for each subscription tier

export type SubscriptionTier = 'basic' | 'premium';

// Free tier apps - basic math operations only
export const FREE_TIER_APPS = [
  '/addition',
  '/subtraction',
  '/multiply',
  '/division',
  '/profile',
  '/quiz',
  '/today-mission',
  '/mission-history',
  '/weekly-progress',
  '/skill-progress',
  '/training-calendar',
];

// All other apps require premium subscription
export const PREMIUM_ONLY_APPS = [
  '/time',
  '/weighing',
  '/measurement',
  '/multiplication-table',
  '/quick-math',
  '/length-comparison',
  '/shape-matching',
  '/fraction-matching',
  '/percentage',
  '/number-series',
  '/sum-grid',
  '/shape-series',
  '/fraction-shapes',
  '/flower-math',
  '/balloon-math',
  '/counting-challenge',
  '/compare-stars',
  '/board-counting',
  '/fruit-counting',
  '/ai-math-tutor',
  '/adaptive-learning',
  '/number-bonds',
  '/bar-model',
  '/place-value',
  '/mental-math',
  '/area-model',
  '/money',
  '/word-problems',
  '/stem',
  '/coding-basics',
  '/science-lab',
  '/engineering-challenges',
  '/physics-lab',
  '/chemistry-lab',
  '/biology-lab',
  '/astronomy-lab',
  '/parent',
  '/parent/progress',
  '/analytics',
];

// Check if a user has access to a specific app
export const hasAppAccess = (appPath: string, tier: string | null | undefined): boolean => {
  // Premium users have access to all apps
  if (tier === 'premium') return true;
  
  // If no tier (not logged in), allow public routes
  if (!tier) return true;
  
  // Basic tier - check if app is in free tier list
  const normalizedPath = appPath.split('?')[0]; // Remove query params
  return FREE_TIER_APPS.some(freeApp => normalizedPath.startsWith(freeApp));
};

// Get display name for subscription tier
export const getTierDisplayName = (tier: string | null | undefined, locale: string = 'th'): string => {
  if (tier === 'premium') {
    return locale === 'th' ? 'สมาชิก Premium' : 'Premium Member';
  }
  return locale === 'th' ? 'สมาชิกฟรี' : 'Free Member';
};

// Get tier badge color
export const getTierBadgeColor = (tier: string | null | undefined): string => {
  if (tier === 'premium') {
    return 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black';
  }
  return 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white';
};
