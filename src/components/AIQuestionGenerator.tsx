import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, Loader2, Save, Trophy } from 'lucide-react';
import { useQuestionBank } from '@/hooks/useQuestionBank';
import { useTranslation } from 'react-i18next';
import { curriculumConfig } from '@/config/curriculum';
import QuestionTextRenderer from '@/components/QuestionTextRenderer';
import ChoiceRenderer from '@/components/ChoiceRenderer';

interface AIQuestionGeneratorProps {
  teacherId: string | null;
  adminId?: string | null;
  onSuccess?: () => void;
}

export default function AIQuestionGenerator({ teacherId, adminId, onSuccess }: AIQuestionGeneratorProps) {
  const { t } = useTranslation();
  const { generateWithAI, createQuestion, fetchTopicsByGrade, topics } = useQuestionBank(teacherId || adminId);
  
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [assessmentType, setAssessmentType] = useState<'semester1' | 'semester2' | 'nt'>('semester1');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState('5');
  const [language, setLanguage] = useState('th');
  const [generating, setGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch topics when grade or semester changes
    if (selectedGrade === 3) {
      fetchTopicsByGrade(selectedGrade, undefined);
    } else {
      fetchTopicsByGrade(selectedGrade, selectedSemester);
    }
    setSelectedTopic(''); // Reset topic when grade/semester changes
  }, [selectedGrade, selectedSemester, assessmentType]);

  const handleGenerate = async () => {
    if (!selectedTopic) {
      alert('กรุณาเลือกหัวข้อเรียน');
      return;
    }

    setGenerating(true);
    const questions = await generateWithAI({
      grade: selectedGrade,
      semester: selectedGrade === 3 ? undefined : selectedSemester,
      assessmentType: selectedGrade === 3 ? assessmentType : undefined,
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
        question_text: q.question_text,
        choices: q.choices,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        difficulty: q.difficulty,
        grade: q.grade || selectedGrade,
        topic: selectedTopic,
        skill_name: selectedTopic,
        semester: selectedGrade === 3 ? undefined : selectedSemester,
        assessment_type: selectedGrade === 3 ? assessmentType : (selectedSemester ? `semester${selectedSemester}` : 'semester'),
        ai_generated: true,
        admin_id: adminId || null,
        is_system_question: false, // Never mark AI-generated questions as system questions
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
      {/* Format Guide */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200">
        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
          💡 <span>AI จะสร้างโจทย์ด้วยรูปแบบพิเศษ</span>
        </h4>
        <div className="text-xs space-y-1 text-gray-700 dark:text-gray-300">
          <p><strong>นาฬิกา:</strong> AI จะใช้ <code className="bg-white dark:bg-gray-800 px-1 py-0.5 rounded">[clock:ชั่วโมง:นาที]</code> ในโจทย์ เพื่อแสดงหน้าปัดนาฬิกา</p>
          <p><strong>รูปทรง:</strong> AI จะใช้ <code className="bg-white dark:bg-gray-800 px-1 py-0.5 rounded">circle-red</code>, <code className="bg-white dark:bg-gray-800 px-1 py-0.5 rounded">square-blue</code> เพื่อแสดงรูปทรง SVG</p>
          <p className="text-xs text-gray-500">คุณจะเห็นตัวอย่างการแสดงผลด้านล่างหลัง AI สร้างโจทย์เสร็จ</p>
        </div>
      </Card>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">ชั้นเรียน</label>
            <Select value={selectedGrade.toString()} onValueChange={(v) => {
              const grade = Number(v);
              setSelectedGrade(grade);
              setSelectedSemester(1);
              setAssessmentType('semester1');
              setSelectedTopic('');
            }}>
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
            <label className="text-sm font-medium mb-2 block">
              {selectedGrade === 3 ? 'ประเภทการสอบ' : 'เทอม'}
            </label>
            {selectedGrade === 3 ? (
              <RadioGroup value={assessmentType} onValueChange={(v: any) => {
                setAssessmentType(v);
                setSelectedTopic('');
              }}>
                <div className="grid gap-2">
                  <div className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all cursor-pointer">
                    <RadioGroupItem value="semester1" id="ai-semester1" />
                    <Label htmlFor="ai-semester1" className="flex-1 cursor-pointer font-medium">ภาคเรียนที่ 1</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all cursor-pointer">
                    <RadioGroupItem value="semester2" id="ai-semester2" />
                    <Label htmlFor="ai-semester2" className="flex-1 cursor-pointer font-medium">ภาคเรียนที่ 2</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border-2 border-yellow-400 rounded-lg hover:bg-yellow-50 hover:border-yellow-500 transition-all cursor-pointer bg-gradient-to-r from-yellow-50 to-orange-50">
                    <RadioGroupItem value="nt" id="ai-nt" />
                    <Label htmlFor="ai-nt" className="flex-1 cursor-pointer font-medium flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-600" />
                      <span className="text-yellow-900">สอบวัดระดับชาติ (NT)</span>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            ) : (
              <RadioGroup value={selectedSemester.toString()} onValueChange={(v) => {
                setSelectedSemester(Number(v));
                setSelectedTopic('');
              }}>
                <div className="grid gap-2">
                  <div className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all cursor-pointer">
                    <RadioGroupItem value="1" id="ai-sem1" />
                    <Label htmlFor="ai-sem1" className="flex-1 cursor-pointer font-medium">เทอม 1</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all cursor-pointer">
                    <RadioGroupItem value="2" id="ai-sem2" />
                    <Label htmlFor="ai-sem2" className="flex-1 cursor-pointer font-medium">เทอม 2</Label>
                  </div>
                </div>
              </RadioGroup>
            )}
          </div>

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

          <div>
            <Label>ความยาก</Label>
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
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
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

        <Button
          onClick={handleGenerate}
          disabled={generating || !selectedTopic}
          className="w-full mt-4"
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
                   <div className="flex-1 space-y-4">
                    {/* Question Metadata Tags */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 flex-wrap text-sm">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">ข้อ {index + 1}</span>
                        <span className="text-gray-400">|</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          question.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {question.difficulty === 'easy' ? 'ง่าย' :
                           question.difficulty === 'medium' ? 'ปานกลาง' : 'ยาก'}
                        </span>
                        <span className="text-gray-400">|</span>
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          ป.{question.grade || selectedGrade} {question.assessment_type === 'nt' || assessmentType === 'nt' ? 'NT' : `เทอม ${question.semester || selectedSemester}`}
                        </span>
                        <span className="text-gray-400">|</span>
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {question.skill_name || question.topic || selectedTopic}
                        </span>
                      </div>
                      {question.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                          <span className="font-semibold">รายละเอียด:</span> {question.description}
                        </p>
                      )}
                    </div>

                    {/* Question Text */}
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-lg border-2 border-dashed">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">โจทย์:</p>
                      <QuestionTextRenderer text={question.question_text} className="font-medium text-lg" />
                    </div>

                    {/* Choices */}
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">ตัวเลือกคำตอบ:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {question.choices.map((choice: string, cIdx: number) => (
                          <div
                            key={cIdx}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              choice === question.correct_answer
                                ? 'border-green-500 bg-green-50 dark:bg-green-950/20 shadow-md'
                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-base font-medium text-gray-500 dark:text-gray-400 min-w-[24px]">{cIdx + 1})</span>
                              <ChoiceRenderer 
                                choice={choice} 
                                size={64}
                                className="text-lg font-normal text-gray-900 dark:text-gray-100 flex-1"
                              />
                              {choice === question.correct_answer && (
                                <span className="ml-auto text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                                  <span className="text-xl">✓</span>
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {question.explanation && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-xs text-blue-600 dark:text-blue-400 mb-1 font-semibold">คำอธิบาย:</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{question.explanation}</p>
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