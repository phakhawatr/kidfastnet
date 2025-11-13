import { Trophy, Zap, Flame, Star, BookOpen, Award } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface AchievementBadgeProps {
  code: string;
  name: string;
  description?: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  earnedAt?: string;
}

const iconMap: Record<string, LucideIcon> = {
  trophy: Trophy,
  zap: Zap,
  flame: Flame,
  star: Star,
  'book-open': BookOpen,
  award: Award,
};

const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  gold: {
    bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
    border: 'border-yellow-500',
    text: 'text-yellow-900',
    glow: 'shadow-yellow-400/50'
  },
  yellow: {
    bg: 'bg-gradient-to-br from-yellow-300 to-yellow-500',
    border: 'border-yellow-400',
    text: 'text-yellow-900',
    glow: 'shadow-yellow-300/50'
  },
  orange: {
    bg: 'bg-gradient-to-br from-orange-400 to-orange-600',
    border: 'border-orange-500',
    text: 'text-orange-900',
    glow: 'shadow-orange-400/50'
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-400 to-purple-600',
    border: 'border-purple-500',
    text: 'text-purple-900',
    glow: 'shadow-purple-400/50'
  },
  blue: {
    bg: 'bg-gradient-to-br from-blue-400 to-blue-600',
    border: 'border-blue-500',
    text: 'text-blue-900',
    glow: 'shadow-blue-400/50'
  },
  green: {
    bg: 'bg-gradient-to-br from-green-400 to-green-600',
    border: 'border-green-500',
    text: 'text-green-900',
    glow: 'shadow-green-400/50'
  },
};

const sizeMap = {
  sm: { container: 'w-12 h-12', icon: 20, text: 'text-xs' },
  md: { container: 'w-16 h-16', icon: 28, text: 'text-sm' },
  lg: { container: 'w-20 h-20', icon: 36, text: 'text-base' },
};

const AchievementBadge = ({
  code,
  name,
  description,
  color,
  size = 'md',
  showName = true,
  earnedAt
}: AchievementBadgeProps) => {
  const Icon = iconMap[code.replace('_', '-')] || iconMap.award;
  const colors = colorMap[color] || colorMap.blue;
  const sizes = sizeMap[size];

  return (
    <div className="flex flex-col items-center gap-2 group">
      <div
        className={`${sizes.container} ${colors.bg} ${colors.border} border-4 rounded-full flex items-center justify-center shadow-lg ${colors.glow} transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl relative`}
        title={description}
      >
        <Icon className="text-white" size={sizes.icon} strokeWidth={2.5} />
        {earnedAt && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
        )}
      </div>
      {showName && (
        <div className="text-center">
          <p className={`${sizes.text} font-bold ${colors.text} max-w-24 leading-tight`}>
            {name}
          </p>
          {earnedAt && (
            <p className="text-xs text-gray-500 mt-1">
              {new Date(earnedAt).toLocaleDateString('th-TH', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AchievementBadge;
