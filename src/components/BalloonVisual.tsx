import { getRandomBalloonColor } from '@/utils/balloonMathUtils';
import { useMemo } from 'react';

interface BalloonVisualProps {
  count: number;
}

const Balloon = ({ color, index }: { color: string; index: number }) => (
  <svg 
    width="40" 
    height="55" 
    viewBox="0 0 40 55"
    style={{ animationDelay: `${index * 0.1}s` }}
    className="animate-bounce inline-block mx-1"
  >
    {/* Balloon body */}
    <ellipse cx="20" cy="20" rx="18" ry="22" fill={color} />
    {/* Highlight */}
    <ellipse cx="14" cy="14" rx="6" ry="8" fill="white" opacity="0.4" />
    {/* String */}
    <path d="M20 42 Q18 48 20 55" stroke="#888" strokeWidth="1.5" fill="none"/>
    {/* Knot */}
    <polygon points="17,42 23,42 20,46" fill={color} />
  </svg>
);

export const BalloonVisual = ({ count }: BalloonVisualProps) => {
  const balloons = useMemo(() => {
    return Array.from({ length: Math.min(count, 10) }, (_, i) => ({
      id: i,
      color: getRandomBalloonColor()
    }));
  }, [count]);

  if (count > 10) {
    return (
      <div className="text-white text-2xl font-bold">
        ({count})
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center items-center gap-1 min-h-[60px]">
      {balloons.map((balloon) => (
        <Balloon key={balloon.id} color={balloon.color} index={balloon.id} />
      ))}
    </div>
  );
};
