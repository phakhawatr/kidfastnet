export type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Problem {
  num1: number;
  num2: number;
  operation: Operation;
  answer: number;
  operatorSymbol: string;
}

const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generateProblem = (operation: Operation, difficulty: Difficulty): Problem => {
  let num1: number, num2: number, answer: number;
  let operatorSymbol: string;

  switch (operation) {
    case 'addition':
      operatorSymbol = '+';
      if (difficulty === 'easy') {
        num1 = getRandomInt(1, 5);
        num2 = getRandomInt(1, 5);
      } else if (difficulty === 'medium') {
        num1 = getRandomInt(5, 10);
        num2 = getRandomInt(5, 10);
      } else {
        num1 = getRandomInt(10, 50);
        num2 = getRandomInt(10, 50);
      }
      answer = num1 + num2;
      break;

    case 'subtraction':
      operatorSymbol = '-';
      if (difficulty === 'easy') {
        answer = getRandomInt(1, 5);
        num2 = getRandomInt(1, 5);
        num1 = answer + num2;
      } else if (difficulty === 'medium') {
        answer = getRandomInt(1, 10);
        num2 = getRandomInt(1, 10);
        num1 = answer + num2;
      } else {
        answer = getRandomInt(1, 50);
        num2 = getRandomInt(1, 50);
        num1 = answer + num2;
      }
      break;

    case 'multiplication':
      operatorSymbol = '×';
      if (difficulty === 'easy') {
        num1 = getRandomInt(1, 5);
        num2 = getRandomInt(1, 5);
      } else if (difficulty === 'medium') {
        num1 = getRandomInt(2, 10);
        num2 = getRandomInt(2, 10);
      } else {
        num1 = getRandomInt(5, 12);
        num2 = getRandomInt(5, 12);
      }
      answer = num1 * num2;
      break;

    case 'division':
      operatorSymbol = '÷';
      if (difficulty === 'easy') {
        answer = getRandomInt(1, 5);
        num2 = getRandomInt(1, 5);
      } else if (difficulty === 'medium') {
        answer = getRandomInt(1, 10);
        num2 = getRandomInt(2, 10);
      } else {
        answer = getRandomInt(1, 12);
        num2 = getRandomInt(2, 12);
      }
      num1 = answer * num2;
      break;

    default:
      throw new Error('Invalid operation');
  }

  return { num1, num2, operation, answer, operatorSymbol };
};

export const generateChoices = (correctAnswer: number): number[] => {
  const choices = [correctAnswer];
  
  while (choices.length < 3) {
    const offset = getRandomInt(-5, 5);
    const choice = correctAnswer + offset;
    if (choice > 0 && !choices.includes(choice)) {
      choices.push(choice);
    }
  }
  
  // Shuffle
  return choices.sort(() => Math.random() - 0.5);
};

const balloonColors = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#FFB6C1', // Pink
  '#FFA07A', // Coral
];

export const getRandomBalloonColor = (): string => {
  return balloonColors[Math.floor(Math.random() * balloonColors.length)];
};
