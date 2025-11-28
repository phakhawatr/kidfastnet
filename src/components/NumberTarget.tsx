interface NumberTargetProps {
  number: number;
  groupId: string;
  buttonColor: string;
  isMatched: boolean;
  isUsed: boolean;
  onDrop: (number: number) => void;
}

export const NumberTarget = ({ 
  number, 
  buttonColor, 
  isMatched, 
  isUsed,
  onDrop 
}: NumberTargetProps) => {
  const handleClick = () => {
    if (!isMatched && !isUsed) {
      onDrop(number);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isMatched || isUsed}
      className={`
        relative w-16 h-16 text-2xl font-bold text-white rounded-xl
        bg-gradient-to-b ${buttonColor}
        border-b-4 shadow-lg
        transition-all duration-150
        active:border-b-0 active:mt-1 active:shadow-md
        hover:scale-110 hover:shadow-xl
        disabled:opacity-30 disabled:cursor-not-allowed
      `}
    >
      {number}
    </button>
  );
};
