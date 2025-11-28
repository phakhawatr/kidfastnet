export default function BeachBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Green Hills in Background */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 300" className="w-full h-auto">
          {/* Back hills */}
          <ellipse cx="200" cy="250" rx="250" ry="100" fill="#4ade80" opacity="0.6" />
          <ellipse cx="600" cy="270" rx="300" ry="120" fill="#22c55e" opacity="0.7" />
          <ellipse cx="1000" cy="260" rx="280" ry="110" fill="#4ade80" opacity="0.6" />
          
          {/* Ocean waves */}
          <path
            d="M0,200 Q150,180 300,200 T600,200 T900,200 T1200,200 L1200,300 L0,300 Z"
            fill="#3b82f6"
            opacity="0.7"
          />
          <path
            d="M0,220 Q150,200 300,220 T600,220 T900,220 T1200,220 L1200,300 L0,300 Z"
            fill="#2563eb"
            opacity="0.8"
          >
            <animate
              attributeName="d"
              dur="3s"
              repeatCount="indefinite"
              values="
                M0,220 Q150,200 300,220 T600,220 T900,220 T1200,220 L1200,300 L0,300 Z;
                M0,215 Q150,195 300,215 T600,215 T900,215 T1200,215 L1200,300 L0,300 Z;
                M0,220 Q150,200 300,220 T600,220 T900,220 T1200,220 L1200,300 L0,300 Z
              "
            />
          </path>
          
          {/* Sand beach */}
          <path
            d="M0,280 L1200,280 L1200,300 L0,300 Z"
            fill="url(#sandGradient)"
          />
          
          <defs>
            <linearGradient id="sandGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Palm Trees */}
      <div className="absolute bottom-16 left-8 md:left-16">
        <svg width="80" height="120" viewBox="0 0 80 120">
          {/* Tree trunk */}
          <rect x="35" y="60" width="10" height="60" fill="#8b4513" rx="2" />
          
          {/* Palm leaves */}
          <ellipse cx="40" cy="50" rx="30" ry="15" fill="#22c55e" transform="rotate(-30 40 50)" />
          <ellipse cx="40" cy="50" rx="30" ry="15" fill="#22c55e" transform="rotate(30 40 50)" />
          <ellipse cx="40" cy="45" rx="25" ry="12" fill="#4ade80" transform="rotate(0 40 45)" />
          <ellipse cx="40" cy="50" rx="28" ry="14" fill="#4ade80" transform="rotate(-60 40 50)" />
          <ellipse cx="40" cy="50" rx="28" ry="14" fill="#4ade80" transform="rotate(60 40 50)" />
        </svg>
      </div>

      <div className="absolute bottom-20 right-12 md:right-24">
        <svg width="60" height="100" viewBox="0 0 60 100">
          {/* Tree trunk */}
          <rect x="25" y="50" width="8" height="50" fill="#8b4513" rx="2" />
          
          {/* Palm leaves */}
          <ellipse cx="29" cy="42" rx="24" ry="12" fill="#22c55e" transform="rotate(-25 29 42)" />
          <ellipse cx="29" cy="42" rx="24" ry="12" fill="#22c55e" transform="rotate(25 29 42)" />
          <ellipse cx="29" cy="38" rx="20" ry="10" fill="#4ade80" transform="rotate(0 29 38)" />
        </svg>
      </div>

      {/* Clouds */}
      <div className="absolute top-12 left-1/4 opacity-70 animate-[float_6s_ease-in-out_infinite]">
        <svg width="120" height="60" viewBox="0 0 120 60">
          <ellipse cx="30" cy="35" rx="25" ry="20" fill="white" />
          <ellipse cx="55" cy="30" rx="30" ry="25" fill="white" />
          <ellipse cx="85" cy="35" rx="25" ry="20" fill="white" />
        </svg>
      </div>

      <div className="absolute top-24 right-1/4 opacity-60 animate-[float_8s_ease-in-out_infinite_1s]">
        <svg width="100" height="50" viewBox="0 0 100 50">
          <ellipse cx="25" cy="30" rx="20" ry="16" fill="white" />
          <ellipse cx="45" cy="25" rx="25" ry="20" fill="white" />
          <ellipse cx="70" cy="30" rx="20" ry="16" fill="white" />
        </svg>
      </div>
    </div>
  );
}
