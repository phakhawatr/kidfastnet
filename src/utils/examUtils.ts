/**
 * Fisher-Yates shuffle algorithm for randomizing arrays
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate randomized question order
 * Returns array of original indices in new randomized order
 */
export function generateQuestionOrder(questionCount: number): number[] {
  const indices = Array.from({ length: questionCount }, (_, i) => i);
  return shuffleArray(indices);
}

/**
 * Generate randomized choices order for each question
 * Returns object mapping question index to shuffled choice indices
 */
export function generateChoicesOrder(questions: any[]): Record<number, number[]> {
  const choicesOrder: Record<number, number[]> = {};
  questions.forEach((question, qIndex) => {
    const choiceCount = question.choices?.length || 4;
    const indices = Array.from({ length: choiceCount }, (_, i) => i);
    choicesOrder[qIndex] = shuffleArray(indices);
  });
  return choicesOrder;
}

/**
 * Apply randomization to questions array
 */
export function applyRandomization(
  questions: any[],
  questionOrder: number[],
  choicesOrder: Record<number, number[]>
) {
  return questionOrder.map((originalIndex) => {
    const question = questions[originalIndex];
    const choiceIndices = choicesOrder[originalIndex] || [];
    
    return {
      ...question,
      originalIndex, // Keep track of original position
      choices: choiceIndices.map((choiceIdx) => question.choices[choiceIdx]),
      // Store mapping to convert shuffled answer back to original
      choiceMapping: choiceIndices
    };
  });
}

/**
 * Convert shuffled answer index back to original choice index
 */
export function getOriginalAnswerIndex(
  shuffledIndex: number,
  choiceMapping: number[]
): number {
  return choiceMapping[shuffledIndex];
}

/**
 * Auto-save session data to database
 */
export async function autoSaveSession(
  supabase: any,
  sessionData: {
    examLinkId: string;
    studentName: string;
    studentClass: string;
    studentNumber: number;
    grade: number;
    semester: number | null;
    assessmentType: string;
    questionOrder: number[];
    choicesOrder: Record<number, number[]>;
    draftAnswers: Record<number, any>;
    timeTaken: number;
  }
) {
  const { data: existingDraft } = await supabase
    .from('exam_sessions')
    .select('id')
    .eq('exam_link_id', sessionData.examLinkId)
    .eq('student_name', sessionData.studentName)
    .eq('student_number', sessionData.studentNumber)
    .eq('is_draft', true)
    .maybeSingle();

  const payload = {
    exam_link_id: sessionData.examLinkId,
    student_name: sessionData.studentName,
    student_class: sessionData.studentClass,
    student_number: sessionData.studentNumber,
    grade: sessionData.grade,
    semester: sessionData.semester,
    assessment_type: sessionData.assessmentType,
    is_draft: true,
    question_order: sessionData.questionOrder,
    choices_order: sessionData.choicesOrder,
    draft_answers: sessionData.draftAnswers,
    time_taken: sessionData.timeTaken,
    auto_saved_at: new Date().toISOString(),
    total_questions: 0,
    correct_answers: 0,
    score: 0
  };

  if (existingDraft) {
    // Update existing draft
    const { error } = await supabase
      .from('exam_sessions')
      .update(payload)
      .eq('id', existingDraft.id);
    
    return { error, isDraft: true };
  } else {
    // Create new draft
    const { error } = await supabase
      .from('exam_sessions')
      .insert(payload);
    
    return { error, isDraft: false };
  }
}

/**
 * Load existing draft session
 */
export async function loadDraftSession(
  supabase: any,
  examLinkId: string,
  studentName: string,
  studentNumber: number
) {
  const { data, error } = await supabase
    .from('exam_sessions')
    .select('*')
    .eq('exam_link_id', examLinkId)
    .eq('student_name', studentName)
    .eq('student_number', studentNumber)
    .eq('is_draft', true)
    .maybeSingle();

  if (error || !data) return null;

  return {
    questionOrder: data.question_order as number[],
    choicesOrder: data.choices_order as Record<number, number[]>,
    draftAnswers: data.draft_answers as Record<number, any>,
    timeTaken: data.time_taken || 0
  };
}
