const INACTIVITY_LOGOUT_HOURS = 48; // 48 hours
const INACTIVITY_LOGOUT_MS = INACTIVITY_LOGOUT_HOURS * 60 * 60 * 1000;
const LAST_VISIT_KEY = 'kidfast_last_visit';

class SessionManager {
  // Check if should auto-logout due to 48h inactivity
  checkInactivityLogout(): boolean {
    const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
    if (!lastVisit) {
      return false; // No record = first time or fresh login
    }
    
    const lastVisitTime = parseInt(lastVisit, 10);
    const now = Date.now();
    const inactiveTime = now - lastVisitTime;
    
    return inactiveTime > INACTIVITY_LOGOUT_MS;
  }
  
  // Update last visit timestamp
  updateLastVisit(): void {
    localStorage.setItem(LAST_VISIT_KEY, Date.now().toString());
  }
  
  // Clear last visit on logout
  clearLastVisit(): void {
    localStorage.removeItem(LAST_VISIT_KEY);
  }

  // Legacy method kept for compatibility - does nothing now
  endSession(): void {
    // Kept for compatibility but not needed for visit-based tracking
  }
  
  // Calculate remaining time before auto-logout (for UI display if needed)
  getTimeUntilLogout(): number {
    const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
    if (!lastVisit) return INACTIVITY_LOGOUT_MS;
    
    const elapsed = Date.now() - parseInt(lastVisit, 10);
    return Math.max(0, INACTIVITY_LOGOUT_MS - elapsed);
  }
  
  // Get remaining time in hours (for UI display)
  getRemainingHours(): number {
    const remainingMs = this.getTimeUntilLogout();
    return Math.ceil(remainingMs / 1000 / 60 / 60);
  }
}

export const sessionManager = new SessionManager();
