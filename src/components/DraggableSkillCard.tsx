import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DraggableSkillCardProps {
  id: string;
  children: React.ReactNode;
  isEditMode?: boolean;
}

export const DraggableSkillCard = ({ id, children, isEditMode }: DraggableSkillCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id,
    disabled: !isEditMode
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isEditMode ? 'grab' : 'pointer',
    touchAction: isEditMode ? 'none' : 'auto'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isEditMode ? attributes : {})}
      {...(isEditMode ? listeners : {})}
      className={`transition-all duration-200 ${
        isDragging ? 'z-50 scale-105 shadow-2xl' : 'z-0'
      }`}
    >
      {children}
    </div>
  );
};
