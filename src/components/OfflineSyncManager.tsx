// Global offline sync manager - handles pending mission syncs across all pages
import { useEffect, useRef } from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { getPendingQueue, removePendingFromQueue, PendingMissionResult } from '@/utils/missionCache';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { WifiOff, Wifi, CloudUpload } from 'lucide-react';

interface OfflineSyncManagerProps {
  children: React.ReactNode;
}

export const OfflineSyncManager = ({ children }: OfflineSyncManagerProps) => {
  const { isOnline, wasOffline } = useOnlineStatus();
  const isSyncing = useRef(false);
  const hasShownOfflineToast = useRef(false);

  // Show offline indicator
  useEffect(() => {
    if (!isOnline && !hasShownOfflineToast.current) {
      hasShownOfflineToast.current = true;
      toast('คุณกำลังใช้งานแบบออฟไลน์', {
        description: 'ข้อมูลจะถูกบันทึกเมื่อกลับมาออนไลน์',
        icon: <WifiOff className="h-4 w-4 text-amber-500" />,
        duration: 4000,
      });
    }
    if (isOnline) {
      hasShownOfflineToast.current = false;
    }
  }, [isOnline]);

  // Sync pending queue when coming back online
  useEffect(() => {
    const syncPendingQueue = async () => {
      if (!isOnline || isSyncing.current) return;
      
      const queue = getPendingQueue();
      if (queue.length === 0) return;

      isSyncing.current = true;
      console.log(`🔄 Syncing ${queue.length} pending mission results...`);
      
      toast('กำลัง sync ข้อมูล...', {
        description: `${queue.length} รายการที่รอบันทึก`,
        icon: <CloudUpload className="h-4 w-4 text-blue-500 animate-pulse" />,
        duration: 2000,
      });

      let successCount = 0;
      let failCount = 0;

      // Process queue sequentially to avoid overwhelming the server
      for (const pending of queue) {
        try {
          const success = await processPendingResult(pending);
          if (success) {
            removePendingFromQueue(pending.missionId);
            successCount++;
          } else {
            failCount++;
          }
          // Small delay between requests
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error('❌ Failed to sync pending result:', error);
          failCount++;
        }
      }

      isSyncing.current = false;

      // Show result toast
      if (successCount > 0) {
        toast.success(`Sync สำเร็จ ${successCount} รายการ`, {
          description: failCount > 0 ? `${failCount} รายการล้มเหลว` : undefined,
          icon: <Wifi className="h-4 w-4 text-green-500" />,
        });
      } else if (failCount > 0) {
        toast.error('Sync ล้มเหลว', {
          description: 'จะลองใหม่อัตโนมัติ',
        });
      }
    };

    // Sync when coming back online or on mount if online
    if (isOnline && (wasOffline || true)) {
      syncPendingQueue();
    }
  }, [isOnline, wasOffline]);

  // Periodic sync check (every 30 seconds when online)
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(() => {
      const queue = getPendingQueue();
      if (queue.length > 0 && !isSyncing.current) {
        console.log('⏰ Periodic sync check: Found pending items');
        // Trigger re-sync by simulating coming back online
        const event = new Event('online');
        window.dispatchEvent(event);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [isOnline]);

  return <>{children}</>;
};

// Process a single pending result
async function processPendingResult(pending: PendingMissionResult): Promise<boolean> {
  const { missionId, results, timestamp } = pending;
  
  // Check if expired (24 hours)
  const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
  if (Date.now() - timestamp > EXPIRY_MS) {
    console.log('⏰ Pending result expired, removing...');
    return true; // Return true to remove from queue
  }

  try {
    // Calculate stars using the same logic as useTrainingCalendar
    const accuracy = (results.correct_answers / results.total_questions) * 100;
    const timeMinutes = results.time_spent / 60;
    
    let stars = 0;
    if (accuracy >= 90 && timeMinutes <= 10) {
      stars = 3;
    } else if (accuracy >= 80) {
      stars = 2;
    } else if (accuracy >= 70) {
      stars = 1;
    }

    console.log(`📤 Syncing mission ${missionId}...`);

    const { error } = await supabase
      .from('daily_missions')
      .update({
        status: 'completed',
        completed_questions: results.total_questions,
        correct_answers: results.correct_answers,
        time_spent: results.time_spent,
        stars_earned: stars,
        completed_at: new Date(timestamp).toISOString(),
        question_attempts: results.question_attempts || null,
      })
      .eq('id', missionId);

    if (error) {
      console.error('❌ Sync failed:', error);
      return false;
    }

    console.log(`✅ Synced mission ${missionId} successfully`);
    return true;
  } catch (error) {
    console.error('❌ Error syncing pending result:', error);
    return false;
  }
}

export default OfflineSyncManager;
