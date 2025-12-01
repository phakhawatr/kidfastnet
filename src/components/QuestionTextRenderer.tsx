import React from 'react';
import ShapeDisplay from './ShapeDisplay';
import { ClockDisplay } from './ClockDisplay';

interface QuestionTextRendererProps {
  text: string;
  className?: string;
}

const QuestionTextRenderer: React.FC<QuestionTextRendererProps> = ({ text, className = '' }) => {
  if (!text) return null;

  // Convert text to string to handle numbers
  const textStr = String(text);

  // Pattern 1: [shapes:circle-red,triangle-yellow,square-sky] - multiple shapes in a box
  const multiShapePattern = /\[shapes:([^\]]+)\]/gi;
  
  // Pattern 2: [circle-red] - single shape inline (more flexible: handles uppercase and numbers)
  const singleShapePattern = /\[([a-z0-9]+-[a-z0-9]+)\]/gi;
  
  // Pattern 3: [clock:10:45] - display clock at specified time
  const clockPattern = /\[clock:(\d{1,2}):(\d{1,2})\]/gi;
  
  console.log('📝 QuestionTextRenderer processing:', { textStr });
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  // Process clock pattern first
  let match;
  while ((match = clockPattern.exec(textStr)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      const beforeText = textStr.substring(lastIndex, match.index);
      elements.push(<span key={`text-${lastIndex}`}>{beforeText}</span>);
    }

    // Parse hour and minute
    const hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    
    elements.push(
      <div key={`clock-${match.index}`} className="inline-flex justify-center items-center bg-purple-50 dark:bg-purple-900/20 px-3 py-2 rounded-lg my-2">
        <ClockDisplay hour={hour} minute={minute} size={120} />
      </div>
    );

    lastIndex = match.index + match[0].length;
  }

  // If we found clocks, process the remaining text
  if (elements.length > 0) {
    const remainingText = textStr.substring(lastIndex);
    if (remainingText) {
      elements.push(<span key={`text-end`}>{remainingText}</span>);
    }
    return <div className={className}>{elements}</div>;
  }

  // Reset for multiple shapes pattern
  lastIndex = 0;
  multiShapePattern.lastIndex = 0;
  
  // Process multiple shapes pattern
  while ((match = multiShapePattern.exec(textStr)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      const beforeText = textStr.substring(lastIndex, match.index);
      elements.push(<span key={`text-${lastIndex}`}>{beforeText}</span>);
    }

    // Parse and render shapes
    const shapesStr = match[1];
    const shapes = shapesStr.split(',').map(s => s.trim());
    
    elements.push(
      <div key={`shapes-${match.index}`} className="inline-flex flex-wrap gap-2 items-center bg-purple-50 dark:bg-purple-900/20 px-3 py-2 rounded-lg my-2">
        {shapes.map((shape, idx) => (
          <ShapeDisplay key={`${shape}-${idx}`} shape={shape} size={48} />
        ))}
      </div>
    );

    lastIndex = match.index + match[0].length;
  }

  // If we found multiple shapes, process the remaining text for single shapes
  if (elements.length > 0) {
    const remainingText = textStr.substring(lastIndex);
    
    // Process single shape pattern in remaining text
    const parts = remainingText.split(singleShapePattern);
    parts.forEach((part, index) => {
      if (index % 2 === 0) {
        // Regular text
        if (part) {
          elements.push(<span key={`text-end-${index}`}>{part}</span>);
        }
      } else {
        // Shape code
        elements.push(
          <span key={`shape-inline-${index}`} className="inline-flex items-center mx-1">
            <ShapeDisplay shape={part} size={40} />
          </span>
        );
      }
    });

    return <div className={className}>{elements}</div>;
  }

  // No multiple shapes found, check for single shapes only
  if (singleShapePattern.test(textStr)) {
    const parts = textStr.split(singleShapePattern);
    const matches = textStr.match(singleShapePattern);
    
    return (
      <div className={className}>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {matches && matches[index] && (
              <span className="inline-flex items-center mx-1">
                <ShapeDisplay 
                  shape={matches[index].replace('[', '').replace(']', '')} 
                  size={40} 
                />
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // No shape patterns found, return plain text
  return <div className={className}>{textStr}</div>;
};

export default QuestionTextRenderer;
