import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { FruitSVG } from './FruitSVGs';
import { FruitType } from '@/utils/fruitCountingUtils';

interface DraggableFruitProps {
  id: string;
  fruitType: FruitType;
  isMatched: boolean;
}

export const DraggableFruit = ({ id, fruitType, isMatched }: DraggableFruitProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled: isMatched,
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined;

  if (isMatched) {
    return <div className="w-20 h-20" />; // Empty space for matched fruit
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        cursor-grab active:cursor-grabbing
        transition-all duration-200
        ${isDragging ? 'scale-110 opacity-50' : 'hover:scale-105 animate-pulse'}
      `}
    >
      <FruitSVG type={fruitType} size={80} />
    </div>
  );
};
