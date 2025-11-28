const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // Check every minute
const SESSION_TIMEOUT_ENABLED = false; // Disabled: Login persists until explicit logout

class SessionManager {
  private timeoutId: NodeJS.Timeout | null = null;
  private checkIntervalId: NodeJS.Timeout | null = null;
  private lastActivity: number = Date.now();
  private onTimeout: (() => void) | null = null;

  startSession(onTimeoutCallback: () => void): void {
    // Session timeout disabled - login persists until explicit logout
    if (!SESSION_TIMEOUT_ENABLED) {
      return;
    }
    
    this.onTimeout = onTimeoutCallback;
    this.lastActivity = Date.now();
    this.resetTimeout();
    this.startActivityCheck();
    this.setupActivityListeners();
  }

  endSession(): void {
    this.clearTimeout();
    this.stopActivityCheck();
    this.removeActivityListeners();
    this.onTimeout = null;
  }

  private resetTimeout(): void {
    this.clearTimeout();
    this.timeoutId = setTimeout(() => {
      if (this.onTimeout) {
        this.onTimeout();
      }
    }, SESSION_TIMEOUT_MS);
  }

  private clearTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private updateActivity(): void {
    this.lastActivity = Date.now();
    this.resetTimeout();
  }

  private startActivityCheck(): void {
    this.checkIntervalId = setInterval(() => {
      const timeSinceLastActivity = Date.now() - this.lastActivity;
      if (timeSinceLastActivity >= SESSION_TIMEOUT_MS && this.onTimeout) {
        this.onTimeout();
      }
    }, ACTIVITY_CHECK_INTERVAL);
  }

  private stopActivityCheck(): void {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
    }
  }

  private handleActivity = (): void => {
    this.updateActivity();
  };

  private setupActivityListeners(): void {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, this.handleActivity);
    });
  }

  private removeActivityListeners(): void {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      window.removeEventListener(event, this.handleActivity);
    });
  }

  getRemainingTime(): number {
    const elapsed = Date.now() - this.lastActivity;
    const remaining = SESSION_TIMEOUT_MS - elapsed;
    return Math.max(0, Math.ceil(remaining / 1000 / 60)); // Return minutes
  }
}

export const sessionManager = new SessionManager();
