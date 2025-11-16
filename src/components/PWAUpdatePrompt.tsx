import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from './ui/button';
import { RefreshCw, X } from 'lucide-react';

export const PWAUpdatePrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      setShowPrompt(true);
    }
  }, [needRefresh]);

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  const handleClose = () => {
    setShowPrompt(false);
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] max-w-md animate-in slide-in-from-bottom-5">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-2xl p-4 border border-white/20">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-5 h-5" />
              <h3 className="font-bold text-lg">
                {needRefresh ? '🎉 มีเวอร์ชั่นใหม่!' : '✅ พร้อมใช้งาน Offline'}
              </h3>
            </div>
            <p className="text-sm text-white/90 mb-3">
              {needRefresh 
                ? 'พบการอัพเดทใหม่! กดปุ่มด้านล่างเพื่อรีเฟรชและใช้งานเวอร์ชั่นล่าสุด'
                : 'แอพพลิเคชันพร้อมใช้งานแบบ offline แล้ว'
              }
            </p>
            <div className="flex gap-2">
              {needRefresh && (
                <Button
                  onClick={handleUpdate}
                  size="sm"
                  className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  รีเฟรชทันที
                </Button>
              )}
              <Button
                onClick={handleClose}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                {needRefresh ? 'ทีหลัง' : 'ปิด'}
              </Button>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
