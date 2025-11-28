export type FruitType = 'apple' | 'grape' | 'banana' | 'orange' | 'strawberry' | 'cherry' | 'watermelon' | 'pear' | 'peach' | 'mango';

export interface FruitGroup {
  id: string;
  fruitType: FruitType;
  count: number; // จำนวนผลไม้ที่แสดง
  borderColor: string;
  buttonColor: string;
}

export interface FruitCountingProblem {
  fruitGroups: FruitGroup[];
  numberChoices: number[]; // ตัวเลขที่ต้องจับคู่
}

export const fruitThemeConfig = {
  apple: { borderColor: 'border-red-500', buttonColor: 'from-red-400 to-red-600 border-red-700' },
  grape: { borderColor: 'border-purple-500', buttonColor: 'from-purple-400 to-purple-600 border-purple-700' },
  banana: { borderColor: 'border-yellow-500', buttonColor: 'from-yellow-400 to-yellow-600 border-yellow-700' },
  orange: { borderColor: 'border-orange-500', buttonColor: 'from-orange-400 to-orange-600 border-orange-700' },
  strawberry: { borderColor: 'border-pink-500', buttonColor: 'from-pink-400 to-pink-600 border-pink-700' },
  cherry: { borderColor: 'border-rose-500', buttonColor: 'from-rose-400 to-rose-600 border-rose-700' },
  watermelon: { borderColor: 'border-green-500', buttonColor: 'from-green-400 to-green-600 border-green-700' },
  pear: { borderColor: 'border-lime-500', buttonColor: 'from-lime-400 to-lime-600 border-lime-700' },
  peach: { borderColor: 'border-amber-500', buttonColor: 'from-amber-400 to-amber-600 border-amber-700' },
  mango: { borderColor: 'border-yellow-600', buttonColor: 'from-yellow-500 to-orange-600 border-orange-700' },
};

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

    const config = fruitThemeConfig[fruitType];

    return {
      id: `group-${index}`,
      fruitType,
      count,
      ...config,
    };
  });

  // สร้างตัวเลือกตัวเลข และ shuffle
  const numberChoices = fruitGroups.map(g => g.count).sort(() => Math.random() - 0.5);

  return { fruitGroups, numberChoices };
};
