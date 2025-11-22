import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Trash2, Edit, Copy } from 'lucide-react';
import { useQuestionBank } from '@/hooks/useQuestionBank';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import TemplateForm from './TemplateForm';

interface TemplateManagerProps {
  teacherId: string;
  grade: number;
}

export default function TemplateManager({ teacherId, grade }: TemplateManagerProps) {
  const { templates, fetchTemplates, generateFromTemplate } = useQuestionBank(teacherId);
  const [search, setSearch] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const filteredTemplates = templates.filter(t => 
    t.grade === grade &&
    (search === '' || 
     t.template_name.toLowerCase().includes(search.toLowerCase()) ||
     t.topic?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleGenerate = async (templateId: string, count: number = 5) => {
    setGenerating(templateId);
    await generateFromTemplate(templateId, count);
    setGenerating(null);
  };

  const handleEdit = (template: any) => {
    setSelectedTemplate(template);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedTemplate(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="ค้นหา template..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              สร้าง Template ใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedTemplate ? 'แก้ไข Template' : 'สร้าง Template ใหม่'}
              </DialogTitle>
            </DialogHeader>
            <TemplateForm
              teacherId={teacherId}
              grade={grade}
              template={selectedTemplate}
              onSuccess={() => {
                setIsFormOpen(false);
                fetchTemplates();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">{template.template_name}</h3>
                  <Badge variant={
                    template.difficulty === 'easy' ? 'default' :
                    template.difficulty === 'medium' ? 'secondary' : 'destructive'
                  }>
                    {template.difficulty === 'easy' ? 'ง่าย' :
                     template.difficulty === 'medium' ? 'ปานกลาง' : 'ยาก'}
                  </Badge>
                  {template.topic && (
                    <Badge variant="outline">{template.topic}</Badge>
                  )}
                </div>

                <div className="bg-muted p-3 rounded text-sm font-mono">
                  {template.template_text}
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>ตัวแปร: {Object.keys(template.variables).length} ตัว</span>
                  <span>•</span>
                  <span>ใช้ไปแล้ว: {template.times_used || 0} ครั้ง</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {Object.entries(template.variables).map(([key, value]: [string, any]) => (
                    <Badge key={key} variant="outline" className="text-xs">
                      {key}: {value.type} ({value.min}-{value.max})
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(template)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                
                <Button
                  size="sm"
                  onClick={() => handleGenerate(template.id)}
                  disabled={generating === template.id}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {generating === template.id ? 'กำลังสร้าง...' : 'สร้างโจทย์'}
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>ยังไม่มี Template สำหรับชั้นนี้</p>
            <Button className="mt-4" onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              สร้าง Template แรก
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
