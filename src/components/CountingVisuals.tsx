import { ThemeName } from '@/utils/countingChallengeUtils';

interface CountingVisualsProps {
  theme: ThemeName;
  count: number;
}

const Fish = () => (
  <svg width="80" height="60" viewBox="0 0 80 60" className="animate-pulse">
    <ellipse cx="35" cy="30" rx="28" ry="20" fill="#FF69B4" />
    <polygon points="60,30 80,15 80,45" fill="#FF69B4" />
    <circle cx="22" cy="25" r="6" fill="white" />
    <circle cx="22" cy="25" r="3" fill="black" />
    <circle cx="35" cy="22" r="3" fill="#FFD700" />
    <circle cx="42" cy="28" r="3" fill="#FFD700" />
    <circle cx="38" cy="35" r="3" fill="#FFD700" />
    <path d="M25,12 Q35,0 45,12" fill="#FFD700" />
  </svg>
);

const BeachBall = () => (
  <svg width="50" height="50" viewBox="0 0 50 50" className="animate-bounce">
    <circle cx="25" cy="25" r="23" fill="#FF4444" />
    <path d="M25,2 Q35,25 25,48" fill="#FFD700" />
    <path d="M25,2 Q15,25 25,48" fill="#FFD700" />
    <circle cx="25" cy="5" r="4" fill="white" opacity="0.7" />
  </svg>
);

const Apple = () => (
  <svg width="50" height="60" viewBox="0 0 50 60" className="animate-pulse">
    <ellipse cx="25" cy="35" rx="20" ry="22" fill="#FF3333" />
    <path d="M25,13 Q20,8 25,3" stroke="#8B4513" strokeWidth="2" fill="none" />
    <ellipse cx="30" cy="15" rx="8" ry="12" fill="#228B22" />
    <circle cx="18" cy="28" r="5" fill="#FFD700" opacity="0.5" />
  </svg>
);

const Star = () => (
  <svg width="50" height="50" viewBox="0 0 50 50" className="animate-pulse">
    <polygon points="25,5 30,18 45,18 33,28 38,42 25,33 12,42 17,28 5,18 20,18" fill="#FFD700" />
    <polygon points="25,10 28,20 38,20 30,26 33,37 25,30 17,37 20,26 12,20 22,20" fill="#FFF" opacity="0.5" />
  </svg>
);

const Butterfly = () => (
  <svg width="60" height="50" viewBox="0 0 60 50" className="animate-bounce">
    <ellipse cx="20" cy="25" rx="15" ry="18" fill="#FF69B4" />
    <ellipse cx="40" cy="25" rx="15" ry="18" fill="#DDA0DD" />
    <rect x="27" y="15" width="6" height="20" fill="#8B4513" rx="3" />
    <circle cx="30" cy="12" r="4" fill="#000" />
    <path d="M28,12 L25,5" stroke="#000" strokeWidth="2" />
    <path d="M32,12 L35,5" stroke="#000" strokeWidth="2" />
  </svg>
);

const Car = () => (
  <svg width="70" height="40" viewBox="0 0 70 40" className="animate-pulse">
    <rect x="10" y="15" width="50" height="15" fill="#FF6B35" rx="3" />
    <rect x="15" y="8" width="25" height="12" fill="#4ECDC4" rx="2" />
    <circle cx="20" cy="30" r="6" fill="#333" />
    <circle cx="50" cy="30" r="6" fill="#333" />
    <circle cx="20" cy="30" r="3" fill="#999" />
    <circle cx="50" cy="30" r="3" fill="#999" />
  </svg>
);

const Flower = () => (
  <svg width="50" height="60" viewBox="0 0 50 60" className="animate-bounce">
    <circle cx="25" cy="20" r="8" fill="#FFD700" />
    <circle cx="18" cy="15" r="6" fill="#FF69B4" />
    <circle cx="32" cy="15" r="6" fill="#FF69B4" />
    <circle cx="18" cy="25" r="6" fill="#FF69B4" />
    <circle cx="32" cy="25" r="6" fill="#FF69B4" />
    <rect x="23" y="28" width="4" height="25" fill="#228B22" />
    <ellipse cx="20" cy="40" rx="8" ry="5" fill="#228B22" />
  </svg>
);

const Bird = () => (
  <svg width="60" height="50" viewBox="0 0 60 50" className="animate-pulse">
    <ellipse cx="30" cy="25" rx="18" ry="15" fill="#4ECDC4" />
    <circle cx="22" cy="20" r="4" fill="white" />
    <circle cx="22" cy="20" r="2" fill="black" />
    <polygon points="48,25 60,20 60,30" fill="#FFD700" />
    <path d="M15,15 Q10,8 5,15" fill="#4ECDC4" />
    <path d="M15,35 Q10,42 5,35" fill="#4ECDC4" />
  </svg>
);

const visualComponents = {
  fish: Fish,
  beachBall: BeachBall,
  apple: Apple,
  star: Star,
  butterfly: Butterfly,
  car: Car,
  flower: Flower,
  bird: Bird,
};

export const CountingVisuals = ({ theme, count }: CountingVisualsProps) => {
  const VisualComponent = visualComponents[theme];
  
  return (
    <div className="grid grid-cols-4 gap-3 p-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center justify-center">
          <VisualComponent />
        </div>
      ))}
    </div>
  );
};
