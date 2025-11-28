export default function MascotCharacters() {
  return (
    <>
      {/* Lion Cub - Left Side */}
      <div className="absolute left-0 md:left-8 top-1/2 transform -translate-y-1/2 hidden lg:block">
        <svg width="120" height="140" viewBox="0 0 120 140" className="drop-shadow-xl">
          {/* Mane */}
          <circle cx="60" cy="50" r="45" fill="#fbbf24" />
          <circle cx="35" cy="35" r="15" fill="#f59e0b" />
          <circle cx="85" cy="35" r="15" fill="#f59e0b" />
          <circle cx="25" cy="55" r="15" fill="#f59e0b" />
          <circle cx="95" cy="55" r="15" fill="#f59e0b" />
          <circle cx="35" cy="75" r="15" fill="#f59e0b" />
          <circle cx="85" cy="75" r="15" fill="#f59e0b" />
          
          {/* Face */}
          <circle cx="60" cy="50" r="35" fill="#fde047" />
          
          {/* Eyes */}
          <ellipse cx="50" cy="45" rx="4" ry="6" fill="black" />
          <ellipse cx="70" cy="45" rx="4" ry="6" fill="black" />
          <circle cx="51" cy="44" r="1.5" fill="white" />
          <circle cx="71" cy="44" r="1.5" fill="white" />
          
          {/* Nose */}
          <ellipse cx="60" cy="55" rx="8" ry="6" fill="#fbbf24" />
          <ellipse cx="60" cy="54" rx="4" ry="3" fill="black" />
          
          {/* Smile */}
          <path d="M50,60 Q60,68 70,60" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
          
          {/* Body with blue shirt */}
          <rect x="40" y="80" width="40" height="40" rx="8" fill="#3b82f6" />
          
          {/* Arms pointing right */}
          <ellipse cx="25" cy="95" rx="12" ry="8" fill="#fde047" transform="rotate(30 25 95)" />
          <ellipse cx="95" cy="95" rx="12" ry="8" fill="#fde047" transform="rotate(-20 95 95)" />
          
          {/* Right arm pointing */}
          <path d="M85,90 L110,75" stroke="#fde047" strokeWidth="10" strokeLinecap="round" />
          <circle cx="112" cy="73" r="7" fill="#fde047" />
        </svg>
      </div>

      {/* Bunny - Right Side */}
      <div className="absolute right-0 md:right-8 top-1/2 transform -translate-y-1/2 hidden lg:block">
        <svg width="120" height="140" viewBox="0 0 120 140" className="drop-shadow-xl">
          {/* Long ears */}
          <ellipse cx="45" cy="25" rx="12" ry="35" fill="#fecdd3" transform="rotate(-15 45 25)" />
          <ellipse cx="75" cy="25" rx="12" ry="35" fill="#fecdd3" transform="rotate(15 75 25)" />
          <ellipse cx="45" cy="25" rx="8" ry="28" fill="#fda4af" transform="rotate(-15 45 25)" />
          <ellipse cx="75" cy="25" rx="8" ry="28" fill="#fda4af" transform="rotate(15 75 25)" />
          
          {/* Head */}
          <circle cx="60" cy="60" r="35" fill="#fecdd3" />
          
          {/* Eyes */}
          <ellipse cx="50" cy="55" rx="4" ry="6" fill="black" />
          <ellipse cx="70" cy="55" rx="4" ry="6" fill="black" />
          <circle cx="51" cy="54" r="1.5" fill="white" />
          <circle cx="71" cy="54" r="1.5" fill="white" />
          
          {/* Nose */}
          <ellipse cx="60" cy="68" rx="5" ry="4" fill="#fb7185" />
          
          {/* Smile */}
          <path d="M50,72 Q60,78 70,72" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
          
          {/* Cheeks */}
          <circle cx="42" cy="65" r="6" fill="#fda4af" opacity="0.5" />
          <circle cx="78" cy="65" r="6" fill="#fda4af" opacity="0.5" />
          
          {/* Body */}
          <ellipse cx="60" cy="105" rx="28" ry="30" fill="#fecdd3" />
          
          {/* Arms */}
          <ellipse cx="35" cy="100" rx="10" ry="7" fill="#fecdd3" transform="rotate(-30 35 100)" />
          <ellipse cx="85" cy="100" rx="10" ry="7" fill="#fecdd3" transform="rotate(30 85 100)" />
          
          {/* Pink bow */}
          <path d="M40,20 L50,25 L40,30 M70,25 L80,20 L80,30 L70,25" fill="#ec4899" />
          <circle cx="60" cy="25" r="5" fill="#ec4899" />
        </svg>
      </div>
    </>
  );
}
