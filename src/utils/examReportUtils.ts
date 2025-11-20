import { ExamSession } from '@/hooks/useTeacherExams';

export const exportToCSV = (sessions: ExamSession[], linkCode: string) => {
  // Create CSV header
  const headers = ['ลำดับ', 'ชื่อ-สกุล', 'ชั้นเรียน', 'เลขที่', 'คะแนน (%)', 'ตอบถูก/ทั้งหมด', 'เวลา (นาที)', 'สถานะ'];
  
  // Create CSV rows
  const rows = sessions.map((session, index) => {
    const minutes = Math.floor(session.time_taken / 60);
    const seconds = session.time_taken % 60;
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    const status = session.score >= 80 ? 'ดีมาก' : session.score >= 50 ? 'ผ่าน' : 'ไม่ผ่าน';
    
    return [
      index + 1,
      session.student_name,
      session.student_class,
      session.student_number,
      session.score.toFixed(2),
      `${session.correct_answers}/${session.total_questions}`,
      timeStr,
      status
    ];
  });

  // Add statistics
  const avgScore = sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length;
  const maxScore = Math.max(...sessions.map(s => s.score));
  const minScore = Math.min(...sessions.map(s => s.score));
  
  const statsRows = [
    [],
    ['สถิติ'],
    ['คะแนนเฉลี่ย', avgScore.toFixed(2)],
    ['คะแนนสูงสุด', maxScore.toFixed(2)],
    ['คะแนนต่ำสุด', minScore.toFixed(2)],
    ['จำนวนนักเรียน', sessions.length]
  ];

  // Combine all data
  const csvContent = [
    [`รายงานผลการสอบ - ${linkCode}`],
    [`วันที่ออกรายงาน: ${new Date().toLocaleDateString('th-TH')}`],
    [],
    headers,
    ...rows,
    ...statsRows
  ].map(row => row.join(',')).join('\n');

  // Add BOM for Thai characters in Excel
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Download file
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `exam-report-${linkCode}-${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateReportSummary = (sessions: ExamSession[]) => {
  if (sessions.length === 0) {
    return {
      avgScore: 0,
      maxScore: 0,
      minScore: 0,
      passRate: 0,
      excellentRate: 0
    };
  }

  const avgScore = sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length;
  const maxScore = Math.max(...sessions.map(s => s.score));
  const minScore = Math.min(...sessions.map(s => s.score));
  const passCount = sessions.filter(s => s.score >= 50).length;
  const excellentCount = sessions.filter(s => s.score >= 80).length;

  return {
    avgScore: parseFloat(avgScore.toFixed(2)),
    maxScore: parseFloat(maxScore.toFixed(2)),
    minScore: parseFloat(minScore.toFixed(2)),
    passRate: parseFloat(((passCount / sessions.length) * 100).toFixed(2)),
    excellentRate: parseFloat(((excellentCount / sessions.length) * 100).toFixed(2))
  };
};
