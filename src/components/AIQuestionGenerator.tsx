import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, Loader2, Save } from 'lucide-react';
import { useQuestionBank } from '@/hooks/useQuestionBank';

interface AIQuestionGeneratorProps {
  teacherId: string;
  grade: number;
  topics: any[];
  semester?: number;
  assessmentType?: 'semester1' | 'semester2' | 'nt';
  onSuccess?: () => void;
}

export default function AIQuestionGenerator({ teacherId, grade, topics, semester, assessmentType, onSuccess }: AIQuestionGeneratorProps) {
  const { generateWithAI, createQuestion } = useQuestionBank(teacherId);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState('5');
  const [language, setLanguage] = useState('th');
  const [generating, setGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  const handleGenerate = async () => {
    if (!selectedTopic) {
      alert('กรุณาเลือกหัวข้อเรียน');
      return;
    }

    setGenerating(true);
    const questions = await generateWithAI({
      grade,
      topic: selectedTopic,
      difficulty,
      count: parseInt(count),
      language,
    });
    setGenerating(false);

    if (questions && questions.length > 0) {
      setGeneratedQuestions(questions);
      // Select all by default
      setSelectedQuestions(new Set(questions.map((_, i) => i)));
    }
  };

  const toggleQuestion = (index: number) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedQuestions(newSelected);
  };

  const toggleAll = () => {
    if (selectedQuestions.size === generatedQuestions.length) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(new Set(generatedQuestions.map((_, i) => i)));
    }
  };

  const handleSave = async () => {
    if (selectedQuestions.size === 0) {
      alert('กรุณาเลือกโจทย์ที่ต้องการบันทึก');
      return;
    }

    setSaving(true);

    const savePromises = Array.from(selectedQuestions).map(async (index) => {
      const q = generatedQuestions[index];
      return createQuestion({
        ...q,
        topic: selectedTopic,
        skill_name: selectedTopic,
        semester: semester,
        assessment_type: assessmentType || (semester ? `semester${semester}` : 'semester'),
      });
    });

    await Promise.all(savePromises);
    setSaving(false);

    // Reset
    setGeneratedQuestions([]);
    setSelectedQuestions(new Set());
    onSuccess?.();
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <div className="space-y-4">
          <div>
            <Label>หัวข้อเรียน *</Label>
            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกหัวข้อเรียน" />
              </SelectTrigger>
              <SelectContent>
                {topics.map((topic) => (
                  <SelectItem key={topic.id} value={topic.topic_name_th}>
                    {topic.topic_name_th}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>ระดับความยาก</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">ง่าย</SelectItem>
                  <SelectItem value="medium">ปานกลาง</SelectItem>
                  <SelectItem value="hard">ยาก</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>จำนวนข้อ</Label>
              <Input
                type="number"
                min="1"
                max="20"
                value={count}
                onChange={(e) => setCount(e.target.value)}
              />
            </div>

            <div>
              <Label>ภาษา</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="th">ไทย</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generating || !selectedTopic}
          className="w-full"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              AI กำลังสร้างโจทย์...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              สร้างโจทย์ด้วย AI
            </>
          )}
        </Button>
      </Card>

      {generatedQuestions.length > 0 && (
        <>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedQuestions.size === generatedQuestions.length}
                  onCheckedChange={toggleAll}
                />
                <span className="text-sm font-medium">
                  เลือกทั้งหมด ({selectedQuestions.size}/{generatedQuestions.length})
                </span>
              </div>
              <Button onClick={handleSave} disabled={saving || selectedQuestions.size === 0}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'กำลังบันทึก...' : `บันทึก ${selectedQuestions.size} ข้อ`}
              </Button>
            </div>
          </Card>

          <div className="space-y-4">
            {generatedQuestions.map((question, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selectedQuestions.has(index)}
                    onCheckedChange={() => toggleQuestion(index)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
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
                    </div>

                    <p className="font-medium">{question.question_text}</p>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {question.choices.map((choice: string, cIdx: number) => (
                        <div
                          key={cIdx}
                          className={`p-2 rounded border ${
                            choice === question.correct_answer
                              ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                              : 'border-border'
                          }`}
                        >
                          {String.fromCharCode(65 + cIdx)}. {choice}
                          {choice === question.correct_answer && (
                            <span className="ml-2 text-green-600 font-medium">✓</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {question.explanation && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded text-sm">
                        <strong>คำอธิบาย:</strong> {question.explanation}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}