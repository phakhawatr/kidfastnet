import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, BookOpen, Pencil, Sparkles, FileText } from 'lucide-react';
import { useQuestionBank } from '@/hooks/useQuestionBank';
import { useTranslation } from 'react-i18next';

interface QuestionBankManagerProps {
  teacherId: string | null;
}

export default function QuestionBankManager({ teacherId }: QuestionBankManagerProps) {
  const { t } = useTranslation();
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  
  const {
    questions,
    topics,
    loading,
    fetchQuestions,
    fetchTopicsByGrade,
  } = useQuestionBank(teacherId);

  useEffect(() => {
    if (teacherId) {
      fetchQuestions({ grade: selectedGrade });
      fetchTopicsByGrade(selectedGrade);
    }
  }, [teacherId, selectedGrade]);

  const filteredQuestions = questions.filter(q => {
    if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
    if (selectedTopic !== 'all' && q.topic !== selectedTopic) return false;
    if (searchQuery && !q.question_text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">📚 คลังข้อสอบ</h1>
        <p className="text-muted-foreground">
          จัดการและสร้างโจทย์สำหรับการออกข้อสอบ
        </p>
      </div>

      <Tabs defaultValue="library" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="library" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            คลังข้อสอบ
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Pencil className="w-4 h-4" />
            สร้างด้วยมือ
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            สร้างด้วย AI
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            แม่แบบโจทย์
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-4">
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">ชั้นเรียน</label>
                <Select value={selectedGrade.toString()} onValueChange={(v) => setSelectedGrade(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map(grade => (
                      <SelectItem key={grade} value={grade.toString()}>
                        ป.{grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">หัวข้อเรียน</label>
                <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    {topics.map(topic => (
                      <SelectItem key={topic.id} value={topic.topic_name_th}>
                        {topic.topic_name_th}
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

              <div>
                <label className="text-sm font-medium mb-2 block">ค้นหา</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="ค้นหาโจทย์..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-4">
            {loading ? (
              <Card className="p-8 text-center text-muted-foreground">
                กำลังโหลด...
              </Card>
            ) : filteredQuestions.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  ยังไม่มีโจทย์ในคลัง
                </p>
                <p className="text-sm text-muted-foreground">
                  เริ่มสร้างโจทย์ด้วยมือหรือใช้ AI สร้างโจทย์อัตโนมัติ
                </p>
              </Card>
            ) : (
              filteredQuestions.map((question, index) => (
                <Card key={question.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          ข้อ {index + 1}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {question.difficulty === 'easy' ? 'ง่าย' :
                           question.difficulty === 'medium' ? 'ปานกลาง' : 'ยาก'}
                        </span>
                        {question.ai_generated && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            <Sparkles className="w-3 h-3 inline mr-1" />
                            AI
                          </span>
                        )}
                        {question.is_template && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            <FileText className="w-3 h-3 inline mr-1" />
                            Template
                          </span>
                        )}
                      </div>
                      <p className="font-medium mb-2">{question.question_text}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {question.choices.map((choice, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded border ${
                              choice === question.correct_answer
                                ? 'border-green-500 bg-green-50'
                                : 'border-border'
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}. {choice}
                          </div>
                        ))}
                      </div>
                      {question.explanation && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                          <strong>คำอธิบาย:</strong> {question.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="manual">
          <Card className="p-8 text-center text-muted-foreground">
            <Pencil className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>ฟีเจอร์สร้างโจทย์ด้วยมือกำลังพัฒนา...</p>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card className="p-8 text-center text-muted-foreground">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>ฟีเจอร์สร้างโจทย์ด้วย AI กำลังพัฒนา...</p>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card className="p-8 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>ฟีเจอร์แม่แบบโจทย์กำลังพัฒนา...</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}