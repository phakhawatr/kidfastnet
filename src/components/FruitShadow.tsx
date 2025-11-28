import { useDroppable } from '@dnd-kit/core';
import { FruitSVG } from './FruitSVGs';
import { FruitType } from '@/utils/fruitCountingUtils';

interface FruitShadowProps {
  shadowId: string;
  fruitType: FruitType;
  number: number;
  isMatched: boolean;
}

export const FruitShadow = ({ shadowId, fruitType, number, isMatched }: FruitShadowProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: shadowId,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        relative w-24 h-24 flex items-center justify-center
        transition-all duration-300
        ${isOver ? 'scale-110' : ''}
        ${isMatched ? 'opacity-30' : ''}
      `}
    >
      <FruitSVG type={fruitType} size={90} isShadow />
      
      {!isMatched && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span 
            className="text-5xl font-bold text-yellow-400"
            style={{ 
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              fontFamily: "'Varela Round', sans-serif"
            }}
          >
            {number}
          </span>
        </div>
      )}
      
      {isMatched && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-[bounce_0.5s_ease-in-out]">
            <FruitSVG type={fruitType} size={90} />
          </div>
        </div>
      )}
    </div>
  );
};
