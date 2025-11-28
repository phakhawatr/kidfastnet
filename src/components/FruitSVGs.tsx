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

    case 'strawberry':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" style={baseStyle}>
          {!isShadow && (
            <>
              <defs>
                <radialGradient id="strawberryGradient" cx="40%" cy="40%">
                  <stop offset="0%" stopColor="#ff6688" />
                  <stop offset="100%" stopColor="#cc0033" />
                </radialGradient>
              </defs>
              <path
                d="M 50 25 Q 30 30, 28 50 Q 28 70, 50 85 Q 72 70, 72 50 Q 70 30, 50 25 Z"
                fill="url(#strawberryGradient)"
              />
              <ellipse cx="50" cy="20" rx="15" ry="8" fill="#228B22" />
              <ellipse cx="50" cy="18" rx="10" ry="5" fill="#32CD32" />
              <circle cx="40" cy="45" r="2" fill="#ffee88" />
              <circle cx="50" cy="50" r="2" fill="#ffee88" />
              <circle cx="60" cy="45" r="2" fill="#ffee88" />
              <circle cx="45" cy="60" r="2" fill="#ffee88" />
              <circle cx="55" cy="60" r="2" fill="#ffee88" />
            </>
          )}
          {isShadow && (
            <path
              d="M 50 25 Q 30 30, 28 50 Q 28 70, 50 85 Q 72 70, 72 50 Q 70 30, 50 25 Z"
              fill="#3a1a1a"
            />
          )}
        </svg>
      );

    case 'cherry':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" style={baseStyle}>
          {!isShadow && (
            <>
              <defs>
                <radialGradient id="cherryGradient" cx="40%" cy="40%">
                  <stop offset="0%" stopColor="#ff4466" />
                  <stop offset="100%" stopColor="#990022" />
                </radialGradient>
              </defs>
              <path d="M 35 30 Q 35 15, 45 10" stroke="#8B4513" strokeWidth="2" fill="none" />
              <path d="M 65 30 Q 65 15, 55 10" stroke="#8B4513" strokeWidth="2" fill="none" />
              <circle cx="35" cy="55" r="20" fill="url(#cherryGradient)" />
              <circle cx="65" cy="55" r="20" fill="url(#cherryGradient)" />
              <ellipse cx="30" cy="48" rx="8" ry="10" fill="#ff6688" opacity="0.4" />
              <ellipse cx="60" cy="48" rx="8" ry="10" fill="#ff6688" opacity="0.4" />
            </>
          )}
          {isShadow && (
            <>
              <circle cx="35" cy="55" r="20" fill="#3a1a1a" />
              <circle cx="65" cy="55" r="20" fill="#3a1a1a" />
            </>
          )}
        </svg>
      );

    case 'watermelon':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" style={baseStyle}>
          {!isShadow && (
            <>
              <defs>
                <radialGradient id="watermelonGradient" cx="40%" cy="40%">
                  <stop offset="0%" stopColor="#ff6688" />
                  <stop offset="100%" stopColor="#ee3355" />
                </radialGradient>
              </defs>
              <path
                d="M 20 50 Q 20 25, 50 20 Q 80 25, 80 50 L 80 75 Q 50 85, 20 75 Z"
                fill="url(#watermelonGradient)"
              />
              <path
                d="M 20 75 Q 50 85, 80 75 L 80 80 Q 50 88, 20 80 Z"
                fill="#228B22"
              />
              <ellipse cx="30" cy="40" rx="10" ry="12" fill="#ff8899" opacity="0.5" />
              <circle cx="35" cy="50" r="3" fill="#222222" />
              <circle cx="50" cy="45" r="3" fill="#222222" />
              <circle cx="65" cy="50" r="3" fill="#222222" />
              <circle cx="45" cy="60" r="3" fill="#222222" />
              <circle cx="60" cy="60" r="3" fill="#222222" />
            </>
          )}
          {isShadow && (
            <path
              d="M 20 50 Q 20 25, 50 20 Q 80 25, 80 50 L 80 80 Q 50 88, 20 80 Z"
              fill="#2a3a1a"
            />
          )}
        </svg>
      );

    case 'pear':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" style={baseStyle}>
          {!isShadow && (
            <>
              <defs>
                <radialGradient id="pearGradient" cx="40%" cy="40%">
                  <stop offset="0%" stopColor="#ccee66" />
                  <stop offset="100%" stopColor="#88aa22" />
                </radialGradient>
              </defs>
              <path
                d="M 50 20 Q 45 25, 45 35 Q 35 40, 30 55 Q 28 75, 50 85 Q 72 75, 70 55 Q 65 40, 55 35 Q 55 25, 50 20 Z"
                fill="url(#pearGradient)"
              />
              <rect x="48" y="12" width="4" height="10" fill="#8B4513" rx="2" />
              <ellipse cx="50" cy="15" rx="6" ry="4" fill="#228B22" />
              <ellipse cx="40" cy="50" rx="10" ry="15" fill="#ddff88" opacity="0.4" />
            </>
          )}
          {isShadow && (
            <path
              d="M 50 20 Q 45 25, 45 35 Q 35 40, 30 55 Q 28 75, 50 85 Q 72 75, 70 55 Q 65 40, 55 35 Q 55 25, 50 20 Z"
              fill="#3a4a1a"
            />
          )}
        </svg>
      );

    case 'peach':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" style={baseStyle}>
          {!isShadow && (
            <>
              <defs>
                <radialGradient id="peachGradient" cx="40%" cy="40%">
                  <stop offset="0%" stopColor="#ffbb88" />
                  <stop offset="100%" stopColor="#ff8844" />
                </radialGradient>
              </defs>
              <circle cx="45" cy="50" r="28" fill="url(#peachGradient)" />
              <circle cx="58" cy="50" r="28" fill="url(#peachGradient)" />
              <path
                d="M 50 22 Q 48 18, 50 14 Q 52 18, 50 22"
                fill="#228B22"
              />
              <ellipse cx="40" cy="45" rx="12" ry="15" fill="#ffddaa" opacity="0.5" />
            </>
          )}
          {isShadow && (
            <>
              <circle cx="45" cy="50" r="28" fill="#4a3a2a" />
              <circle cx="58" cy="50" r="28" fill="#4a3a2a" />
            </>
          )}
        </svg>
      );

    case 'mango':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" style={baseStyle}>
          {!isShadow && (
            <>
              <defs>
                <radialGradient id="mangoGradient" cx="40%" cy="40%">
                  <stop offset="0%" stopColor="#ffdd44" />
                  <stop offset="100%" stopColor="#ffaa00" />
                </radialGradient>
              </defs>
              <ellipse cx="50" cy="55" rx="30" ry="35" fill="url(#mangoGradient)" />
              <ellipse cx="38" cy="45" rx="12" ry="15" fill="#ffee88" opacity="0.5" />
              <path d="M 50 20 Q 52 18, 55 16 L 60 12" stroke="#228B22" strokeWidth="3" fill="none" />
              <ellipse cx="58" cy="14" rx="8" ry="5" fill="#228B22" />
            </>
          )}
          {isShadow && (
            <ellipse cx="50" cy="55" rx="30" ry="35" fill="#4a3a1a" />
          )}
        </svg>
      );

    default:
      return null;
  }
};
