// Mental Math / Number Splitting utilities for Singapore Math

export type Difficulty = 'easy' | 'medium' | 'hard';

export type StrategyType = 'make_ten' | 'make_hundred' | 'split_and_add' | 'subtract_friendly';

export interface MentalMathProblem {
  a: number;
  b: number;
  operation: '+' | '-';
  answer: number;
  strategy: StrategyType;
  steps: Step[];
  question: string;
}

export interface Step {
  description: string;
  expression: string;
  result?: number;
}

/**
 * Generate number for make ten strategy (complements to 10)
 */
function generateMakeTenProblem(): MentalMathProblem {
  // Generate a + b where a < 10 and result > 10
  const a = Math.floor(Math.random() * 7) + 3; // 3-9
  const b = Math.floor(Math.random() * 7) + 3; // 3-9
  const answer = a + b;
  
  // Find complement to 10
  const complement = 10 - a;
  const remaining = b - complement;
  
  const steps: Step[] = [
    {
      description: `แยก ${b} เป็น ${complement} + ${remaining}`,
      expression: `${a} + ${b} = ${a} + ${complement} + ${remaining}`
    },
    {
      description: `${a} + ${complement} = 10`,
      expression: `= 10 + ${remaining}`,
      result: 10
    },
    {
      description: `10 + ${remaining} = ${answer}`,
      expression: `= ${answer}`,
      result: answer
    }
  ];
  
  return {
    a,
    b,
    operation: '+',
    answer,
    strategy: 'make_ten',
    steps,
    question: `${a} + ${b} = ?`
  };
}

/**
 * Generate split and add problem (2 digits)
 */
function generateSplitAndAddProblem(): MentalMathProblem {
  // Generate two 2-digit numbers
  const a = Math.floor(Math.random() * 50) + 20; // 20-69
  const b = Math.floor(Math.random() * 30) + 10; // 10-39
  const answer = a + b;
  
  // Find what's needed to make next ten
  const nextTen = Math.ceil(a / 10) * 10;
  const toNextTen = nextTen - a;
  const remaining = b - toNextTen;
  
  const steps: Step[] = [
    {
      description: `แยก ${b} เป็น ${toNextTen} + ${remaining}`,
      expression: `${a} + ${b} = ${a} + ${toNextTen} + ${remaining}`
    },
    {
      description: `${a} + ${toNextTen} = ${nextTen}`,
      expression: `= ${nextTen} + ${remaining}`,
      result: nextTen
    },
    {
      description: `${nextTen} + ${remaining} = ${answer}`,
      expression: `= ${answer}`,
      result: answer
    }
  ];
  
  return {
    a,
    b,
    operation: '+',
    answer,
    strategy: 'split_and_add',
    steps,
    question: `${a} + ${b} = ?`
  };
}

/**
 * Generate make hundred problem
 */
function generateMakeHundredProblem(): MentalMathProblem {
  // Generate a + b where a is close to 100
  const a = Math.floor(Math.random() * 30) + 70; // 70-99
  const b = Math.floor(Math.random() * 40) + 10; // 10-49
  const answer = a + b;
  
  // Find complement to 100
  const toHundred = 100 - a;
  const remaining = b - toHundred;
  
  const steps: Step[] = [
    {
      description: `แยก ${b} เป็น ${toHundred} + ${remaining}`,
      expression: `${a} + ${b} = ${a} + ${toHundred} + ${remaining}`
    },
    {
      description: `${a} + ${toHundred} = 100`,
      expression: `= 100 + ${remaining}`,
      result: 100
    },
    {
      description: `100 + ${remaining} = ${answer}`,
      expression: `= ${answer}`,
      result: answer
    }
  ];
  
  return {
    a,
    b,
    operation: '+',
    answer,
    strategy: 'make_hundred',
    steps,
    question: `${a} + ${b} = ?`
  };
}

/**
 * Generate friendly subtraction problem
 */
