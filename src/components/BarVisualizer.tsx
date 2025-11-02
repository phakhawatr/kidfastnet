import React from 'react';
import { Bar, BarPart } from '@/utils/barModelUtils';
import { Input } from './ui/input';

interface BarVisualizerProps {
  bars: Bar[];
  onValueChange?: (barId: string, value: string, partId?: string) => void;
  showAnswers?: boolean;
}

export const BarVisualizer: React.FC<BarVisualizerProps> = ({
  bars,
  onValueChange,
  showAnswers = false
}) => {
  // Calculate max value for scaling
  const maxValue = Math.max(
    ...bars.map(bar => {
      if (bar.parts) {
        return bar.parts.reduce((sum, part) => sum + (part.value || 0), 0);
      }
      return bar.value || 0;
    })
  );

  const renderBar = (bar: Bar, index: number) => {
    const isPartWhole = bar.isTotal && bar.parts;

    if (isPartWhole && bar.parts) {
      return (
        <div key={bar.id} className="mb-8">
          {/* Label */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-bold text-gray-700">{bar.label}</span>
            <span className="text-2xl font-bold text-indigo-600">{bar.value}</span>
          </div>

          {/* Total bar with parts */}
          <div className="relative">
            <div className="flex h-20 rounded-lg overflow-hidden shadow-lg border-4 border-indigo-300">
              {bar.parts.map((part, partIndex) => {
                const partValue = part.value || 0;
                const percentage = (partValue / (bar.value || 1)) * 100;
                const hasUnknown = part.value === null;

                return (
                  <div
                    key={part.id}
                    className={`relative flex items-center justify-center ${part.color} border-r-2 border-white/30`}
                    style={{ width: hasUnknown ? `${100 / bar.parts!.length}%` : `${percentage}%` }}
                  >
                    {/* Part label */}
                    <div className="text-center">
                      <div className="text-sm font-semibold text-white drop-shadow-md">
                        {part.label}
                      </div>
                      {hasUnknown && !showAnswers ? (
                        <div className="text-2xl font-bold text-white animate-pulse-slow">?</div>
                      ) : (
                        <div className="text-xl font-bold text-white">{partValue}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bracket showing total */}
            <div className="absolute -right-1 top-0 h-full flex items-center">
              <div className="flex flex-col items-center ml-3">
                <div className="h-1 w-3 bg-indigo-400 rounded-full"></div>
                <div className="w-0.5 flex-1 bg-indigo-400"></div>
                <div className="h-1 w-3 bg-indigo-400 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Input field for missing part */}
          {bar.parts.some(p => p.value === null) && !showAnswers && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                กรอกคำตอบของส่วนที่หายไป:
              </label>
              <Input
                type="number"
                placeholder="?"
                className="w-32 text-center text-xl font-bold"
                onChange={(e) => {
                  const part = bar.parts!.find(p => p.value === null);
                  if (part && onValueChange) {
                    onValueChange(bar.id, e.target.value, part.id);
                  }
                }}
              />
            </div>
          )}
        </div>
      );
    }

    // Comparison bars
    const barValue = bar.value || 0;
    const widthPercentage = (barValue / maxValue) * 100;
    const hasUnknown = bar.value === null;

    return (
      <div key={bar.id} className="mb-6">
        {/* Label */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-bold text-gray-700">{bar.label}</span>
          {!hasUnknown && <span className="text-xl font-bold text-gray-800">{barValue}</span>}
        </div>

        {/* Bar */}
        <div className="relative">
          <div
            className={`h-16 rounded-lg ${bar.color} shadow-lg flex items-center justify-center transition-all duration-300`}
            style={{ width: hasUnknown ? '60%' : `${Math.max(widthPercentage, 15)}%` }}
          >
            {hasUnknown && !showAnswers ? (
              <span className="text-3xl font-bold text-white animate-pulse-slow">?</span>
            ) : (
              <span className="text-2xl font-bold text-white">{barValue}</span>
            )}
          </div>

          {/* Input for unknown bar */}
          {hasUnknown && !showAnswers && (
            <div className="mt-3">
              <Input
                type="number"
                placeholder="?"
                className="w-32 text-center text-xl font-bold"
                onChange={(e) => onValueChange && onValueChange(bar.id, e.target.value)}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  // Check if we need a general answer input (all bars have values, but need to find sum/total)
  const allBarsHaveValues = bars.every(bar => {
    if (bar.parts) {
      return bar.parts.every(p => p.value !== null);
    }
    return bar.value !== null;
  });

  return (
    <div className="space-y-4">
      {bars.map((bar, index) => renderBar(bar, index))}
      
      {/* General answer input for problems where all bars have values */}
      {allBarsHaveValues && !showAnswers && onValueChange && (
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
          <label className="block text-sm font-medium text-purple-800 mb-3">
            💡 กรอกคำตอบ:
          </label>
          <Input
            type="number"
            placeholder="?"
            className="w-40 text-center text-2xl font-bold border-purple-300 focus:border-purple-500"
            onChange={(e) => onValueChange('answer', e.target.value)}
          />
        </div>
      )}
    </div>
  );
};