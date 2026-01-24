import React from 'react';

interface SlideContainerProps {
  children: React.ReactNode;
  slideNumber: number;
  className?: string;
}

const SlideContainer: React.FC<SlideContainerProps> = ({ 
  children, 
  slideNumber,
  className = ''
}) => {
  return (
    <div 
      data-slide={slideNumber}
      className={`
        relative w-full aspect-[16/9] bg-white rounded-xl shadow-lg overflow-hidden
        flex flex-col p-8 md:p-12
        ${className}
      `}
      style={{ minHeight: '400px' }}
    >
      {children}
      
      {/* Slide number indicator */}
      <div className="absolute bottom-4 right-6 text-sm text-gray-400 font-medium">
        {slideNumber} / 8
      </div>
    </div>
  );
};

export default SlideContainer;
