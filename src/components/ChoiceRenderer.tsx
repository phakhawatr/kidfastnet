import React from 'react';
import ShapeDisplay from './ShapeDisplay';

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

  // Check if this is a shape code pattern: shape-color (e.g., "circle-red", "triangle-blue")
  const shapePattern = /^(circle|square|triangle|ellipse)-(red|blue|green|orange|yellow|sky|purple|pink|teal)$/;
  
  if (shapePattern.test(choiceStr.trim())) {
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
