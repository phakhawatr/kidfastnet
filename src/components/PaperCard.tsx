import { ReactNode } from 'react';

interface PaperCardProps {
  children: ReactNode;
  isActive?: boolean;
  rotation?: number;
}

export const PaperCard = ({ children, isActive = true, rotation = 0 }: PaperCardProps) => {
  return (
    <div
      className={`
        relative p-8 rounded-lg shadow-2xl
        ${isActive ? 'bg-white' : 'bg-green-100'}
        transition-all duration-300
      `}
      style={{
        transform: `rotate(${rotation}deg)`,
      }}
    >
      {children}
    </div>
  );
};
