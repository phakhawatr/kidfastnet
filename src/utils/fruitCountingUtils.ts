export type FruitType = 'apple' | 'grape' | 'banana' | 'orange' | 'strawberry' | 'cherry' | 'watermelon' | 'pear' | 'peach' | 'mango';

export interface FruitProblem {
  id: string;
  fruitType: FruitType;
  number: number;
  shadowId: string;
}

export interface FruitCountingProblem {
  fruits: FruitProblem[];
  shadows: FruitProblem[];
}

const allFruits: FruitType[] = ['apple', 'grape', 'banana', 'orange', 'strawberry', 'cherry', 'watermelon', 'pear', 'peach', 'mango'];

export const generateFruitCountingProblem = (difficulty: string): FruitCountingProblem => {
  let numberOfPairs = 3;
  let maxNumber = 5;

  if (difficulty === 'medium') {
    numberOfPairs = 4;
    maxNumber = 8;
  } else if (difficulty === 'hard') {
    numberOfPairs = 5;
    maxNumber = 10;
  }

  // Shuffle fruits before selecting to ensure variety
  const shuffledFruits = [...allFruits].sort(() => Math.random() - 0.5);
  const selectedFruits = shuffledFruits.slice(0, numberOfPairs);
  const usedNumbers = new Set<number>();
  
  const fruits: FruitProblem[] = selectedFruits.map((fruitType, index) => {
    let number: number;
    do {
      number = Math.floor(Math.random() * maxNumber) + 1;
    } while (usedNumbers.has(number));
    usedNumbers.add(number);

    return {
      id: `fruit-${index}`,
      fruitType,
      number,
      shadowId: `shadow-${index}`,
    };
  });

  // Shuffle shadows for challenge
  const shadows = [...fruits].sort(() => Math.random() - 0.5);

  return { fruits, shadows };
};
