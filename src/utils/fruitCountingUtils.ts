export type FruitType = 'apple' | 'grape' | 'banana' | 'orange' | 'strawberry' | 'cherry' | 'watermelon' | 'pear' | 'peach' | 'mango';

export interface FruitGroup {
  id: string;
  fruitType: FruitType;
  count: number; // จำนวนผลไม้ที่แสดง
}

export interface FruitCountingProblem {
  fruitGroups: FruitGroup[];
  numberChoices: number[]; // ตัวเลขที่ต้องจับคู่
}

const allFruits: FruitType[] = ['apple', 'grape', 'banana', 'orange', 'strawberry', 'cherry', 'watermelon', 'pear', 'peach', 'mango'];

export const generateFruitCountingProblem = (difficulty: string): FruitCountingProblem => {
  let numberOfGroups = 3;
  let maxCount = 5;

  if (difficulty === 'medium') {
    numberOfGroups = 4;
    maxCount = 8;
  } else if (difficulty === 'hard') {
    numberOfGroups = 5;
    maxCount = 10;
  }

  // Shuffle fruits before selecting to ensure variety
  const shuffledFruits = [...allFruits].sort(() => Math.random() - 0.5);
  const selectedFruits = shuffledFruits.slice(0, numberOfGroups);
  const usedCounts = new Set<number>();
  
  const fruitGroups: FruitGroup[] = selectedFruits.map((fruitType, index) => {
    let count: number;
    do {
      count = Math.floor(Math.random() * maxCount) + 1;
    } while (usedCounts.has(count));
    usedCounts.add(count);

    return {
      id: `group-${index}`,
      fruitType,
      count,
    };
  });

  // สร้างตัวเลือกตัวเลข และ shuffle
  const numberChoices = fruitGroups.map(g => g.count).sort(() => Math.random() - 0.5);

  return { fruitGroups, numberChoices };
};
