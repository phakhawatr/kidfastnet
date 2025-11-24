import React from 'react';
import ShapeDisplay from './ShapeDisplay';

interface QuestionTextRendererProps {
  text: string;
  className?: string;
}

const QuestionTextRenderer: React.FC<QuestionTextRendererProps> = ({ text, className = '' }) => {
  if (!text) return null;

  // Pattern 1: [shapes:circle-red,triangle-yellow,square-sky] - multiple shapes in a box
  const multiShapePattern = /\[shapes:([^\]]+)\]/g;
  
  // Pattern 2: [circle-red] - single shape inline
  const singleShapePattern = /\[([a-z]+-[a-z]+)\]/g;

  let processedText = text;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  // Process multiple shapes pattern first
  let match;
  while ((match = multiShapePattern.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index);
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
    const remainingText = text.substring(lastIndex);
    
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
  if (singleShapePattern.test(text)) {
    const parts = text.split(singleShapePattern);
    const matches = text.match(singleShapePattern);
    
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
  return <div className={className}>{text}</div>;
};

export default QuestionTextRenderer;
