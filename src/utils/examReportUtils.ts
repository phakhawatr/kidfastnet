import { ExamSession } from '@/hooks/useTeacherExams';
import jsPDF from 'jspdf';

/**
 * Calculate median score from sessions
 */
export const calculateMedian = (sessions: ExamSession[]): number => {
  if (sessions.length === 0) return 0;
  const sorted = [...sessions].sort((a, b) => a.score - b.score);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1].score + sorted[mid].score) / 2;
  }
  return sorted[mid].score;
};

/**
 * Calculate standard deviation
 */
export const calculateStdDev = (sessions: ExamSession[], mean: number): number => {
  if (sessions.length === 0) return 0;
  const variance = sessions.reduce((sum, s) => sum + Math.pow(s.score - mean, 2), 0) / sessions.length;
  return Math.sqrt(variance);
};

/**
 * Generate item analysis for each question
 */
export interface ItemAnalysis {
  questionIndex: number;
  correctCount: number;
  totalCount: number;
  percentCorrect: number;
  difficulty: 'ง่าย' | 'ปานกลาง' | 'ยาก';
}

export const generateItemAnalysis = (sessions: ExamSession[]): ItemAnalysis[] => {
  if (sessions.length === 0) return [];
  
  // Get total questions from first session
  const totalQuestions = sessions[0]?.total_questions || 0;
  const analysis: ItemAnalysis[] = [];
  
  for (let i = 0; i < totalQuestions; i++) {
    let correctCount = 0;
    let totalCount = 0;
    
    sessions.forEach(session => {
      if (session.assessment_data?.questions?.[i]) {
        totalCount++;
        const q = session.assessment_data.questions[i];
        // Check if user answer matches correct answer
        if (q.userAnswer === q.correctAnswer || String(q.userAnswer) === String(q.correctAnswer)) {
          correctCount++;
        }
      }
    });
    
    const percentCorrect = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;
    let difficulty: 'ง่าย' | 'ปานกลาง' | 'ยาก' = 'ปานกลาง';
    
    if (percentCorrect >= 70) difficulty = 'ง่าย';
    else if (percentCorrect < 50) difficulty = 'ยาก';
    
    analysis.push({
      questionIndex: i + 1,
      correctCount,
      totalCount,
      percentCorrect: parseFloat(percentCorrect.toFixed(2)),
      difficulty
    });
  }
  
  return analysis;
};

