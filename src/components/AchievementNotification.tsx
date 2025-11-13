import { useEffect, useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import AchievementBadge from './AchievementBadge';

interface Achievement {
  code: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

interface AchievementNotificationProps {
  achievements: Achievement[];
  onClose: () => void;
}

const AchievementNotification = ({ achievements, onClose }: AchievementNotificationProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (currentIndex < achievements.length - 1) {
      const timer = setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 3000);
      return () => clearTimeout(timer);
    } else if (achievements.length > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, achievements.length, onClose]);

  if (achievements.length === 0 || !isVisible) return null;

  const current = achievements[currentIndex];

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-8 scale-95'
      }`}
    >
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-2xl shadow-2xl p-6 max-w-md relative overflow-hidden animate-in slide-in-from-top">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-white opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-400 rounded-full blur-3xl"></div>
        </div>

        {/* Close button */}
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3 justify-center">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            <h3 className="text-xl font-bold">ปลดล็อคความสำเร็จใหม่!</h3>
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <AchievementBadge
                code={current.icon}
                name=""
                color={current.color}
                size="lg"
                showName={false}
              />
            </div>

            <div className="flex-1">
              <h4 className="text-2xl font-bold mb-1">{current.name}</h4>
              <p className="text-white/90 text-sm">{current.description}</p>
            </div>
          </div>

          {achievements.length > 1 && (
            <div className="mt-4 flex gap-1 justify-center">
              {achievements.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'w-8 bg-white'
                      : 'w-1.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AchievementNotification;
