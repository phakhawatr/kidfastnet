import { FruitSVG } from './FruitSVGs';
import { FruitType } from '@/utils/fruitCountingUtils';

interface FruitGroupProps {
  id: string;
  fruitType: FruitType;
  count: number;
  isMatched: boolean;
  borderColor: string;
  buttonColor: string;
}

export const FruitGroup = ({ fruitType, count, isMatched }: FruitGroupProps) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center items-center min-h-[120px]">
      {[...Array(count)].map((_, i) => (
        <div 
          key={i}
          className={`transition-all duration-200 ${isMatched ? 'opacity-50' : ''}`}
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <FruitSVG type={fruitType} size={count > 5 ? 45 : 55} />
        </div>
      ))}
    </div>
  );
};
