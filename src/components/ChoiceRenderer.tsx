import React from 'react';
import ShapeDisplay from './ShapeDisplay';
import { ClockDisplay } from './ClockDisplay';

interface ChoiceRendererProps {
  choice: string;
  size?: number;
  className?: string;
}

const ChoiceRenderer: React.FC<ChoiceRendererProps> = ({ 
  choice, 
  size = 64,
  className = '' 
}) => {
  if (!choice) return null;

  // Convert choice to string to handle numbers
  const choiceStr = String(choice);
  
  console.log('🎯 ChoiceRenderer processing:', { choiceStr });

  // Check if this is a Thai time format: "X นาฬิกา Y นาที"
  const thaiTimePattern = /^(\d{1,2})\s*นาฬิกา\s*(\d{1,2})?\s*นาที$/i;
  const thaiTimeMatch = choiceStr.trim().match(thaiTimePattern);
  
  if (thaiTimeMatch) {
    const hour = parseInt(thaiTimeMatch[1], 10);
    const minute = thaiTimeMatch[2] ? parseInt(thaiTimeMatch[2], 10) : 0;
    console.log('🕐 Thai time pattern matched:', { hour, minute });
    return (
      <div className={`flex flex-col items-center gap-1 ${className}`}>
        <ClockDisplay hour={hour} minute={minute} size={size} />
        <span className="text-xs text-muted-foreground">{choiceStr}</span>
      </div>
    );
  }

  // Check if this is a time pattern: [time:HH:MM]
  const timePattern = /^\[time:(\d{1,2}):(\d{1,2})\]$/i;
  const timeMatch = choiceStr.trim().match(timePattern);
  
  if (timeMatch) {
    const hour = parseInt(timeMatch[1], 10);
    const minute = parseInt(timeMatch[2], 10);
    console.log('🕐 Time pattern matched:', { hour, minute });
    return (
      <div className={`flex justify-center items-center ${className}`}>
        <ClockDisplay hour={hour} minute={minute} size={size} />
      </div>
    );
  }

  // Check if this is a shape code pattern: shape-color (e.g., "circle-red", "triangle-blue")
  const shapePattern = /^(circle|square|triangle|ellipse)-(red|blue|green|orange|yellow|sky|purple|pink|teal)$/i;
  
  if (shapePattern.test(choiceStr.trim())) {
    console.log('✅ Shape pattern matched:', choiceStr.trim());
    return (
      <div className={`flex justify-center items-center ${className}`}>
        <ShapeDisplay shape={choiceStr.trim()} size={size} />
      </div>
    );
  }

  // Not a shape code, render as regular text
  return <span className={className}>{choiceStr}</span>;
};

export default ChoiceRenderer;
