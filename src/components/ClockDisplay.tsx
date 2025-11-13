interface ClockDisplayProps {
  hour: number;
  minute: number;
  size?: number;
}

export function ClockDisplay({ hour, minute, size = 180 }: ClockDisplayProps) {
  console.log('🕐 ClockDisplay rendering:', { hour, minute, size });
  
  const r = 80;
  const cx = size / 2;
  const cy = size / 2;

  const minuteAngle = minute * 6; // 360/60
  const hourAngle = (hour % 12) * 30 + minute * 0.5; // 360/12 + minute offset

  const hand = (angle: number, length: number, width: number) => {
    const rad = (Math.PI / 180) * (angle - 90);
    const x = cx + length * Math.cos(rad);
    const y = cy + length * Math.sin(rad);
    return (
      <line 
        x1={cx} 
        y1={cy} 
        x2={x} 
        y2={y} 
        strokeWidth={width} 
        stroke="currentColor" 
        strokeLinecap="round" 
      />
    );
  };

  const ticks = [];
  for (let i = 0; i < 60; i++) {
    const ang = (Math.PI / 30) * i;
    const isHourTick = i % 5 === 0;
    const r1 = r - (isHourTick ? 8 : 4);
    const x1 = cx + r1 * Math.cos(ang - Math.PI / 2);
    const y1 = cy + r1 * Math.sin(ang - Math.PI / 2);
    const x2 = cx + r * Math.cos(ang - Math.PI / 2);
    const y2 = cy + r * Math.sin(ang - Math.PI / 2);
    ticks.push(
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="currentColor"
        strokeOpacity={isHourTick ? 0.8 : 0.35}
        strokeWidth={isHourTick ? 2 : 1}
      />
    );
  }

  const numbers = [];
  for (let n = 1; n <= 12; n++) {
    const ang = (Math.PI / 6) * n;
    const rnum = r - 22;
    const x = cx + rnum * Math.cos(ang - Math.PI / 2);
    const y = cy + rnum * Math.sin(ang - Math.PI / 2) + 4;
    numbers.push(
      <text 
        key={n} 
        x={x} 
        y={y} 
        textAnchor="middle" 
        className="text-[12px] select-none fill-current"
      >
        {n}
      </text>
    );
  }

  return (
    <div className="flex justify-center my-4">
      <svg 
        viewBox={`0 0 ${size} ${size}`} 
        className="w-full h-auto text-foreground"
        style={{ maxWidth: `${size}px` }}
      >
        <circle 
          cx={cx} 
          cy={cy} 
          r={r + 6} 
          fill="hsl(var(--background))" 
          stroke="currentColor" 
          strokeWidth="2.5" 
        />
        {ticks}
        {numbers}
        <g>
          {hand(hourAngle, r * 0.55, 4.5)}
          {hand(minuteAngle, r * 0.8, 3)}
          <circle cx={cx} cy={cy} r={3.5} fill="currentColor" />
        </g>
      </svg>
    </div>
  );
}
