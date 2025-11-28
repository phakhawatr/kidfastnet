export type ObjectType = 'rockingHorse' | 'caterpillar' | 'teddyBear' | 'ball' | 'rocket' | 'dinosaur';

export interface CountingProblem {
  objectType: ObjectType;
  correctAnswer: number;
  choices: number[];
}

const objectTypes: ObjectType[] = [
  'rockingHorse',
  'caterpillar',
  'teddyBear',
  'ball',
  'rocket',
  'dinosaur',
];

const getRandomObjectType = (): ObjectType => {
  return objectTypes[Math.floor(Math.random() * objectTypes.length)];
};

const getMaxNumber = (difficulty: string): number => {
  switch (difficulty) {
    case 'easy':
      return 5;
    case 'medium':
      return 10;
    case 'hard':
      return 15;
    default:
      return 5;
  }
};

const generateChoices = (correctAnswer: number, maxNum: number): number[] => {
  const choices = new Set<number>();
  choices.add(correctAnswer);

  while (choices.size < 3) {
    const randomNum = Math.floor(Math.random() * maxNum) + 1;
    choices.add(randomNum);
  }

  return Array.from(choices).sort(() => Math.random() - 0.5);
};

export const generateCountingProblem = (difficulty: string): CountingProblem => {
  const maxNum = getMaxNumber(difficulty);
  const correctAnswer = Math.floor(Math.random() * maxNum) + 1;
  const objectType = getRandomObjectType();
  const choices = generateChoices(correctAnswer, maxNum);

  return {
    objectType,
    correctAnswer,
    choices,
  };
};
