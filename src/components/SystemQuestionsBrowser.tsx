import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, Database, Sparkles, CheckCircle2, FileUp } from 'lucide-react';
import { useQuestionBank } from '@/hooks/useQuestionBank';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface SystemQuestionsBrowserProps {
  teacherId: string;
  onImportSuccess?: () => void;
}

export default function SystemQuestionsBrowser({ teacherId, onImportSuccess }: SystemQuestionsBrowserProps) {
  const {
    fetchSystemQuestions,
    copySystemQuestion,
  } = useQuestionBank(teacherId);

  const [systemQuestions, setSystemQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<number | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  useEffect(() => {
    loadSystemQuestions();
  }, []);

  const loadSystemQuestions = async () => {
    setLoading(true);
    const questions = await fetchSystemQuestions();
    setSystemQuestions(questions);
    setLoading(false);
  };

  const handleCopyQuestion = async (questionId: string) => {
    const success = await copySystemQuestion(questionId);
    if (success) {
      onImportSuccess?.();
    }
  };

  const filteredQuestions = systemQuestions.filter((question) => {
    if (selectedGrade !== 'all' && question.grade !== selectedGrade) return false;
    if (selectedDifficulty !== 'all' && question.difficulty !== selectedDifficulty) return false;
    if (selectedSemester !== 'all') {
      if (selectedSemester === 'nt' && question.assessment_type !== 'nt') return false;
      if (selectedSemester !== 'nt' && question.semester !== Number(selectedSemester)) return false;
    }
    if (selectedTopic !== 'all' && question.topic !== selectedTopic) return false;
    if (searchQuery && !question.question_text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const uniqueTopics = Array.from(new Set(systemQuestions.map(q => q.topic).filter(Boolean)));

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'ง่าย';
      case 'medium': return 'ปานกลาง';
      case 'hard': return 'ยาก';
      default: return difficulty;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-primary">
          <Database className="w-6 h-6" />
          คลังข้อสอบกลาง
        </h2>
        <p className="text-muted-foreground">
          ข้อสอบคุณภาพสูงจาก Admin พร้อมใช้งาน สามารถนำเข้ามาใช้และปรับแต่งได้
        </p>
      </div>

      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">ชั้นเรียน</label>
              <Select value={selectedGrade.toString()} onValueChange={(v) => setSelectedGrade(v === 'all' ? 'all' : Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  {[1, 2, 3, 4, 5, 6].map((grade) => (
                    <SelectItem key={grade} value={grade.toString()}>
                      ป.{grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">เทอม/ประเภท</label>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="1">เทอม 1</SelectItem>
                  <SelectItem value="2">เทอม 2</SelectItem>
                  <SelectItem value="nt">NT (ป.3)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">หัวข้อ</label>
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  {uniqueTopics.map((topic) => (
                    <SelectItem key={topic} value={topic}>
                      {topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">ความยาก</label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="easy">ง่าย</SelectItem>
                  <SelectItem value="medium">ปานกลาง</SelectItem>
                  <SelectItem value="hard">ยาก</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="ค้นหาในเนื้อหาโจทย์..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">กำลังโหลดข้อสอบ...</p>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <Card className="p-12 text-center">
          <Database className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">ไม่พบข้อสอบ</h3>
          <p className="text-muted-foreground">
            {searchQuery || selectedGrade !== 'all' || selectedDifficulty !== 'all' || selectedSemester !== 'all' || selectedTopic !== 'all'
              ? 'ลองปรับเงื่อนไขการค้นหาใหม่'
              : 'ยังไม่มีข้อสอบในคลังกลาง'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            พบ {filteredQuestions.length} ข้อสอบ
          </p>
          {filteredQuestions.map((question, index) => (
            <Card key={question.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-sm font-medium flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex items-start gap-2 flex-wrap">
                    <span className="text-sm font-medium text-muted-foreground">
                      ข้อ {index + 1}
                    </span>
                    
                    {/* 1. ชั้น */}
                    <Badge variant="outline" className="text-xs font-normal bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800">
                      ป.{question.grade}
                    </Badge>
                    
                    {/* 2. เทอม */}
                    {question.semester && (
                      <Badge variant="outline" className="text-xs font-normal bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                        เทอม {question.semester}
                      </Badge>
                    )}
                    {question.assessment_type === 'nt' && (
                      <Badge variant="outline" className="text-xs font-normal bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">
                        🏆 NT
                      </Badge>
                    )}
                    
                    {/* 3. สร้างจาก (PDF/AI/ระบบ) */}
                    {question.tags && question.tags.includes && question.tags.includes('PDF') && (
                      <Badge variant="outline" className="text-xs font-normal bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800">
                        <FileUp className="w-3 h-3 inline mr-1" />
                        PDF
                      </Badge>
                    )}
                    {question.ai_generated && (!question.tags || !question.tags.includes || !question.tags.includes('PDF')) && (
                      <Badge variant="outline" className="text-xs font-normal bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                        <Sparkles className="w-3 h-3 inline mr-1" />
                        AI
                      </Badge>
                    )}
                    {question.is_system_question && (
                      <Badge variant="outline" className="text-xs font-normal bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800">
                        🔧 ระบบ
                      </Badge>
                    )}
                    
                    {/* 4. ความยาก */}
                    <Badge variant="outline" className={`text-xs font-normal ${
                      question.difficulty === 'easy' 
                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800' :
                      question.difficulty === 'medium' 
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800' :
                        'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800'
                    }`}>
                      {question.difficulty === 'easy' ? 'ง่าย' :
                       question.difficulty === 'medium' ? 'ปานกลาง' : 'ยาก'}
                    </Badge>
                    
                    {/* 5. หัวข้อ */}
                    {question.topic && (
                      <Badge variant="outline" className="text-xs font-normal bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
                        {question.topic}
                      </Badge>
                    )}
                    
                    {question.times_used > 0 && (
                      <Badge variant="outline" className="text-xs font-normal bg-gray-50 dark:bg-gray-950 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800">
                        ใช้งาน {question.times_used} ครั้ง
                      </Badge>
                    )}
                  </div>

                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-base font-medium">{question.question_text}</p>
                  </div>

                  {question.image_urls && question.image_urls.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {question.image_urls.map((url: string, idx: number) => (
                        <img
                          key={idx}
                          src={url}
                          alt={`Question image ${idx + 1}`}
                          className="max-w-xs rounded border"
                        />
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {Array.isArray(question.choices) && question.choices.map((choice: string, idx: number) => (
                      <div
                        key={idx}
                        className={`p-3 rounded border ${
                          choice === question.correct_answer
                            ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                            : 'border-border'
                        }`}
                      >
                        <span className="text-sm font-light text-gray-500 dark:text-gray-400">{idx + 1})</span>
                        <span className="text-lg font-semibold text-blue-600 dark:text-blue-400 ml-2">{choice}</span>
                      </div>
                    ))}
                  </div>

                  {question.explanation && (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-sm">
                      <strong>คำอธิบาย:</strong> {question.explanation}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => handleCopyQuestion(question.id)}
                    size="sm"
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    นำเข้า
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
