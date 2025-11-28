import { useDroppable } from '@dnd-kit/core';

interface NumberTargetProps {
  number: number;
  isMatched: boolean;
}

export const NumberTarget = ({ number, isMatched }: NumberTargetProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `number-${number}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        relative w-32 h-32 flex items-center justify-center
        rounded-2xl border-4 transition-all duration-300
        ${isMatched 
          ? 'bg-green-100 border-green-400 shadow-lg' 
          : 'bg-white border-blue-300 hover:border-blue-500'
        }
        ${isOver ? 'scale-110 border-yellow-400 bg-yellow-50' : ''}
      `}
    >
      <span 
        className={`text-7xl font-bold transition-colors ${
          isMatched ? 'text-green-600' : 'text-blue-600'
        }`}
        style={{ fontFamily: "'Varela Round', sans-serif" }}
      >
        {number}
      </span>
      
      {isMatched && (
        <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded-2xl">
          <span className="text-5xl animate-bounce">✓</span>
        </div>
      )}
    </div>
  );
};
