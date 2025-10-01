interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  blockedUntil?: number;
}

class RateLimiter {
  private attempts: Map<string, RateLimitEntry> = new Map();
  private readonly maxAttempts = 5;
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes
  private readonly blockDurationMs = 30 * 60 * 1000; // 30 minutes

  checkRateLimit(identifier: string): { allowed: boolean; remainingTime?: number } {
    const now = Date.now();
    const entry = this.attempts.get(identifier);

    // Check if blocked
    if (entry?.blockedUntil && entry.blockedUntil > now) {
      const remainingTime = Math.ceil((entry.blockedUntil - now) / 1000 / 60);
      return { allowed: false, remainingTime };
    }

    // Reset if window expired
    if (entry && now - entry.firstAttempt > this.windowMs) {
      this.attempts.delete(identifier);
      return { allowed: true };
    }

    // Check attempt count
    if (entry && entry.count >= this.maxAttempts) {
      const blockedUntil = now + this.blockDurationMs;
      this.attempts.set(identifier, { ...entry, blockedUntil });
      const remainingTime = Math.ceil(this.blockDurationMs / 1000 / 60);
      return { allowed: false, remainingTime };
    }

    return { allowed: true };
  }

  recordAttempt(identifier: string): void {
    const now = Date.now();
    const entry = this.attempts.get(identifier);

    if (!entry) {
      this.attempts.set(identifier, { count: 1, firstAttempt: now });
    } else {
      this.attempts.set(identifier, { ...entry, count: entry.count + 1 });
    }
  }

  resetAttempts(identifier: string): void {
    this.attempts.delete(identifier);
  }

  // Clean up old entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.attempts.entries()) {
      if (now - entry.firstAttempt > this.windowMs && (!entry.blockedUntil || entry.blockedUntil < now)) {
        this.attempts.delete(key);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

// Run cleanup every 5 minutes
setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);
