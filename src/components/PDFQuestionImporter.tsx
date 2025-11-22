import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileUp, Loader2, Check, X, Edit2, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PDFQuestionImporterProps {
  teacherId: string;
  grade: number;
  semester?: number;
  assessmentType?: string;
  onImportComplete: () => void;
}

interface ImportedQuestion {
  id: string;
  question_text: string;
  choices: string[];
  correct_answer: string;
  explanation?: string;
  difficulty: string;
  skill_name: string;
  topic?: string;
  grade: number;
  semester?: number;
  assessment_type?: string;
  selected?: boolean;
  editing?: boolean;
}

export default function PDFQuestionImporter({ 
  teacherId, 
  grade, 
  semester, 
  assessmentType,
  onImportComplete 
}: PDFQuestionImporterProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [questions, setQuestions] = useState<ImportedQuestion[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<ImportedQuestion | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setQuestions([]);
    } else {
      toast({
        title: "ไฟล์ไม่ถูกต้อง",
        description: "กรุณาเลือกไฟล์ PDF เท่านั้น",
        variant: "destructive",
      });
    }
  };

  const handleProcessPDF = async () => {
    if (!file) return;

    setIsProcessing(true);
    
    try {
      // Step 1: Parse PDF using document parsing API
      toast({
        title: "กำลังประมวลผล",
        description: "กำลังอ่านไฟล์ PDF...",
      });

      const formData = new FormData();
      formData.append('file', file);

      // Upload to temporary storage first
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `temp/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('question_images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('question_images')
        .getPublicUrl(filePath);

      // Parse document (note: this is a placeholder - actual parsing would need a service)
      toast({
        title: "กำลังประมวลผล",
        description: "กำลังใช้ AI วิเคราะห์โจทย์...",
      });

      // For now, read as text and send to AI
      const text = await file.text();

      // Step 2: Send to AI for processing
      const { data, error } = await supabase.functions.invoke('ai-import-pdf-questions', {
        body: {
          parsedText: text.substring(0, 50000), // Limit size for processing
          grade,
          semester,
          assessmentType,
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      // Add unique IDs and selection flag
      const processedQuestions = data.questions.map((q: any, index: number) => ({
        ...q,
        id: `imported-${Date.now()}-${index}`,
        selected: true,
      }));

      setQuestions(processedQuestions);

      toast({
        title: "สำเร็จ!",
        description: `แปลงโจทย์ได้ ${processedQuestions.length} ข้อ กรุณาตรวจสอบและแก้ไข`,
      });

      // Clean up temp file
      await supabase.storage.from('question_images').remove([filePath]);

    } catch (error) {
      console.error('Error processing PDF:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error instanceof Error ? error.message : "ไม่สามารถประมวลผล PDF ได้",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleSelection = (id: string) => {
    setQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, selected: !q.selected } : q
    ));
  };

  const handleEditQuestion = (question: ImportedQuestion) => {
    setEditingQuestion({ ...question });
  };

  const handleSaveEdit = () => {
    if (!editingQuestion) return;
    
    setQuestions(prev => prev.map(q => 
      q.id === editingQuestion.id ? editingQuestion : q
    ));
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleSaveSelected = async () => {
    const selectedQuestions = questions.filter(q => q.selected);
    
    if (selectedQuestions.length === 0) {
      toast({
        title: "ไม่มีข้อที่เลือก",
        description: "กรุณาเลือกข้อสอบที่ต้องการบันทึก",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Prepare questions for database
      const questionsToSave = selectedQuestions.map(q => ({
        teacher_id: teacherId,
        grade: q.grade,
        semester: q.semester,
        assessment_type: q.assessment_type,
        question_text: q.question_text,
        choices: q.choices,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        difficulty: q.difficulty,
        skill_name: q.skill_name,
        topic: q.topic,
        subject: 'คณิตศาสตร์',
        ai_generated: true,
      }));

      const { error } = await supabase
        .from('question_bank')
        .insert(questionsToSave);

      if (error) throw error;

      toast({
        title: "บันทึกสำเร็จ!",
        description: `บันทึกข้อสอบ ${selectedQuestions.length} ข้อเข้าคลังข้อสอบแล้ว`,
      });

      setQuestions([]);
      setFile(null);
      onImportComplete();

    } catch (error) {
      console.error('Error saving questions:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อสอบได้",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">อัปโหลด PDF</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="pdf-file">เลือกไฟล์ PDF</Label>
            <Input
              id="pdf-file"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={isProcessing}
              className="mt-2"
            />
          </div>

          {file && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <FileUp className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">{file.name}</span>
              <span className="text-xs text-gray-500">
                ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
          )}

          <Button
            onClick={handleProcessPDF}
            disabled={!file || isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                กำลังประมวลผล...
              </>
            ) : (
              <>
                <FileUp className="w-4 h-4 mr-2" />
                ประมวลผล PDF
              </>
            )}
          </Button>

          <div className="text-xs text-gray-500 space-y-1">
            <p>⚠️ หมายเหตุ:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>ระบบจะประมวลผลทีละ 10-15 ข้อต่อครั้ง</li>
              <li>AI จะสร้างตัวเลือกคำตอบอัตโนมัติ</li>
              <li>กรุณาตรวจสอบความถูกต้องก่อนบันทึก</li>
              <li>ใช้เวลาประมาณ 30-60 วินาที</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Questions Preview and Edit */}
      {questions.length > 0 && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              ตรวจสอบและแก้ไขข้อสอบ ({questions.filter(q => q.selected).length}/{questions.length} ข้อ)
            </h3>
            <Button
              onClick={handleSaveSelected}
              disabled={isSaving || questions.filter(q => q.selected).length === 0}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  บันทึกข้อที่เลือก
                </>
              )}
            </Button>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {questions.map((question, index) => (
              <Card 
                key={question.id} 
                className={`p-4 ${question.selected ? 'border-primary' : 'border-gray-200 opacity-60'}`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={question.selected}
                    onChange={() => handleToggleSelection(question.id)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold">ข้อ {index + 1}</span>
                        <span className="px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-800">
                          {question.difficulty}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-800">
                          ป.{question.grade} {question.assessment_type === 'nt' ? 'NT' : `เทอม ${question.semester}`}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                          {question.skill_name}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditQuestion(question)}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <p className="font-medium mb-2">{question.question_text}</p>

                    <div className="space-y-1 text-sm mb-2">
                      {question.choices.map((choice, i) => (
                        <div 
                          key={i}
                          className={`p-2 rounded ${
                            choice.startsWith(question.correct_answer) 
                              ? 'bg-green-50 text-green-800 font-medium' 
                              : 'bg-gray-50'
                          }`}
                        >
                          {choice}
                          {choice.startsWith(question.correct_answer) && (
                            <Check className="w-3 h-3 inline ml-2 text-green-600" />
                          )}
                        </div>
                      ))}
                    </div>

                    {question.explanation && (
                      <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                        <strong>คำอธิบาย:</strong> {question.explanation}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Edit Dialog */}
      {editingQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-semibold mb-4">แก้ไขข้อสอบ</h3>
            
            <div className="space-y-4">
              <div>
                <Label>โจทย์</Label>
                <Textarea
                  value={editingQuestion.question_text}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, question_text: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label>ตัวเลือก</Label>
                {editingQuestion.choices.map((choice, i) => (
                  <Input
                    key={i}
                    value={choice}
                    onChange={(e) => {
                      const newChoices = [...editingQuestion.choices];
                      newChoices[i] = e.target.value;
                      setEditingQuestion({ ...editingQuestion, choices: newChoices });
                    }}
                    className="mt-2"
                  />
                ))}
              </div>

              <div>
                <Label>คำตอบที่ถูกต้อง</Label>
                <Select
                  value={editingQuestion.correct_answer}
                  onValueChange={(value) => setEditingQuestion({ ...editingQuestion, correct_answer: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>ระดับความยาก</Label>
                <Select
                  value={editingQuestion.difficulty}
                  onValueChange={(value) => setEditingQuestion({ ...editingQuestion, difficulty: value })}
                >
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
                <Label>ทักษะ</Label>
                <Input
                  value={editingQuestion.skill_name}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, skill_name: e.target.value })}
                />
              </div>

              <div>
                <Label>คำอธิบาย</Label>
                <Textarea
                  value={editingQuestion.explanation || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setEditingQuestion(null)}>
                  ยกเลิก
                </Button>
                <Button onClick={handleSaveEdit}>
                  <Save className="w-4 h-4 mr-2" />
                  บันทึก
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
