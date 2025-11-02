import React from 'react';
import type { AreaModelProblem } from '@/utils/areaModelUtils';

interface AreaModelVisualizerProps {
  problem: AreaModelProblem;
  showBreakdown?: boolean;
  highlightPart?: number;
}

/**
 * Visual representation of Area Model for Multiplication
 * Singapore Math approach
 */
const AreaModelVisualizer: React.FC<AreaModelVisualizerProps> = ({ 
  problem, 
  showBreakdown = false,
  highlightPart
}) => {
  const { a, b, breakdown } = problem;
  
  // Determine grid size for visualization
  const isSimple = breakdown.a_tens === 0 && breakdown.b_tens === 0;
  const isTwoByOne = breakdown.a_tens > 0 && breakdown.b_tens === 0;
  
  if (isSimple) {
    // Simple array model (e.g., 3 × 4)
    return (
      <div className="flex flex-col items-center gap-4">
        {/* Array Grid */}
        <div className="inline-flex flex-col gap-1 p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border-2 border-orange-300">
          {Array.from({ length: a }).map((_, row) => (
            <div key={row} className="flex gap-1">
              {Array.from({ length: b }).map((_, col) => (
                <div
                  key={col}
                  className="w-10 h-10 bg-orange-400 rounded border-2 border-orange-500 hover:scale-110 transition-transform"
                  title={`${row + 1} × ${col + 1}`}
                />
              ))}
            </div>
          ))}
        </div>
        
        {/* Labels */}
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">
            {a} แถว × {b} หลัก = <span className="text-primary text-xl">{problem.answer}</span>
          </p>
        </div>
      </div>
    );
  }
  
  if (isTwoByOne) {
    // 2-digit × 1-digit (e.g., 23 × 5)
    return (
      <div className="flex flex-col items-center gap-4">
        {showBreakdown && (
          <div className="text-center mb-2">
            <p className="text-lg font-semibold">
              {a} = <span className="text-green-600">{breakdown.a_tens}</span> + <span className="text-blue-600">{breakdown.a_ones}</span>
            </p>
          </div>
        )}
        
        {/* Area Model */}
        <div className="inline-flex flex-col gap-2">
          {/* Tens part */}
          <div className={`transition-all duration-300 ${highlightPart === 0 ? 'ring-4 ring-green-400 scale-105' : ''}`}>
            <div className="p-4 bg-green-100 rounded-lg border-2 border-green-400">
              <div className="text-center mb-2">
                <span className="font-bold text-green-700">{breakdown.a_tens} × {b}</span>
              </div>
              <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${Math.min(b, 10)}, 1fr)` }}>
                {Array.from({ length: Math.min(breakdown.a_tens * b, 100) }).map((_, i) => (
                  <div key={i} className="w-3 h-3 bg-green-500 rounded-sm" />
                ))}
              </div>
              <div className="text-center mt-2 font-bold text-green-700">
                = {breakdown.parts[0].product}
              </div>
            </div>
          </div>
          
          {/* Ones part */}
          <div className={`transition-all duration-300 ${highlightPart === 1 ? 'ring-4 ring-blue-400 scale-105' : ''}`}>
            <div className="p-4 bg-blue-100 rounded-lg border-2 border-blue-400">
              <div className="text-center mb-2">
                <span className="font-bold text-blue-700">{breakdown.a_ones} × {b}</span>
              </div>
              <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${Math.min(b, 10)}, 1fr)` }}>
                {Array.from({ length: Math.min(breakdown.a_ones * b, 100) }).map((_, i) => (
                  <div key={i} className="w-3 h-3 bg-blue-500 rounded-sm" />
                ))}
              </div>
              <div className="text-center mt-2 font-bold text-blue-700">
                = {breakdown.parts[1].product}
              </div>
            </div>
          </div>
        </div>
        
        {showBreakdown && (
          <div className="text-center mt-4 p-4 bg-purple-50 rounded-lg border-2 border-purple-300">
            <p className="text-lg font-semibold">
              <span className="text-green-600">{breakdown.parts[0].product}</span> + 
              <span className="text-blue-600 ml-2">{breakdown.parts[1].product}</span> = 
              <span className="text-purple-600 ml-2 text-xl">{problem.answer}</span>
            </p>
          </div>
        )}
      </div>
    );
  }
  
  // Full 2×2 area model (e.g., 23 × 14)
  return (
    <div className="flex flex-col items-center gap-4">
      {showBreakdown && (
        <div className="text-center mb-2 space-y-1">
          <p className="text-lg font-semibold">
            {a} = <span className="text-purple-600">{breakdown.a_tens}</span> + <span className="text-pink-600">{breakdown.a_ones}</span>
          </p>
          <p className="text-lg font-semibold">
            {b} = <span className="text-green-600">{breakdown.b_tens}</span> + <span className="text-blue-600">{breakdown.b_ones}</span>
          </p>
        </div>
      )}
      
      {/* 2×2 Area Model Grid */}
      <div className="inline-block">
        <div className="grid grid-cols-2 gap-2 p-4 bg-gradient-to-br from-slate-50 to-zinc-100 rounded-xl border-2 border-slate-300">
          {/* Top-left: tens × tens */}
          <div className={`transition-all duration-300 ${highlightPart === 0 ? 'ring-4 ring-purple-400 scale-105 z-10' : ''}`}>
            <div className="p-4 bg-purple-200 rounded-lg border-2 border-purple-400">
              <div className="text-center mb-2">
                <span className="font-bold text-purple-800 text-sm">{breakdown.a_tens} × {breakdown.b_tens}</span>
              </div>
              <div className="flex items-center justify-center h-20">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-800">{breakdown.parts[0].product}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Top-right: tens × ones */}
          <div className={`transition-all duration-300 ${highlightPart === 1 ? 'ring-4 ring-blue-400 scale-105 z-10' : ''}`}>
            <div className="p-4 bg-blue-200 rounded-lg border-2 border-blue-400">
              <div className="text-center mb-2">
                <span className="font-bold text-blue-800 text-sm">{breakdown.a_tens} × {breakdown.b_ones}</span>
              </div>
              <div className="flex items-center justify-center h-20">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-800">{breakdown.parts[1].product}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom-left: ones × tens */}
          <div className={`transition-all duration-300 ${highlightPart === 2 ? 'ring-4 ring-green-400 scale-105 z-10' : ''}`}>
            <div className="p-4 bg-green-200 rounded-lg border-2 border-green-400">
              <div className="text-center mb-2">
                <span className="font-bold text-green-800 text-sm">{breakdown.a_ones} × {breakdown.b_tens}</span>
              </div>
              <div className="flex items-center justify-center h-20">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-800">{breakdown.parts[2].product}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom-right: ones × ones */}
          <div className={`transition-all duration-300 ${highlightPart === 3 ? 'ring-4 ring-pink-400 scale-105 z-10' : ''}`}>
            <div className="p-4 bg-pink-200 rounded-lg border-2 border-pink-400">
              <div className="text-center mb-2">
                <span className="font-bold text-pink-800 text-sm">{breakdown.a_ones} × {breakdown.b_ones}</span>
              </div>
              <div className="flex items-center justify-center h-20">
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-800">{breakdown.parts[3].product}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {showBreakdown && (
        <div className="text-center mt-4 p-4 bg-amber-50 rounded-lg border-2 border-amber-300">
          <p className="text-sm mb-2 text-muted-foreground">บวกทุกส่วน:</p>
          <p className="text-lg font-semibold">
            <span className="text-purple-600">{breakdown.parts[0].product}</span> + 
            <span className="text-blue-600 ml-1">{breakdown.parts[1].product}</span> + 
            <span className="text-green-600 ml-1">{breakdown.parts[2].product}</span> + 
            <span className="text-pink-600 ml-1">{breakdown.parts[3].product}</span> = 
            <span className="text-amber-600 ml-2 text-xl">{problem.answer}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default AreaModelVisualizer;
