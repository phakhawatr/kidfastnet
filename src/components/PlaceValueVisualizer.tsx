import React from 'react';

interface PlaceValueVisualizerProps {
  number: number;
  highlightPlace?: number; // 0 = ones, 1 = tens, 2 = hundreds, 3 = thousands
}

/**
 * Visual representation of place value using Base-10 Blocks
 * Singapore Math approach
 */
const PlaceValueVisualizer: React.FC<PlaceValueVisualizerProps> = ({ 
  number, 
  highlightPlace 
}) => {
  // Extract digits
  const digits = number.toString().split('').reverse();
  
  // Place names
  const placeNames = ['หน่วย', 'สิบ', 'ร้อย', 'พัน'];
  
  // Colors for each place
  const placeColors = [
    'bg-blue-500',    // ones
    'bg-green-500',   // tens
    'bg-orange-500',  // hundreds
    'bg-purple-500'   // thousands
  ];
  
  const highlightColors = [
    'ring-blue-400',
    'ring-green-400',
    'ring-orange-400',
    'ring-purple-400'
  ];

  return (
    <div className="w-full">
      {/* Number Display */}
      <div className="flex justify-center items-center gap-3 mb-8">
        {digits.slice().reverse().map((digit, index) => {
          const place = digits.length - 1 - index;
          const isHighlighted = highlightPlace === place;
          
          return (
            <div
              key={index}
              className={`
                relative flex flex-col items-center justify-center
                w-16 h-20 rounded-xl font-bold text-3xl
                transition-all duration-300
                ${isHighlighted 
                  ? `${placeColors[place]} text-white ring-4 ${highlightColors[place]} scale-110 shadow-xl` 
                  : 'bg-card text-foreground border-2 border-border'
                }
              `}
            >
              <span>{digit}</span>
              <span className="text-xs font-normal mt-1 opacity-70">
                {placeNames[place]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Base-10 Blocks Visualization */}
      <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
        {digits.map((digit, place) => {
          const count = parseInt(digit);
          if (count === 0) return null;
          
          const isHighlighted = highlightPlace === place;
          
          return (
            <div
              key={place}
              className={`
                p-4 rounded-xl transition-all duration-300
                ${isHighlighted 
                  ? 'bg-accent/50 ring-2 ring-primary' 
                  : 'bg-card'
                }
              `}
            >
              <div className="flex items-center gap-4 mb-3">
                <span className={`
                  px-3 py-1 rounded-lg text-sm font-semibold text-white
                  ${placeColors[place]}
                `}>
                  หลัก{placeNames[place]}
                </span>
                <span className="text-lg font-bold text-foreground">
                  {count} × {Math.pow(10, place)} = {count * Math.pow(10, place)}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {place === 0 && renderOnes(count, placeColors[place])}
                {place === 1 && renderTens(count, placeColors[place])}
                {place === 2 && renderHundreds(count, placeColors[place])}
                {place === 3 && renderThousands(count, placeColors[place])}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Render individual unit cubes (ones)
const renderOnes = (count: number, color: string) => {
  return Array.from({ length: count }).map((_, i) => (
    <div
      key={i}
      className={`w-8 h-8 ${color} rounded border-2 border-white/30 shadow-sm`}
      title="1 หน่วย"
    />
  ));
};

// Render ten-rods (tens)
const renderTens = (count: number, color: string) => {
  return Array.from({ length: count }).map((_, i) => (
    <div
      key={i}
      className={`w-20 h-8 ${color} rounded border-2 border-white/30 shadow-sm flex items-center justify-center gap-0.5`}
      title="10 หน่วย (1 สิบ)"
    >
      {Array.from({ length: 10 }).map((_, j) => (
        <div key={j} className="w-1 h-6 bg-white/30 rounded-sm" />
      ))}
    </div>
  ));
};

// Render hundred-flats (hundreds)
const renderHundreds = (count: number, color: string) => {
  return Array.from({ length: count }).map((_, i) => (
    <div
      key={i}
      className={`w-24 h-24 ${color} rounded border-2 border-white/30 shadow-sm relative overflow-hidden`}
      title="100 หน่วย (1 ร้อย)"
    >
      {/* Grid pattern to show 10x10 */}
      <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 gap-0.5 p-1">
        {Array.from({ length: 100 }).map((_, j) => (
          <div key={j} className="bg-white/20 rounded-sm" />
        ))}
      </div>
    </div>
  ));
};

// Render thousand-blocks (thousands)
const renderThousands = (count: number, color: string) => {
  return Array.from({ length: count }).map((_, i) => (
    <div
      key={i}
      className={`w-28 h-28 ${color} rounded border-2 border-white/30 shadow-lg relative overflow-hidden`}
      title="1000 หน่วย (1 พัน)"
    >
      {/* 3D-like appearance */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
        <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 gap-0.5 p-1">
          {Array.from({ length: 100 }).map((_, j) => (
            <div key={j} className="bg-white/10 rounded-sm" />
          ))}
        </div>
        {/* "1000" label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-xl drop-shadow-lg">1000</span>
        </div>
      </div>
    </div>
  ));
};

export default PlaceValueVisualizer;
