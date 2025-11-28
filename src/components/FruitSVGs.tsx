import { FruitType } from '@/utils/fruitCountingUtils';

interface FruitSVGProps {
  type: FruitType;
  size?: number;
  isShadow?: boolean;
}

export const FruitSVG = ({ type, size = 80, isShadow = false }: FruitSVGProps) => {
  const baseStyle = isShadow 
    ? { filter: 'brightness(0.3)' } 
    : { filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' };

  switch (type) {
    case 'apple':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" style={baseStyle}>
          {!isShadow && (
            <>
              <defs>
                <radialGradient id="appleGradient" cx="40%" cy="40%">
                  <stop offset="0%" stopColor="#ff4444" />
                  <stop offset="100%" stopColor="#cc0000" />
                </radialGradient>
              </defs>
              <ellipse cx="50" cy="55" rx="35" ry="38" fill="url(#appleGradient)" />
              <ellipse cx="35" cy="45" rx="10" ry="12" fill="#ff6666" opacity="0.5" />
              <rect x="48" y="15" width="4" height="15" fill="#8B4513" rx="2" />
              <ellipse cx="55" cy="18" rx="8" ry="5" fill="#228B22" />
            </>
          )}
          {isShadow && (
            <ellipse cx="50" cy="55" rx="35" ry="38" fill="#4a1a1a" />
          )}
        </svg>
      );

    case 'grape':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" style={baseStyle}>
          {!isShadow && (
            <>
              <defs>
                <radialGradient id="grapeGradient" cx="40%" cy="40%">
                  <stop offset="0%" stopColor="#9966ff" />
                  <stop offset="100%" stopColor="#6600cc" />
                </radialGradient>
              </defs>
              {[0, 1, 2].map(row => 
                [0, 1, 2].slice(0, 3 - row).map(col => (
                  <circle
                    key={`${row}-${col}`}
                    cx={35 + col * 15}
                    cy={35 + row * 16}
                    r="10"
                    fill="url(#grapeGradient)"
                  />
                ))
              )}
              <path d="M 50 20 Q 50 10, 55 10 L 60 5" stroke="#228B22" strokeWidth="3" fill="none" />
            </>
          )}
          {isShadow && (
            <>
              {[0, 1, 2].map(row => 
                [0, 1, 2].slice(0, 3 - row).map(col => (
                  <circle
                    key={`${row}-${col}`}
                    cx={35 + col * 15}
                    cy={35 + row * 16}
                    r="10"
                    fill="#2a1a3a"
                  />
                ))
              )}
            </>
          )}
        </svg>
      );

    case 'banana':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" style={baseStyle}>
          {!isShadow && (
            <>
              <defs>
                <linearGradient id="bananaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffee44" />
                  <stop offset="100%" stopColor="#ffcc00" />
                </linearGradient>
              </defs>
              <path
                d="M 30 30 Q 20 40, 25 60 Q 30 75, 45 80 Q 60 83, 70 75 Q 80 65, 75 50 Q 70 35, 60 30 Q 50 28, 40 30 Z"
                fill="url(#bananaGradient)"
              />
              <path
                d="M 35 35 Q 30 45, 33 55"
                stroke="#996600"
                strokeWidth="2"
                fill="none"
              />
            </>
          )}
          {isShadow && (
            <path
              d="M 30 30 Q 20 40, 25 60 Q 30 75, 45 80 Q 60 83, 70 75 Q 80 65, 75 50 Q 70 35, 60 30 Q 50 28, 40 30 Z"
              fill="#4a3a1a"
            />
          )}
        </svg>
      );

    case 'orange':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" style={baseStyle}>
          {!isShadow && (
            <>
              <defs>
                <radialGradient id="orangeGradient" cx="40%" cy="40%">
                  <stop offset="0%" stopColor="#ffaa44" />
                  <stop offset="100%" stopColor="#ff6600" />
                </radialGradient>
              </defs>
              <circle cx="50" cy="50" r="35" fill="url(#orangeGradient)" />
              <ellipse cx="35" cy="40" rx="12" ry="15" fill="#ffcc66" opacity="0.4" />
              <rect x="48" y="15" width="4" height="10" fill="#8B4513" rx="2" />
              <ellipse cx="50" cy="18" rx="6" ry="4" fill="#228B22" />
            </>
          )}
          {isShadow && (
            <circle cx="50" cy="50" r="35" fill="#4a2a1a" />
          )}
        </svg>
      );

    default:
      return null;
  }
};