function generateSubtractFriendlyProblem(difficulty: Difficulty): MentalMathProblem {
  let a: number, b: number;
  
  if (difficulty === 'easy') {
    a = Math.floor(Math.random() * 10) + 11; // 11-20
    b = Math.floor(Math.random() * 7) + 3; // 3-9
  } else if (difficulty === 'medium') {
    a = Math.floor(Math.random() * 50) + 30; // 30-79
    b = Math.floor(Math.random() * 20) + 10; // 10-29
  } else {
    a = Math.floor(Math.random() * 50) + 100; // 100-149
    b = Math.floor(Math.random() * 40) + 20; // 20-59
  }
  
  const answer = a - b;
  
  // Split b into parts
  const onesDigitA = a % 10;
  const onesDigitB = b % 10;
  
  let steps: Step[];
  
  if (onesDigitB <= onesDigitA) {
    // Simple case: can subtract ones directly
    const tensB = Math.floor(b / 10) * 10;
    steps = [
      {
        description: `แยก ${b} เป็น ${tensB} + ${onesDigitB}`,
        expression: `${a} - ${b} = ${a} - ${tensB} - ${onesDigitB}`
      },
      {
        description: `${a} - ${tensB} = ${a - tensB}`,
        expression: `= ${a - tensB} - ${onesDigitB}`,
        result: a - tensB
      },
      {
        description: `${a - tensB} - ${onesDigitB} = ${answer}`,
        expression: `= ${answer}`,
        result: answer
      }
    ];
  } else {
    // Need to borrow from tens
    const prevTen = Math.floor(a / 10) * 10;
    const toTen = a - prevTen;
    const afterTen = b - toTen;
    
    steps = [
      {
        description: `แยก ${b} เป็น ${toTen} + ${afterTen}`,
        expression: `${a} - ${b} = ${a} - ${toTen} - ${afterTen}`
      },
      {
        description: `${a} - ${toTen} = ${prevTen}`,
        expression: `= ${prevTen} - ${afterTen}`,
        result: prevTen
      },
      {
        description: `${prevTen} - ${afterTen} = ${answer}`,
        expression: `= ${answer}`,
        result: answer
      }
    ];
  }
  
  return {
    a,
    b,
    operation: '-',
    answer,
    strategy: 'subtract_friendly',
    steps,
    question: `${a} - ${b} = ?`
  };
}

/**
 * Generate a set of mental math problems based on difficulty
 */
export function generateMentalMathProblems(
  count: number,
  difficulty: Difficulty
): MentalMathProblem[] {
  const problems: MentalMathProblem[] = [];
  
  for (let i = 0; i < count; i++) {
    let problem: MentalMathProblem;
    
    if (difficulty === 'easy') {
      // Focus on make ten strategy
      if (i % 3 === 0) {
        problem = generateMakeTenProblem();
      } else {
        problem = generateSubtractFriendlyProblem(difficulty);
      }
    } else if (difficulty === 'medium') {
      // Mix of split and add, and subtraction
      if (i % 2 === 0) {
        problem = generateSplitAndAddProblem();
      } else {
        problem = generateSubtractFriendlyProblem(difficulty);
      }
    } else {
      // Make hundred and harder problems
      const rand = i % 3;
      if (rand === 0) {
        problem = generateMakeHundredProblem();
      } else if (rand === 1) {
        problem = generateSplitAndAddProblem();
      } else {
        problem = generateSubtractFriendlyProblem(difficulty);
      }
    }
    
    problems.push(problem);
  }
  
  return problems;
}

/**
 * Check if answer is correct
 */
export function checkAnswer(problem: MentalMathProblem, userAnswer: number): boolean {
  return userAnswer === problem.answer;
}

/**
 * Calculate stars based on accuracy and time
 */
export function calculateStars(correct: number, total: number): number {
  const percentage = (correct / total) * 100;
  if (percentage >= 90) return 3;
  if (percentage >= 70) return 2;
  if (percentage >= 50) return 1;
  return 0;
}

/**
 * Get strategy name in Thai
 */
export function getStrategyName(strategy: StrategyType): string {
  const names: Record<StrategyType, string> = {
    make_ten: 'ทำให้กลม 10',
    make_hundred: 'ทำให้กลม 100',
    split_and_add: 'แยกและบวก',
    subtract_friendly: 'ลบแบบเป็นมิตร'
  };
  return names[strategy];
}
