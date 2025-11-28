import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface DraggableAnswerProps {
  value: number;
  color: string;
  isSelected: boolean;
  isCorrect: boolean | null;
  onClick: () => void;
}

export const DraggableAnswer = ({ 
  value, 
  color, 
  isSelected, 
  isCorrect,
  onClick 
}: DraggableAnswerProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `answer-${value}`,
    data: { value }
  });

  const style = transform ? {
    transform: CSS.Transform.toString(transform),
  } : undefined;

  const getButtonStyles = () => {
    if (isSelected && isCorrect === false) {
      return 'bg-gradient-to-br from-red-500 to-red-700 animate-shake';
    }
    if (isSelected && isCorrect === true) {
      return 'bg-gradient-to-br from-green-500 to-green-700';
    }
    return color;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`
        ${getButtonStyles()}
        text-white text-5xl font-bold
        rounded-2xl p-8
        shadow-2xl
        cursor-pointer
        transition-all duration-200
        hover:scale-110 active:scale-95
        ${isDragging ? 'opacity-50 z-50' : 'opacity-100'}
        select-none
        border-4 border-white/30
      `}
    >
      {value}
    </div>
  );
};
