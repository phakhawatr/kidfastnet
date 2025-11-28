import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { FruitSVG } from './FruitSVGs';
import { FruitType } from '@/utils/fruitCountingUtils';

interface FruitGroupProps {
  id: string;
  fruitType: FruitType;
  count: number;
  isMatched: boolean;
}

export const FruitGroup = ({ id, fruitType, count, isMatched }: FruitGroupProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled: isMatched,
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined;

  if (isMatched) {
    return <div className="w-full h-32" />; // Empty space for matched group
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        cursor-grab active:cursor-grabbing
        transition-all duration-200 p-4 rounded-xl bg-white/50
        ${isDragging ? 'scale-110 opacity-50 shadow-2xl' : 'hover:scale-105 hover:shadow-lg'}
      `}
    >
      <div className="flex flex-wrap gap-2 justify-center items-center">
        {[...Array(count)].map((_, i) => (
          <div 
            key={i}
            className="animate-pulse-slow"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <FruitSVG type={fruitType} size={count > 5 ? 50 : 60} />
          </div>
        ))}
      </div>
    </div>
  );
};
