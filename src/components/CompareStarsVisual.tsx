export default function CompareStarsVisual() {
  return (
    <svg width="50" height="50" viewBox="0 0 60 60" className="drop-shadow-md">
      {/* Star body */}
      <polygon
        points="30,5 36,22 55,22 40,33 46,50 30,40 14,50 20,33 5,22 24,22"
        fill="#FFD700"
        stroke="#FFA500"
        strokeWidth="2"
      />
      
      {/* Left eye */}
      <ellipse cx="22" cy="26" rx="2.5" ry="3.5" fill="black" />
      
      {/* Right eye */}
      <ellipse cx="38" cy="26" rx="2.5" ry="3.5" fill="black" />
      
      {/* Smile */}
      <path
        d="M22,35 Q30,42 38,35"
        stroke="black"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Left blush */}
      <ellipse cx="17" cy="32" rx="3" ry="2" fill="#FF9999" opacity="0.6" />
      
      {/* Right blush */}
      <ellipse cx="43" cy="32" rx="3" ry="2" fill="#FF9999" opacity="0.6" />
      
      {/* Sparkle effect */}
      <circle cx="12" cy="12" r="2" fill="white" opacity="0.9" />
      <circle cx="48" cy="15" r="1.5" fill="white" opacity="0.8" />
    </svg>
  );
}
