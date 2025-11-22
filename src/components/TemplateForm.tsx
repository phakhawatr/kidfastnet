import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, Save } from 'lucide-react';
import { useQuestionBank } from '@/hooks/useQuestionBank';
import { toast } from 'sonner';

interface TemplateFormProps {
  teacherId: string;
  grade: number;
  semester?: number;
  assessmentType?: 'semester1' | 'semester2' | 'nt';
  template?: any;
  onSuccess?: () => void;
}

export default function TemplateForm({ teacherId, grade, semester, assessmentType, template, onSuccess }: TemplateFormProps) {
  const { createTemplate } = useQuestionBank(teacherId);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    template_name: template?.template_name || '',
    template_text: template?.template_text || '',
    answer_formula: template?.answer_formula || '',
    difficulty: template?.difficulty || 'medium',
    topic: template?.topic || '',
    grade: template?.grade || grade,
  });

  const [variables, setVariables] = useState<Record<string, any>>(
    template?.variables || { x: { type: 'integer', min: 1, max: 10 } }
  );

  const [choices, setChoices] = useState(
    template?.choices_formula || { correct: 'x', distractors: ['x+1', 'x-1', 'x*2'] }
  );

  const addVariable = () => {
    const newKey = `var${Object.keys(variables).length + 1}`;
    setVariables({
      ...variables,
      [newKey]: { type: 'integer', min: 1, max: 10 }
    });
  };

  const removeVariable = (key: string) => {
    const newVars = { ...variables };
    delete newVars[key];
    setVariables(newVars);
  };

  const updateVariable = (key: string, field: string, value: any) => {
    setVariables({
      ...variables,
      [key]: { ...variables[key], [field]: value }
    });
  };

  const addDistractor = () => {
    setChoices({
      ...choices,
      distractors: [...choices.distractors, 'x']
    });
  };

  const removeDistractor = (index: number) => {
    setChoices({
      ...choices,
      distractors: choices.distractors.filter((_: any, i: number) => i !== index)
    });
  };

  const updateDistractor = (index: number, value: string) => {
    const newDistractors = [...choices.distractors];
    newDistractors[index] = value;
    setChoices({ ...choices, distractors: newDistractors });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.template_name || !formData.template_text || !formData.answer_formula) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setSaving(true);
    
    const templateData = {
      ...formData,
      variables,
      choices_formula: choices,
      teacher_id: teacherId,
      semester: semester,
      assessment_type: assessmentType || (semester ? `semester${semester}` : 'semester'),
    };

    const success = await createTemplate(templateData);
    setSaving(false);

    if (success) {
      toast.success('บันทึก Template สำเร็จ');
      onSuccess?.();
    } else {
      toast.error('เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>ชื่อ Template *</Label>
          <Input
            value={formData.template_name}
            onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
            placeholder="เช่น การบวกเลข 2 หลัก"
          />
        </div>

        <div>
          <Label>หัวข้อ</Label>
          <Input
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            placeholder="เช่น การบวก"
          />
        </div>

        <div>
          <Label>ระดับความยาก *</Label>
          <Select value={formData.difficulty} onValueChange={(v) => setFormData({ ...formData, difficulty: v })}>
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
          <Label>ชั้นเรียน *</Label>
          <Select value={String(formData.grade)} onValueChange={(v) => setFormData({ ...formData, grade: parseInt(v) })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6].map(g => (
                <SelectItem key={g} value={String(g)}>ป.{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>ตัวแปร</Label>
        <p className="text-sm text-muted-foreground mb-2">
          กำหนดตัวแปรที่จะใช้ในโจทย์ (เช่น x, y, a, b)
        </p>
        <div className="space-y-2">
          {Object.entries(variables).map(([key, value]: [string, any]) => (
            <Card key={key} className="p-3">
              <div className="flex items-center gap-2">
                <Input
                  value={key}
                  className="w-24"
                  disabled
                />
                <Select 
                  value={value.type} 
                  onValueChange={(v) => updateVariable(key, 'type', v)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="integer">จำนวนเต็ม</SelectItem>
                    <SelectItem value="decimal">ทศนิยม</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Min"
                  value={value.min}
                  onChange={(e) => updateVariable(key, 'min', parseInt(e.target.value))}
                  className="w-24"
                />
                <span>-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={value.max}
                  onChange={(e) => updateVariable(key, 'max', parseInt(e.target.value))}
                  className="w-24"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => removeVariable(key)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addVariable}>
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มตัวแปร
          </Button>
        </div>
      </div>

      <div>
        <Label>โจทย์ (Template) *</Label>
        <p className="text-sm text-muted-foreground mb-2">
          ใช้ตัวแปรในโจทย์ เช่น "จงหา {'{'}x{'}'} + {'{'}y{'}'}"
        </p>
        <Textarea
          value={formData.template_text}
          onChange={(e) => setFormData({ ...formData, template_text: e.target.value })}
          placeholder="จงหา {x} + {y}"
          rows={3}
        />
      </div>

      <div>
        <Label>สูตรคำตอบ *</Label>
        <p className="text-sm text-muted-foreground mb-2">
          ใช้ JavaScript expression เช่น "x + y" หรือ "Math.round(x * y)"
        </p>
        <Input
          value={formData.answer_formula}
          onChange={(e) => setFormData({ ...formData, answer_formula: e.target.value })}
          placeholder="x + y"
        />
      </div>

      <div>
        <Label>ตัวเลือกที่ผิด (Distractors)</Label>
        <p className="text-sm text-muted-foreground mb-2">
          กำหนดสูตรสำหรับคำตอบที่ผิด
        </p>
        <div className="space-y-2">
          {choices.distractors.map((distractor: string, index: number) => (
            <div key={index} className="flex gap-2">
              <Input
                value={distractor}
                onChange={(e) => updateDistractor(index, e.target.value)}
                placeholder="x + 1"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => removeDistractor(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addDistractor}>
            <Plus className="w-4 h-4 mr-2" />
            เพิ่ม Distractor
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'กำลังบันทึก...' : 'บันทึก Template'}
        </Button>
      </div>
    </form>
  );
}
