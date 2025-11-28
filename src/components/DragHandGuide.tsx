interface DragHandGuideProps {
  correctNumber: number;
}

export const DragHandGuide = ({ correctNumber }: DragHandGuideProps) => {
  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 animate-[dragHand_4s_ease-in-out_infinite]">
      <svg width="60" height="80" viewBox="0 0 60 80">
        {/* Hand palm */}
        <ellipse cx="30" cy="45" rx="18" ry="22" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
        {/* Thumb */}
        <ellipse cx="15" cy="40" rx="8" ry="12" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
        {/* Fingers */}
        <rect x="22" y="20" width="6" height="20" rx="3" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
        <rect x="30" y="18" width="6" height="22" rx="3" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
        <rect x="38" y="20" width="6" height="20" rx="3" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
        {/* Wrist */}
        <rect x="20" y="60" width="20" height="15" rx="4" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
        {/* Pointing finger highlight */}
        <circle cx="33" cy="15" r="4" fill="#fef3c7" opacity="0.8" />
      </svg>
      
      {/* Arrow pointing down */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
        <svg width="30" height="20" viewBox="0 0 30 20">
          <polygon points="15,0 25,15 5,15" fill="#fbbf24" />
        </svg>
      </div>

      {/* Text hint */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <div className="bg-yellow-400 text-slate-900 px-4 py-2 rounded-full font-bold shadow-lg">
          ลาก {correctNumber} มาวาง!
        </div>
      </div>

      <style>{`
        @keyframes dragHand {
          0% { transform: translate(-50%, 0) rotate(0deg); }
          20% { transform: translate(-50%, -10px) rotate(-5deg); }
          40% { transform: translate(calc(-50% + 100px), -60px) rotate(-10deg); }
          60% { transform: translate(calc(-50% + 100px), -60px) scale(0.9); }
          80% { transform: translate(-50%, -10px) rotate(-5deg); }
          100% { transform: translate(-50%, 0) rotate(0deg); }
        }
      `}</style>
    </div>
  );
};
