import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface DraggableNumberTileProps {
  number: number;
  id: string;
  buttonColor: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const DraggableNumberTile = ({ 
  number, 
  id, 
  buttonColor, 
  onClick,
  disabled = false 
}: DraggableNumberTileProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative w-20 h-20 text-3xl font-bold text-white rounded-2xl
        bg-gradient-to-b ${buttonColor}
        border-b-4 shadow-lg
        transition-all duration-150
        active:border-b-0 active:mt-1 active:shadow-md
        hover:scale-110 hover:shadow-xl
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isDragging ? 'cursor-grabbing' : 'cursor-grab hover:cursor-grab'}
      `}
    >
      {number}
    </button>
  );
};
