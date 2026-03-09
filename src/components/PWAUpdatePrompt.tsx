import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export const PWAUpdatePrompt = () => {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
      // Check for updates every 30 seconds
      if (r) {
        setInterval(() => r.update(), 30 * 1000);
      }
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  // Auto-update immediately when new version detected
  useEffect(() => {
    if (needRefresh) {
      console.log('[PWA] New version detected, auto-updating...');
      updateServiceWorker(true);
    }
  }, [needRefresh, updateServiceWorker]);

  // No UI needed - updates happen automatically
  return null;
};
