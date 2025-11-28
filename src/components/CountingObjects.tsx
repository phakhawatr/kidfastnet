import { ObjectType } from '@/utils/boardCountingUtils';

interface CountingObjectsProps {
  type: ObjectType;
  count: number;
}

const RockingHorse = () => (
  <svg width="100" height="90" viewBox="0 0 80 70" className="animate-pulse">
    <path d="M10,60 Q40,70 70,60" stroke="#dc2626" strokeWidth="6" fill="none" strokeLinecap="round" />
    <ellipse cx="40" cy="35" rx="25" ry="18" fill="#c97a3b" />
    <ellipse cx="18" cy="20" rx="12" ry="15" fill="#c97a3b" />
    <ellipse cx="15" cy="8" rx="4" ry="8" fill="#c97a3b" />
    <circle cx="14" cy="18" r="3" fill="black" />
    <circle cx="15" cy="17" r="1" fill="white" />
    <path d="M20,8 Q30,5 35,15" stroke="#8b4513" strokeWidth="4" fill="none" />
    <ellipse cx="42" cy="28" rx="12" ry="8" fill="#dc2626" />
    <rect x="25" y="45" width="6" height="12" fill="#c97a3b" rx="2" />
    <rect x="50" y="45" width="6" height="12" fill="#c97a3b" rx="2" />
  </svg>
);

const Caterpillar = () => (
  <svg width="100" height="80" viewBox="0 0 80 60" className="animate-pulse">
    <circle cx="15" cy="30" r="12" fill="#86efac" />
    <circle cx="30" cy="30" r="12" fill="#4ade80" />
    <circle cx="45" cy="30" r="12" fill="#22c55e" />
    <circle cx="60" cy="30" r="12" fill="#16a34a" />
    <circle cx="10" cy="25" r="3" fill="black" />
    <circle cx="18" cy="25" r="3" fill="black" />
    <circle cx="11" cy="24" r="1" fill="white" />
    <circle cx="19" cy="24" r="1" fill="white" />
    <path d="M8,18 L5,12" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
    <path d="M20,18 L23,12" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />
    <path d="M12,34 Q15,38 18,34" stroke="black" strokeWidth="2" fill="none" />
    <ellipse cx="10" cy="32" rx="3" ry="2" fill="#f87171" opacity="0.6" />
    <ellipse cx="20" cy="32" rx="3" ry="2" fill="#f87171" opacity="0.6" />
  </svg>
);

const TeddyBear = () => (
  <svg width="90" height="100" viewBox="0 0 70 80" className="animate-pulse">
    <circle cx="20" cy="15" r="10" fill="#a16b4a" />
    <circle cx="50" cy="15" r="10" fill="#a16b4a" />
    <ellipse cx="35" cy="30" rx="20" ry="22" fill="#c97a3b" />
    <circle cx="28" cy="26" r="3" fill="black" />
    <circle cx="42" cy="26" r="3" fill="black" />
    <ellipse cx="35" cy="32" rx="5" ry="4" fill="#8b5a3c" />
    <circle cx="35" cy="31" r="2" fill="black" />
    <path d="M30,36 Q35,40 40,36" stroke="black" strokeWidth="2" fill="none" />
    <ellipse cx="35" cy="58" rx="18" ry="20" fill="#c97a3b" />
    <ellipse cx="28" cy="68" rx="8" ry="10" fill="#a16b4a" />
    <ellipse cx="42" cy="68" rx="8" ry="10" fill="#a16b4a" />
    <path d="M28,52 Q18,55 12,48" stroke="#a16b4a" strokeWidth="6" strokeLinecap="round" />
    <path d="M42,52 Q52,55 58,48" stroke="#a16b4a" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

const Ball = () => (
  <svg width="80" height="80" viewBox="0 0 60 60" className="animate-bounce">
    <circle cx="30" cy="30" r="26" fill="#ef4444" />
    <path d="M30,4 Q40,30 30,56" fill="#fbbf24" />
    <path d="M30,4 Q20,30 30,56" fill="#3b82f6" />
    <circle cx="30" cy="8" r="5" fill="white" opacity="0.7" />
    <path d="M10,30 Q30,20 50,30" fill="#22c55e" />
    <path d="M10,30 Q30,40 50,30" fill="white" opacity="0.3" />
  </svg>
);

const Rocket = () => (
  <svg width="80" height="100" viewBox="0 0 60 80" className="animate-pulse">
    <polygon points="30,5 40,25 20,25" fill="#dc2626" />
    <rect x="20" y="25" width="20" height="30" fill="#ef4444" rx="2" />
    <circle cx="30" cy="35" r="6" fill="#3b82f6" />
    <circle cx="30" cy="35" r="3" fill="#1e40af" />
    <polygon points="20,55 15,70 20,60" fill="#f59e0b" />
    <polygon points="40,55 45,70 40,60" fill="#f59e0b" />
    <rect x="25" y="30" width="3" height="8" fill="white" opacity="0.3" />
    <rect x="32" y="30" width="3" height="8" fill="white" opacity="0.3" />
    <path d="M28,70 Q30,75 32,70" stroke="#fbbf24" strokeWidth="3" fill="none" />
  </svg>
);

const Dinosaur = () => (
  <svg width="100" height="90" viewBox="0 0 80 70" className="animate-pulse">
    <ellipse cx="50" cy="45" rx="22" ry="18" fill="#86efac" />
    <ellipse cx="25" cy="30" rx="15" ry="18" fill="#86efac" />
    <circle cx="20" cy="25" r="3" fill="black" />
    <circle cx="21" cy="24" r="1" fill="white" />
    <path d="M18,32 Q22,36 26,32" stroke="black" strokeWidth="2" fill="none" />
    <path d="M30,15 L32,8 L34,15 L36,10 L38,15 L40,12 L42,15" 
          stroke="#22c55e" strokeWidth="3" fill="none" strokeLinecap="round" />
    <rect x="42" y="58" width="8" height="10" fill="#86efac" rx="2" />
    <rect x="58" y="58" width="8" height="10" fill="#86efac" rx="2" />
    <path d="M72,45 Q75,50 72,55 L68,50 Z" fill="#86efac" />
    <ellipse cx="16" cy="28" rx="2" ry="3" fill="#f87171" opacity="0.6" />
  </svg>
);

const objectComponents = {
  rockingHorse: RockingHorse,
  caterpillar: Caterpillar,
  teddyBear: TeddyBear,
  ball: Ball,
  rocket: Rocket,
  dinosaur: Dinosaur,
};

export const CountingObjects = ({ type, count }: CountingObjectsProps) => {
  const ObjectComponent = objectComponents[type];

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center justify-center">
          <ObjectComponent />
        </div>
      ))}
    </>
  );
};
