export type FruitType = 'apple' | 'grape' | 'banana' | 'orange';

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

const allFruits: FruitType[] = ['apple', 'grape', 'banana', 'orange'];

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

  const selectedFruits = allFruits.slice(0, numberOfPairs);
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
