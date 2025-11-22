import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, BookOpen, Pencil, Sparkles, FileText, Trash2 } from 'lucide-react';
import { useQuestionBank } from '@/hooks/useQuestionBank';
import { useTranslation } from 'react-i18next';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import ManualQuestionForm from './ManualQuestionForm';
import AIQuestionGenerator from './AIQuestionGenerator';
import TemplateManager from './TemplateManager';

interface QuestionBankManagerProps {
  teacherId: string | null;
}

export default function QuestionBankManager({ teacherId }: QuestionBankManagerProps) {
  const { t } = useTranslation();
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const {
    questions,
    topics,
    loading,
    fetchQuestions,
    fetchTopicsByGrade,
    deleteQuestion,
  } = useQuestionBank(teacherId);

  useEffect(() => {
    if (teacherId) {
      fetchQuestions({ grade: selectedGrade });
      fetchTopicsByGrade(selectedGrade);
    }
  }, [teacherId, selectedGrade]);

  const handleRefresh = () => {
    if (teacherId) {
      fetchQuestions({ grade: selectedGrade, topic: selectedTopic !== 'all' ? selectedTopic : undefined, difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('คุณต้องการลบโจทย์นี้หรือไม่?')) {
      await deleteQuestion(id);
      handleRefresh();
    }
  };

  const toggleQuestion = (id: string) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedQuestions(newSelected);
  };

  const toggleAll = () => {
    if (selectedQuestions.size === filteredQuestions.length) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(new Set(filteredQuestions.map(q => q.id)));
    }
  };

  const handleBulkDelete = async () => {
    setDeleting(true);
    
    const deletePromises = Array.from(selectedQuestions).map(id => deleteQuestion(id));
    await Promise.all(deletePromises);
    
    setDeleting(false);
    setShowDeleteDialog(false);
    setSelectedQuestions(new Set());
    toast.success(`ลบโจทย์ ${selectedQuestions.size} ข้อสำเร็จ`);
    handleRefresh();
  };

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

          {selectedQuestions.size > 0 && (
            <Card className="p-4 bg-primary/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedQuestions.size === filteredQuestions.length && filteredQuestions.length > 0}
                    onCheckedChange={toggleAll}
                  />
                  <span className="font-medium">เลือกทั้งหมด ({selectedQuestions.size} ข้อ)</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedQuestions(new Set())}
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    ลบที่เลือก
                  </Button>
                </div>
              </div>
            </Card>
          )}

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
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={selectedQuestions.has(question.id)}
                      onCheckedChange={() => toggleQuestion(question.id)}
                      className="mt-1"
                    />
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
                      
                      {question.image_urls && question.image_urls.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          {question.image_urls.map((url: string, imgIdx: number) => (
                            <img
                              key={imgIdx}
                              src={url}
                              alt={`Question image ${imgIdx + 1}`}
                              className="rounded border max-h-32 object-cover"
                            />
                          ))}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Array.isArray(question.choices) && question.choices.map((choice: string, idx: number) => (
                          <div
                            key={idx}
                            className={`p-2 rounded border ${
                              choice === question.correct_answer
                                ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                                : 'border-border'
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}. {choice}
                          </div>
                        ))}
                      </div>
                      {question.explanation && (
                        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-sm">
                          <strong>คำอธิบาย:</strong> {question.explanation}
                        </div>
                      )}
                      <div className="mt-2 text-xs text-muted-foreground">
                        ใช้ไปแล้ว: {question.times_used || 0} ครั้ง
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(question.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="manual">
          <ManualQuestionForm
            teacherId={teacherId!}
            grade={selectedGrade}
            topics={topics}
            onSuccess={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="ai">
          <AIQuestionGenerator
            teacherId={teacherId!}
            grade={selectedGrade}
            topics={topics}
            onSuccess={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="templates">
          <TemplateManager teacherId={teacherId!} grade={selectedGrade} />
        </TabsContent>
      </Tabs>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบโจทย์ {selectedQuestions.size} ข้อที่เลือกไว้หรือไม่? 
              การกระทำนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} disabled={deleting}>
              {deleting ? 'กำลังลบ...' : 'ยืนยันลบ'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}