// Area Model for Multiplication utilities for Singapore Math

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface AreaModelProblem {
  a: number;
  b: number;
  answer: number;
  breakdown: AreaBreakdown;
  question: string;
}

export interface AreaBreakdown {
  a_tens: number;
  a_ones: number;
  b_tens: number;
  b_ones: number;
  parts: AreaPart[];
}

export interface AreaPart {
  row_label: string;
  col_label: string;
  row_value: number;
  col_value: number;
  product: number;
  description: string;
}

/**
 * Generate simple array model (single digit × single digit)
 */
function generateSimpleArrayProblem(): AreaModelProblem {
  const a = Math.floor(Math.random() * 7) + 2; // 2-8
  const b = Math.floor(Math.random() * 7) + 2; // 2-8
  const answer = a * b;
  
  const breakdown: AreaBreakdown = {
    a_tens: 0,
    a_ones: a,
    b_tens: 0,
    b_ones: b,
    parts: [{
      row_label: `${a}`,
      col_label: `${b}`,
      row_value: a,
      col_value: b,
      product: answer,
      description: `${a} แถว × ${b} หลัก = ${answer}`
    }]
  };
  
  return {
    a,
    b,
    answer,
    breakdown,
    question: `${a} × ${b} = ?`
  };
}

/**
 * Generate 2-digit × 1-digit problem
 */
function generateTwoByOneProblem(): AreaModelProblem {
  const a = Math.floor(Math.random() * 70) + 10; // 10-79
  const b = Math.floor(Math.random() * 7) + 2; // 2-8
  const answer = a * b;
  
  const a_tens = Math.floor(a / 10) * 10;
  const a_ones = a % 10;
  
  const parts: AreaPart[] = [
    {
      row_label: `${a_tens}`,
      col_label: `${b}`,
      row_value: a_tens,
      col_value: b,
      product: a_tens * b,
      description: `${a_tens} × ${b} = ${a_tens * b}`
    },
    {
      row_label: `${a_ones}`,
      col_label: `${b}`,
      row_value: a_ones,
      col_value: b,
      product: a_ones * b,
      description: `${a_ones} × ${b} = ${a_ones * b}`
    }
  ];
  
  const breakdown: AreaBreakdown = {
    a_tens,
    a_ones,
    b_tens: 0,
    b_ones: b,
    parts
  };
  
  return {
    a,
    b,
    answer,
    breakdown,
    question: `${a} × ${b} = ?`
  };
}

/**
 * Generate 2-digit × 2-digit problem (full area model)
 */
function generateTwoByTwoProblem(): AreaModelProblem {
  const a = Math.floor(Math.random() * 40) + 10; // 10-49
  const b = Math.floor(Math.random() * 40) + 10; // 10-49
  const answer = a * b;
  
  const a_tens = Math.floor(a / 10) * 10;
  const a_ones = a % 10;
  const b_tens = Math.floor(b / 10) * 10;
  const b_ones = b % 10;
  
  const parts: AreaPart[] = [
    {
      row_label: `${a_tens}`,
      col_label: `${b_tens}`,
      row_value: a_tens,
      col_value: b_tens,
      product: a_tens * b_tens,
      description: `${a_tens} × ${b_tens} = ${a_tens * b_tens}`
    },
    {
      row_label: `${a_tens}`,
      col_label: `${b_ones}`,
      row_value: a_tens,
      col_value: b_ones,
      product: a_tens * b_ones,
      description: `${a_tens} × ${b_ones} = ${a_tens * b_ones}`
    },
    {
      row_label: `${a_ones}`,
      col_label: `${b_tens}`,
      row_value: a_ones,
      col_value: b_tens,
      product: a_ones * b_tens,
      description: `${a_ones} × ${b_tens} = ${a_ones * b_tens}`
    },
    {
      row_label: `${a_ones}`,
      col_label: `${b_ones}`,
      row_value: a_ones,
      col_value: b_ones,
      product: a_ones * b_ones,
      description: `${a_ones} × ${b_ones} = ${a_ones * b_ones}`
    }
  ];
  
  const breakdown: AreaBreakdown = {
    a_tens,
    a_ones,
    b_tens,
    b_ones,
    parts
  };
  
  return {
    a,
    b,
    answer,
    breakdown,
    question: `${a} × ${b} = ?`
  };
}

/**
 * Generate a set of area model problems based on difficulty
 */
export function generateAreaModelProblems(
  count: number,
  difficulty: Difficulty
): AreaModelProblem[] {
  const problems: AreaModelProblem[] = [];
  
  for (let i = 0; i < count; i++) {
    let problem: AreaModelProblem;
    
    if (difficulty === 'easy') {
      // Simple array model (single × single)
      problem = generateSimpleArrayProblem();
    } else if (difficulty === 'medium') {
      // 2-digit × 1-digit
      problem = generateTwoByOneProblem();
    } else {
      // 2-digit × 2-digit (full area model)
      problem = generateTwoByTwoProblem();
    }
    
    problems.push(problem);
  }
  
  return problems;
}

/**
 * Check if answer is correct
 */
export function checkAnswer(problem: AreaModelProblem, userAnswer: number): boolean {
  return userAnswer === problem.answer;
}

/**
 * Calculate stars based on accuracy
 */
export function calculateStars(correct: number, total: number): number {
  const percentage = (correct / total) * 100;
  if (percentage >= 90) return 3;
  if (percentage >= 70) return 2;
  if (percentage >= 50) return 1;
  return 0;
}

/**
 * Get step-by-step solution text
 */
export function getSolutionSteps(problem: AreaModelProblem): string[] {
  const steps: string[] = [];
  
  if (problem.breakdown.a_tens > 0 && problem.breakdown.b_tens > 0) {
    // Full 2×2 breakdown
    steps.push(`แยก ${problem.a} = ${problem.breakdown.a_tens} + ${problem.breakdown.a_ones}`);
    steps.push(`แยก ${problem.b} = ${problem.breakdown.b_tens} + ${problem.breakdown.b_ones}`);
    steps.push('คูณแต่ละส่วน:');
    problem.breakdown.parts.forEach(part => {
      steps.push(`  ${part.description}`);
    });
    const sum = problem.breakdown.parts.map(p => p.product).join(' + ');
    steps.push(`บวกทุกส่วน: ${sum} = ${problem.answer}`);
  } else if (problem.breakdown.a_tens > 0) {
    // 2-digit × 1-digit
    steps.push(`แยก ${problem.a} = ${problem.breakdown.a_tens} + ${problem.breakdown.a_ones}`);
    steps.push('คูณแต่ละส่วน:');
    problem.breakdown.parts.forEach(part => {
      steps.push(`  ${part.description}`);
    });
    const sum = problem.breakdown.parts.map(p => p.product).join(' + ');
    steps.push(`บวกทุกส่วน: ${sum} = ${problem.answer}`);
  } else {
    // Simple array
    steps.push(`${problem.a} แถว × ${problem.b} หลัก = ${problem.answer}`);
  }
  
  return steps;
}
