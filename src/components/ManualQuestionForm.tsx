import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Save, Plus, Trash2 } from 'lucide-react';
import ImageUploader from './ImageUploader';
import { useQuestionBank } from '@/hooks/useQuestionBank';
import TagInput from './ui/tag-input';
import QuestionTextRenderer from './QuestionTextRenderer';
import ChoiceRenderer from './ChoiceRenderer';

interface ManualQuestionFormProps {
  teacherId: string | null;
  adminId?: string | null;
  grade: number;
  topics: any[];
  semester?: number;
  assessmentType?: 'semester1' | 'semester2' | 'nt';
  onSuccess?: () => void;
}

export default function ManualQuestionForm({ teacherId, adminId, grade, topics, semester, assessmentType, onSuccess }: ManualQuestionFormProps) {
  const { createQuestion, fetchAvailableTags } = useQuestionBank(teacherId || adminId);
  const [questionText, setQuestionText] = useState('');
  const [choices, setChoices] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('0');
  const [explanation, setExplanation] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Fetch available tags when component mounts
  useEffect(() => {
    fetchAvailableTags().then(tags => setAvailableTags(tags));
  }, []);

  const handleChoiceChange = (index: number, value: string) => {
    const newChoices = [...choices];
    newChoices[index] = value;
    setChoices(newChoices);
  };

  const addChoice = () => {
    if (choices.length < 6) {
      setChoices([...choices, '']);
    }
  };

  const removeChoice = (index: number) => {
    if (choices.length > 2) {
      const newChoices = choices.filter((_, i) => i !== index);
      setChoices(newChoices);
      if (parseInt(correctAnswer) === index) {
        setCorrectAnswer('0');
      } else if (parseInt(correctAnswer) > index) {
        setCorrectAnswer((parseInt(correctAnswer) - 1).toString());
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!questionText.trim()) {
      alert('กรุณากรอกโจทย์');
      return;
    }

    if (choices.filter(c => c.trim()).length < 2) {
      alert('กรุณากรอกตัวเลือกอย่างน้อย 2 ตัวเลือก');
      return;
    }

    setSaving(true);

    const result = await createQuestion({
      question_text: questionText,
      choices: choices.filter(c => c.trim()),
      correct_answer: choices[parseInt(correctAnswer)],
      explanation: explanation || undefined,
      grade,
      topic: selectedTopic || undefined,
      difficulty,
      skill_name: selectedTopic || 'คณิตศาสตร์',
      image_urls: imageUrls.length > 0 ? imageUrls : undefined,
      tags: tags.length > 0 ? tags : undefined,
      semester: semester,
      assessment_type: assessmentType || (semester ? `semester${semester}` : 'semester'),
      ai_generated: false,
      is_template: false,
      admin_id: adminId || null,
      is_system_question: false, // Never mark manually created questions as system questions
    });

    setSaving(false);

    if (result) {
      // Reset form
      setQuestionText('');
      setChoices(['', '', '', '']);
      setCorrectAnswer('0');
      setExplanation('');
      setImageUrls([]);
      setTags([]);
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6 space-y-4">
        <div>
          <Label htmlFor="topic">หัวข้อเรียน *</Label>
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
          <Label htmlFor="difficulty">ระดับความยาก *</Label>
          <Select value={difficulty} onValueChange={(v: any) => setDifficulty(v)}>
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
          <TagInput
            value={tags}
            onChange={setTags}
            suggestions={availableTags}
            label="🏷️ Tags (ป้ายกำกับ)"
            placeholder="เช่น ข้อสอบ NT 64, แนว O-NET..."
          />
        </div>

        <div>
          <Label htmlFor="question">โจทย์ *</Label>
          <Textarea
            id="question"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="พิมพ์โจทย์ที่นี่..."
            rows={4}
            required
          />
        </div>

        <div>
          <Label>รูปภาพประกอบ (ถ้ามี)</Label>
          <ImageUploader
            teacherId={teacherId || adminId || ''}
            onImagesChange={setImageUrls}
            maxImages={3}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>ตัวเลือกคำตอบ *</Label>
            {choices.length < 6 && (
              <Button type="button" variant="outline" size="sm" onClick={addChoice}>
                <Plus className="w-4 h-4 mr-1" />
                เพิ่มตัวเลือก
              </Button>
            )}
          </div>

          {choices.map((choice, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={correctAnswer === index.toString()}
                  onChange={() => setCorrectAnswer(index.toString())}
                  className="w-4 h-4"
                />
                <span className="font-medium text-base">{index + 1})</span>
              </div>
              <Input
                value={choice}
                onChange={(e) => handleChoiceChange(index, e.target.value)}
                placeholder={`ตัวเลือก ${index + 1}`}
                className="flex-1"
              />
              {choices.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeChoice(index)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div>
          <Label htmlFor="explanation">คำอธิบาย (ถ้ามี)</Label>
          <Textarea
            id="explanation"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="อธิบายวิธีทำและเฉลย..."
            rows={3}
          />
        </div>

        <div className="pt-4 border-t">
          <Button type="submit" disabled={saving} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'กำลังบันทึก...' : 'บันทึกโจทย์'}
          </Button>
        </div>
      </Card>

      {/* Preview */}
      {questionText && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">ตัวอย่างโจทย์</h3>
          <div className="space-y-4">
            <QuestionTextRenderer text={questionText} className="font-medium" />
            
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {imageUrls.map((url, idx) => (
                  <img key={idx} src={url} alt={`Preview ${idx + 1}`} className="rounded border" />
                ))}
              </div>
            )}

            <div className="space-y-2">
              {choices.filter(c => c.trim()).map((choice, index) => (
                <div
                  key={index}
                  className={`p-3 rounded border flex items-center gap-2 ${
                    correctAnswer === index.toString()
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                      : 'border-border'
                  }`}
                >
                  <span className="text-sm font-light text-gray-500 dark:text-gray-400">{index + 1})</span>
                  <ChoiceRenderer 
                    choice={choice} 
                    size={56}
                    className="text-lg font-semibold text-blue-600 dark:text-blue-400"
                  />
                  {correctAnswer === index.toString() && (
                    <span className="ml-2 text-green-600 font-medium">✓ คำตอบที่ถูก</span>
                  )}
                </div>
              ))}
            </div>

            {explanation && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded">
                <p className="text-sm"><strong>คำอธิบาย:</strong> {explanation}</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </form>
  );
}