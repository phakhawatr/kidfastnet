import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileUp, Loader2, Check, X, Edit2, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';

interface PDFQuestionImporterProps {
  teacherId?: string;
  adminId?: string;
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
  confidence_score?: number;
}

export default function PDFQuestionImporter({ 
  teacherId,
  adminId,
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
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [totalImported, setTotalImported] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);

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
      toast({
        title: "กำลังประมวลผล",
        description: "กำลังอ่านและวิเคราะห์ไฟล์ PDF...",
      });

      const text = await file.text();

      const { data, error } = await supabase.functions.invoke('ai-import-pdf-questions', {
        body: {
          parsedText: text.substring(0, 50000),
          grade,
          semester,
          assessmentType,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // แสดงข้อสอบทั้งหมดให้ครูตรวจสอบ (ไม่บันทึกอัตโนมัติ)
      const processedQuestions = data.questions.map((q: any, index: number) => ({
        ...q,
        id: `imported-${Date.now()}-${index}`,
        selected: true,
      }));

      setQuestions(processedQuestions);
      setTotalImported(processedQuestions.length);
      setShowResultDialog(true);

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

  const handleViewResults = () => {
    setShowResultDialog(false);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
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
    const questionsToSave = selectedQuestions.map(q => ({
      teacher_id: adminId ? null : teacherId,
      admin_id: adminId || null,
      is_system_question: !!adminId,
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
      ai_generated: true,
      tags: ['PDF'],
    }));

      const { error } = await supabase
        .from('question_bank')
        .insert(questionsToSave);

      if (error) throw error;
      
      toast({
        title: "บันทึกสำเร็จ!",
        description: `บันทึกข้อสอบลงฐานข้อมูลกลาง ${selectedQuestions.length} ข้อเรียบร้อยแล้ว`,
      });

      setQuestions([]);
      setFile(null);
      setTotalImported(0);
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
              <li>กรุณาตรวจสอบความถูกต้องก่อนยืนยันบันทึก</li>
              <li>ใช้เวลาประมาณ 30-60 วินาที</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Result Alert Dialog */}
      <AlertDialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <AlertDialogTitle>ประมวลผลเสร็จสิ้น</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-4">
              <div className="text-center py-6">
                <div className="text-5xl font-bold text-primary mb-2">
                  {totalImported}
                </div>
                <p className="text-base text-foreground">
                  ข้อสอบที่นำเข้าจาก PDF
                </p>
              </div>
              <div className="bg-accent/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <AlertCircle className="inline h-4 w-4 mr-1" />
                  กรุณาตรวจสอบความถูกต้องของข้อสอบก่อนยืนยันบันทึกลงฐานข้อมูลกลาง
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleViewResults}>
              ดูรายการข้อสอบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Questions Preview and Edit */}
      {questions.length > 0 && (
        <Card ref={resultsRef} className="p-6 scroll-mt-4 animate-fade-in">
          <div className="space-y-3 mb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  ตรวจสอบข้อสอบที่นำเข้า
                </h3>
                <p className="text-sm text-muted-foreground">
                  กรุณาตรวจสอบความถูกต้องของข้อสอบก่อนยืนยันบันทึกลงฐานข้อมูลกลาง
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-3xl font-bold text-primary">{questions.length}</div>
                <div className="text-sm text-muted-foreground">ข้อสอบทั้งหมด</div>
              </div>
            </div>
            
            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setQuestions([]);
                  setFile(null);
                  setTotalImported(0);
                }}
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleSaveSelected}
                disabled={isSaving || questions.filter(q => q.selected).length === 0}
                size="lg"
                className="min-w-[250px]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    ยืนยันและบันทึกลงฐานข้อมูล ({questions.filter(q => q.selected).length})
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {questions.map((question, index) => (
              <Card 
                key={question.id} 
                className={`p-4 border-2 ${
                  question.selected 
                    ? 'border-primary/50 bg-primary/5' 
                    : 'border-border opacity-60'
                }`}
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
                        {question.confidence_score !== undefined && (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            question.confidence_score >= 0.7
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : question.confidence_score >= 0.5
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            มั่นใจ: {(question.confidence_score * 100).toFixed(0)}%
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
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
                              : 'bg-muted'
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
                      <div className="text-xs text-muted-foreground bg-accent p-2 rounded">
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
                  onChange={(e) => setEditingQuestion({
                    ...editingQuestion,
                    question_text: e.target.value
                  })}
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>ตัวเลือก</Label>
                <div className="space-y-2 mt-1">
                  {editingQuestion.choices.map((choice, i) => (
                    <Input
                      key={i}
                      value={choice}
                      onChange={(e) => {
                        const newChoices = [...editingQuestion.choices];
                        newChoices[i] = e.target.value;
                        setEditingQuestion({
                          ...editingQuestion,
                          choices: newChoices
                        });
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label>คำตอบที่ถูกต้อง</Label>
                <Select
                  value={editingQuestion.correct_answer}
                  onValueChange={(value) => setEditingQuestion({
                    ...editingQuestion,
                    correct_answer: value
                  })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ก">ก</SelectItem>
                    <SelectItem value="ข">ข</SelectItem>
                    <SelectItem value="ค">ค</SelectItem>
                    <SelectItem value="ง">ง</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>ระดับความยาก</Label>
                <Select
                  value={editingQuestion.difficulty}
                  onValueChange={(value) => setEditingQuestion({
                    ...editingQuestion,
                    difficulty: value
                  })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ง่าย">ง่าย</SelectItem>
                    <SelectItem value="ปานกลาง">ปานกลาง</SelectItem>
                    <SelectItem value="ยาก">ยาก</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>คำอธิบาย</Label>
                <Textarea
                  value={editingQuestion.explanation || ''}
                  onChange={(e) => setEditingQuestion({
                    ...editingQuestion,
                    explanation: e.target.value
                  })}
                  rows={2}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingQuestion(null)}
                >
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