export const exportToCSV = (sessions: ExamSession[], linkCode: string) => {
  const headers = ['ลำดับ', 'ชื่อ-สกุล', 'ชั้นเรียน', 'เลขที่', 'ครั้งที่', 'คะแนน (%)', 'ตอบถูก/ทั้งหมด', 'เวลา (นาที)', 'วันที่ทำ', 'สถานะ'];
  
  const rows = sessions.map((session, index) => {
    const minutes = Math.floor(session.time_taken / 60);
    const seconds = session.time_taken % 60;
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    const status = session.score >= 80 ? 'ดีมาก' : session.score >= 50 ? 'ผ่าน' : 'ไม่ผ่าน';
    const completedDate = new Date(session.completed_at).toLocaleDateString('th-TH');
    
    return [
      index + 1,
      session.student_name,
      session.student_class,
      session.student_number,
      session.attempt_number || 1,
      session.score.toFixed(2),
      `${session.correct_answers}/${session.total_questions}`,
      timeStr,
      completedDate,
      status
    ];
  });

  const avgScore = sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length;
  const maxScore = Math.max(...sessions.map(s => s.score));
  const minScore = Math.min(...sessions.map(s => s.score));
  const median = calculateMedian(sessions);
  const stdDev = calculateStdDev(sessions, avgScore);
  
  const statsRows = [
    [],
    ['สถิติ'],
    ['คะแนนเฉลี่ย', avgScore.toFixed(2)],
    ['ค่ามัธยฐาน (Median)', median.toFixed(2)],
    ['ส่วนเบี่ยงเบนมาตรฐาน (SD)', stdDev.toFixed(2)],
    ['คะแนนสูงสุด', maxScore.toFixed(2)],
    ['คะแนนต่ำสุด', minScore.toFixed(2)],
    ['จำนวนนักเรียน', sessions.length]
  ];

  const csvContent = [
    [`รายงานผลการสอบ - ${linkCode}`],
    [`วันที่ออกรายงาน: ${new Date().toLocaleDateString('th-TH')}`],
    [],
    headers,
    ...rows,
    ...statsRows
  ].map(row => row.join(',')).join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `exam-report-${linkCode}-${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export report to PDF
 */
export const exportToPDF = async (sessions: ExamSession[], linkCode: string) => {
  const doc = new jsPDF();
  
  // Load Thai font (using fallback for now)
  doc.setFont('helvetica');
  
  // Title
  doc.setFontSize(16);
  doc.text(`Exam Report - ${linkCode}`, 20, 20);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US')}`, 20, 28);
  
  // Statistics
  const avgScore = sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length;
  const median = calculateMedian(sessions);
  const stdDev = calculateStdDev(sessions, avgScore);
  const maxScore = Math.max(...sessions.map(s => s.score));
  const minScore = Math.min(...sessions.map(s => s.score));
  
  doc.setFontSize(12);
  doc.text('Statistics', 20, 40);
  doc.setFontSize(10);
  let y = 48;
  doc.text(`Average Score: ${avgScore.toFixed(2)}%`, 20, y);
  y += 6;
  doc.text(`Median: ${median.toFixed(2)}%`, 20, y);
  y += 6;
  doc.text(`Std Dev: ${stdDev.toFixed(2)}%`, 20, y);
  y += 6;
  doc.text(`Max: ${maxScore.toFixed(2)}%`, 20, y);
  y += 6;
  doc.text(`Min: ${minScore.toFixed(2)}%`, 20, y);
  y += 6;
  doc.text(`Total Students: ${sessions.length}`, 20, y);
  
  // Item Analysis
  const itemAnalysis = generateItemAnalysis(sessions);
  if (itemAnalysis.length > 0) {
    doc.addPage();
    doc.setFontSize(12);
    doc.text('Item Analysis', 20, 20);
    doc.setFontSize(9);
    
    y = 30;
    doc.text('Q#', 20, y);
    doc.text('Correct', 40, y);
    doc.text('Total', 65, y);
    doc.text('% Correct', 85, y);
    doc.text('Difficulty', 115, y);
    y += 6;
    
    itemAnalysis.forEach((item) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${item.questionIndex}`, 20, y);
      doc.text(`${item.correctCount}`, 40, y);
      doc.text(`${item.totalCount}`, 65, y);
      doc.text(`${item.percentCorrect}%`, 85, y);
      doc.text(item.difficulty, 115, y);
      y += 6;
    });
  }
  
  // Student Results
  doc.addPage();
  doc.setFontSize(12);
  doc.text('Student Results', 20, 20);
  doc.setFontSize(8);
  
  y = 30;
  doc.text('#', 10, y);
  doc.text('Name', 20, y);
  doc.text('Class', 70, y);
  doc.text('No.', 95, y);
  doc.text('Attempt', 110, y);
  doc.text('Score', 130, y);
  doc.text('Correct', 150, y);
  doc.text('Time', 170, y);
  y += 6;
  
  sessions.forEach((session, index) => {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    const minutes = Math.floor(session.time_taken / 60);
    const seconds = session.time_taken % 60;
    
    doc.text(`${index + 1}`, 10, y);
    doc.text(session.student_name.substring(0, 20), 20, y);
    doc.text(session.student_class, 70, y);
    doc.text(`${session.student_number}`, 95, y);
    doc.text(`${session.attempt_number || 1}`, 110, y);
    doc.text(`${session.score.toFixed(1)}%`, 130, y);
    doc.text(`${session.correct_answers}/${session.total_questions}`, 150, y);
    doc.text(`${minutes}:${seconds.toString().padStart(2, '0')}`, 170, y);
    y += 6;
  });
  
  doc.save(`exam-report-${linkCode}-${Date.now()}.pdf`);
};

export const generateReportSummary = (sessions: ExamSession[]) => {
  if (sessions.length === 0) {
    return {
      avgScore: 0,
      maxScore: 0,
      minScore: 0,
      median: 0,
      stdDev: 0,
      passRate: 0,
      excellentRate: 0
    };
  }

  const avgScore = sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length;
  const maxScore = Math.max(...sessions.map(s => s.score));
  const minScore = Math.min(...sessions.map(s => s.score));
  const median = calculateMedian(sessions);
  const stdDev = calculateStdDev(sessions, avgScore);
  const passCount = sessions.filter(s => s.score >= 50).length;
  const excellentCount = sessions.filter(s => s.score >= 80).length;

  return {
    avgScore: parseFloat(avgScore.toFixed(2)),
    maxScore: parseFloat(maxScore.toFixed(2)),
    minScore: parseFloat(minScore.toFixed(2)),
    median: parseFloat(median.toFixed(2)),
    stdDev: parseFloat(stdDev.toFixed(2)),
    passRate: parseFloat(((passCount / sessions.length) * 100).toFixed(2)),
    excellentRate: parseFloat(((excellentCount / sessions.length) * 100).toFixed(2))
  };
};
