import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, Pencil, Sparkles, FileText, Trash2, Share2, Users, Trophy, FileUp, Database, CheckCircle2, X, Tag, ImageIcon, ZoomIn, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useQuestionBank, QuestionBankItem } from '@/hooks/useQuestionBank';
import { useTranslation } from 'react-i18next';
import { curriculumConfig } from '@/config/curriculum';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import ManualQuestionForm from './ManualQuestionForm';
import AIQuestionGenerator from './AIQuestionGenerator';
import TemplateManager from './TemplateManager';
import SharedQuestionsBrowser from './SharedQuestionsBrowser';
import SystemQuestionsBrowser from './SystemQuestionsBrowser';
import PDFQuestionImporter from './PDFQuestionImporter';
import TagInput from './ui/tag-input';
import ImageUploader from './ImageUploader';
import QuestionTextRenderer from './QuestionTextRenderer';
import ChoiceRenderer from './ChoiceRenderer';

interface QuestionBankManagerProps {
  teacherId?: string | null;
  adminId?: string | null;
  isAdmin?: boolean;
}

export default function QuestionBankManager({ teacherId, adminId, isAdmin = false }: QuestionBankManagerProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [assessmentType, setAssessmentType] = useState<'semester1' | 'semester2' | 'nt'>('semester1');
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sharedQuestionsMap, setSharedQuestionsMap] = useState<Record<string, { id: string; share_code: string }>>({});
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<QuestionBankItem | null>(null);
  const [editForm, setEditForm] = useState({
    question_text: '',
    choices: ['', '', '', ''],
    correct_answer: '',
    explanation: '',
    difficulty: 'medium',
    tags: [] as string[],
    image_urls: [] as string[]
  });
  const [showBulkTagDialog, setShowBulkTagDialog] = useState(false);
  const [bulkTagsToAdd, setBulkTagsToAdd] = useState<string[]>([]);
  const [bulkTagsToRemove, setBulkTagsToRemove] = useState<string[]>([]);
  const [bulkEditing, setBulkEditing] = useState(false);
  const [editingTagsQuestion, setEditingTagsQuestion] = useState<QuestionBankItem | null>(null);
  const [singleQuestionTags, setSingleQuestionTags] = useState<string[]>([]);
  const [imageFilter, setImageFilter] = useState<'all' | 'with-image' | 'no-image'>('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [generatingImageIds, setGeneratingImageIds] = useState<Set<string>>(new Set());
  const [bulkGeneratingImages, setBulkGeneratingImages] = useState(false);
  
  const {
    questions,
    topics,
    loading,
    fetchQuestions,
    fetchTopicsByGrade,
    deleteQuestion,
    shareQuestion,
    unshareQuestion,
    checkSharedQuestions,
    updateQuestion,
    fetchAvailableTags,
    generateAIImage,
  } = useQuestionBank(teacherId || adminId, !!adminId);

  useEffect(() => {
    if (teacherId || adminId) {
      // Clear topics first when changing grade/semester  
      const filters: any = { grade: selectedGrade };
      
      if (selectedGrade === 3) {
        filters.assessmentType = assessmentType;
      } else {
        filters.semester = selectedSemester;
      }
      
      fetchQuestions(filters);
      
      // Fetch topics based on grade and semester
      // For all grades, we pass the semester to get the correct topics
      fetchTopicsByGrade(selectedGrade, selectedGrade === 3 ? undefined : selectedSemester);
    }
  }, [teacherId, adminId, selectedGrade, selectedSemester, assessmentType]);

  useEffect(() => {
    // Check which questions are shared
    if (questions.length > 0) {
      const questionIds = questions.map(q => q.id);
      checkSharedQuestions(questionIds).then(setSharedQuestionsMap);
    }
  }, [questions]);

  useEffect(() => {
    // Fetch available tags when component mounts
    if (teacherId || adminId) {
      fetchAvailableTags().then(setAvailableTags);
    }
  }, [teacherId, adminId]);

  const handleRefresh = () => {
    if (teacherId || adminId) {
      const filters: any = { 
        grade: selectedGrade, 
        topic: selectedTopic !== 'all' ? selectedTopic : undefined, 
        difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined
      };
      
      if (selectedGrade === 3) {
        filters.assessmentType = assessmentType;
      } else {
        filters.semester = selectedSemester;
      }
      
      fetchQuestions(filters);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('คุณต้องการลบโจทย์นี้หรือไม่?')) {
      await deleteQuestion(id);
      handleRefresh();
    }
  };

  const handleShare = async (id: string) => {
    if (confirm('แชร์โจทย์นี้ให้ครูท่านอื่นใช้ได้หรือไม่?')) {
      await shareQuestion(id, true);
      handleRefresh();
    }
  };

  const handleUnshare = async (id: string) => {
    if (confirm('ยกเลิกการแชร์โจทย์นี้หรือไม่?')) {
      await unshareQuestion(id);
      handleRefresh();
    }
  };

  const handleEditQuestion = (question: QuestionBankItem) => {
    setEditingQuestion(question);
    
    // Clean choices - remove A), B), C), D) prefix
    const cleanedChoices = Array.isArray(question.choices) 
      ? question.choices.map(c => typeof c === 'string' ? c.replace(/^[A-D]\)\s*/, '') : c)
      : ['', '', '', ''];
    
    // Convert correct_answer letter to actual choice text
    let correctAnswerText = question.correct_answer.replace(/^[A-D]\)\s*/, '');
    
    // Check if correct_answer is just a letter (A, B, C, D)
    if (/^[A-D]$/.test(question.correct_answer)) {
      const letterIndex = question.correct_answer.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
      if (letterIndex >= 0 && letterIndex < cleanedChoices.length) {
        correctAnswerText = cleanedChoices[letterIndex];
      }
    }
    
    setEditForm({
      question_text: question.question_text,
      choices: cleanedChoices,
      correct_answer: correctAnswerText,
      explanation: question.explanation || '',
      difficulty: question.difficulty,
      tags: question.tags || [],
      image_urls: question.image_urls || []
    });
  };

  const handleSaveEdit = async () => {
    if (!editingQuestion) return;

    // Add A), B), C), D) prefix back to choices for database storage
    const choicesWithPrefix = editForm.choices.map((c, idx) => {
      const letter = String.fromCharCode(65 + idx); // A, B, C, D
      return `${letter}) ${c}`;
    });
    
    // Add prefix to correct answer too
    const correctIndex = editForm.choices.indexOf(editForm.correct_answer);
    const correctWithPrefix = correctIndex !== -1 
      ? String.fromCharCode(65 + correctIndex) + ') ' + editForm.correct_answer
      : editForm.correct_answer;

    const success = await updateQuestion(editingQuestion.id, {
      question_text: editForm.question_text,
      choices: choicesWithPrefix,
      correct_answer: correctWithPrefix,
      explanation: editForm.explanation,
      difficulty: editForm.difficulty,
      tags: editForm.tags,
      image_urls: editForm.image_urls.length > 0 ? editForm.image_urls : undefined
    });

    if (success) {
      setEditingQuestion(null);
      handleRefresh();
    }
  };

  const handleCancelEdit = () => {
    setEditingQuestion(null);
    setEditForm({
      question_text: '',
      choices: ['', '', '', ''],
      correct_answer: '',
      explanation: '',
      difficulty: 'medium',
      tags: [],
      image_urls: []
    });
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

  const handleBulkEditTags = async () => {
    setBulkEditing(true);
    
    try {
      const selectedQuestionsData = questions.filter(q => selectedQuestions.has(q.id));
      
      const updatePromises = selectedQuestionsData.map(async (question) => {
        let newTags = [...(question.tags || [])];
        
        // Add new tags
        bulkTagsToAdd.forEach(tag => {
          if (!newTags.includes(tag)) {
            newTags.push(tag);
          }
        });
        
        // Remove tags
        bulkTagsToRemove.forEach(tag => {
          newTags = newTags.filter(t => t !== tag);
        });
        
        return updateQuestion(question.id, { tags: newTags });
      });
      
      await Promise.all(updatePromises);
      
      toast.success(`แก้ไข Tags สำหรับ ${selectedQuestions.size} ข้อสำเร็จ`);
      setShowBulkTagDialog(false);
      setBulkTagsToAdd([]);
      setBulkTagsToRemove([]);
      setSelectedQuestions(new Set());
      handleRefresh();
    } catch (error: any) {
      toast.error('เกิดข้อผิดพลาดในการแก้ไข Tags');
    } finally {
      setBulkEditing(false);
    }
  };

  const handleOpenBulkTagDialog = () => {
    setBulkTagsToAdd([]);
    setBulkTagsToRemove([]);
    setShowBulkTagDialog(true);
  };

  const handleOpenSingleTagEdit = (question: QuestionBankItem) => {
    setEditingTagsQuestion(question);
    setSingleQuestionTags(question.tags || []);
  };

  const handleSaveSingleTags = async () => {
    if (!editingTagsQuestion) return;

    const success = await updateQuestion(editingTagsQuestion.id, { 
      tags: singleQuestionTags 
    });

    if (success) {
      toast.success('อัพเดท Tags สำเร็จ');
      setEditingTagsQuestion(null);
      setSingleQuestionTags([]);
      handleRefresh();
    }
  };

  const getTagCounts = () => {
    const tagCounts: { [key: string]: number } = {};
    
    questions
      .filter((q) => !q.is_system_question)
      .forEach((question) => {
        if (question.tags && Array.isArray(question.tags)) {
          question.tags.forEach((tag: string) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });
    
    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([tag, count]) => ({ tag, count }));
  };

  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  const filteredQuestions = questions.filter(q => {
    // Filter out system questions (safety net to prevent displaying tag placeholders)
    if (q.is_system_question === true) return false;
    
    if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
    if (selectedTopic !== 'all' && q.topic !== selectedTopic) return false;
    if (searchQuery && !q.question_text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    // Image filter
    if (imageFilter === 'with-image' && (!q.image_urls || q.image_urls.length === 0)) return false;
    if (imageFilter === 'no-image' && q.image_urls && q.image_urls.length > 0) return false;
    
    // Tag filtering with OR logic (at least one tag matches)
    if (selectedTags.length > 0) {
      const questionTags = q.tags || [];
      const hasMatchingTag = selectedTags.some(selectedTag => 
        questionTags.includes(selectedTag)
      );
      if (!hasMatchingTag) return false;
    }
    
    return true;
  });

  // Helper function to get skill description from curriculum config
  const getSkillDescription = (grade: number, semester: number | undefined, assessmentType: string | undefined, skillName: string) => {
    const gradeKey = `grade${grade}` as keyof typeof curriculumConfig;
    const gradeConfig = curriculumConfig[gradeKey];
    
    if (!gradeConfig) return null;
    
    let semesterKey: string;
    if (assessmentType === 'nt') {
      semesterKey = 'nt';
    } else {
      semesterKey = semester ? `semester${semester}` : 'semester1';
    }
    
    const skills = gradeConfig[semesterKey];
    if (!skills) return null;
    
    const skill = skills.find(s => s.skill === skillName);
    return skill ? skill.description : null;
  };

  const openLightbox = (images: string[], startIndex: number = 0) => {
    setLightboxImages(images);
    setCurrentImageIndex(startIndex);
    setLightboxOpen(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % lightboxImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">📚 คลังข้อสอบ</h1>
          <p className="text-gray-200">
            จัดการและสร้างโจทย์สำหรับการออกข้อสอบ
          </p>
        </div>
        {adminId && (
          <Button
            variant="outline"
            onClick={() => navigate('/admin/tags')}
            className="flex items-center gap-2"
          >
            <Tag className="w-4 h-4" />
            จัดการ Tags
          </Button>
        )}
      </div>

      <Tabs defaultValue="library" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="library" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            คลังข้อสอบของฉัน
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            คลังกลาง
          </TabsTrigger>
          <TabsTrigger value="shared" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            โจทย์แชร์
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Pencil className="w-4 h-4" />
            สร้างด้วยมือ
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            สร้างด้วย AI
          </TabsTrigger>
          <TabsTrigger value="pdf-import" className="flex items-center gap-2">
            <FileUp className="w-4 h-4" />
            นำเข้า PDF
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            แม่แบบโจทย์
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-4">
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">ชั้นเรียน</label>
                <Select value={selectedGrade.toString()} onValueChange={(v) => {
                  const grade = Number(v);
                  setSelectedGrade(grade);
                  setSelectedSemester(1);
                  setAssessmentType('semester1');
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
                  <RadioGroup value={assessmentType} onValueChange={(v: any) => setAssessmentType(v)}>
                    <div className="grid gap-2">
                      <div className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all cursor-pointer">
                        <RadioGroupItem value="semester1" id="semester1" />
                        <Label htmlFor="semester1" className="flex-1 cursor-pointer font-medium">ภาคเรียนที่ 1</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all cursor-pointer">
                        <RadioGroupItem value="semester2" id="semester2" />
                        <Label htmlFor="semester2" className="flex-1 cursor-pointer font-medium">ภาคเรียนที่ 2</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border-2 border-yellow-400 rounded-lg hover:bg-yellow-50 hover:border-yellow-500 transition-all cursor-pointer bg-gradient-to-r from-yellow-50 to-orange-50">
                        <RadioGroupItem value="nt" id="nt" />
                        <Label htmlFor="nt" className="flex-1 cursor-pointer font-medium flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-yellow-600" />
                          <span className="text-yellow-900">สอบวัดระดับชาติ (NT)</span>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                ) : (
                  <RadioGroup value={selectedSemester.toString()} onValueChange={(v) => setSelectedSemester(Number(v))}>
                    <div className="grid gap-2">
                      <div className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all cursor-pointer">
                        <RadioGroupItem value="1" id="sem1" />
                        <Label htmlFor="sem1" className="flex-1 cursor-pointer font-medium">เทอม 1</Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border-2 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all cursor-pointer">
                        <RadioGroupItem value="2" id="sem2" />
                        <Label htmlFor="sem2" className="flex-1 cursor-pointer font-medium">เทอม 2</Label>
                      </div>
                    </div>
                  </RadioGroup>
                )}
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

              <div>
                <label className="text-sm font-medium mb-2 block">รูปภาพ</label>
                <Select value={imageFilter} onValueChange={(v: any) => setImageFilter(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="with-image">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        มีรูปภาพ
                      </div>
                    </SelectItem>
                    <SelectItem value="no-image">ไม่มีรูปภาพ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">🏷️ กรองตาม Tags</label>
                {selectedTags.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedTags([])}
                    className="h-6 text-xs"
                  >
                    ล้างทั้งหมด
                  </Button>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {getTagCounts().map(({ tag, count }) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <Badge
                      key={tag}
                      variant={isSelected ? "default" : "outline"}
                      className={`cursor-pointer text-xs font-light transition-all hover:scale-105 ${
                        isSelected 
                          ? 'bg-pink-500 text-white border-pink-600 dark:bg-pink-600' 
                          : 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-800'
                      }`}
                      onClick={() => handleToggleTag(tag)}
                    >
                      🏷️ {tag} <span className="ml-1 font-medium">({count})</span>
                    </Badge>
                  );
                })}
              </div>
              
              {getTagCounts().length === 0 && (
                <p className="text-xs text-muted-foreground">ยังไม่มี tags</p>
              )}
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
                  {adminId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOpenBulkTagDialog}
                    >
                      <Tag className="w-4 h-4 mr-2" />
                      แก้ไข Tags
                    </Button>
                  )}
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

          {!loading && filteredQuestions.length > 0 && (
            <div className="flex items-center justify-between flex-wrap gap-2 px-2">
              <p className="text-sm text-gray-200">
                พบ <span className="font-bold text-white">{filteredQuestions.length}</span> ข้อสอบ
              </p>
              
              {/* Active Filters Summary */}
              {(selectedDifficulty !== 'all' || selectedTopic !== 'all' || selectedTags.length > 0) && (
                <div className="flex items-center gap-2 flex-wrap text-xs text-gray-300">
                  <span>กรองโดย:</span>
                  {selectedTopic !== 'all' && <Badge variant="secondary" className="text-xs">{selectedTopic}</Badge>}
                  {selectedDifficulty !== 'all' && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedDifficulty === 'easy' ? 'ง่าย' : selectedDifficulty === 'medium' ? 'ปานกลาง' : 'ยาก'}
                    </Badge>
                  )}
                  {selectedTags.map(tag => (
                    <Badge 
                      key={tag} 
                      variant="outline" 
                      className="text-xs bg-pink-100 text-pink-700 border-pink-300 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-800"
                    >
                      🏷️ {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
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
                      <div className="flex items-start gap-2 mb-2 flex-wrap">
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
                        
                        {/* 3. สร้างจาก (PDF/AI/Template/ระบบ) */}
                        {question.tags && question.tags.includes('PDF') && (
                          <Badge variant="outline" className="text-xs font-normal bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800">
                            <FileUp className="w-3 h-3 inline mr-1" />
                            PDF
                          </Badge>
                        )}
                        {question.ai_generated && !question.tags?.includes('PDF') && (
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
                        {question.is_template && (
                          <Badge variant="outline" className="text-xs font-normal bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800">
                            <FileText className="w-3 h-3 inline mr-1" />
                            Template
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
                        {question.skill_name && (
                          <Badge variant="outline" className="text-xs font-normal bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
                            {t(`skills:skills.${question.skill_name}.title`, question.skill_name)}
                          </Badge>
                        )}
                        
                        {/* 6. อธิบายหัวข้อ */}
                        {question.skill_name && (() => {
                          const description = getSkillDescription(
                            question.grade,
                            question.semester,
                            question.assessment_type,
                            question.skill_name
                          );
                          return description ? (
                            <Badge variant="outline" className="text-xs font-normal bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800 max-w-md truncate">
                              {description}
                            </Badge>
                          ) : null;
                        })()}

                        {/* 7. Custom Tags */}
                        {question.tags && question.tags.filter(tag => !['PDF', 'AI'].includes(tag)).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs font-normal bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                          >
                            {tag}
                          </Badge>
                        ))}

                        {/* 8. Image Indicator */}
                        {question.image_urls && question.image_urls.length > 0 && (
                          <Badge variant="outline" className="text-xs font-normal bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                            <ImageIcon className="w-3 h-3 mr-1" />
                            {question.image_urls.length} รูป
                          </Badge>
                        )}
                      </div>
                      <div className="font-medium mb-2">
                        <QuestionTextRenderer text={question.question_text} />
                      </div>
                      
                      {question.image_urls && question.image_urls.length > 0 && (
                        <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                          <div className="flex items-center gap-1 mb-2">
                            <ImageIcon className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">รูปภาพประกอบ:</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {question.image_urls.map((url: string, imgIdx: number) => (
                              <div
                                key={imgIdx}
                                className="relative group cursor-pointer"
                                onClick={() => openLightbox(question.image_urls || [], imgIdx)}
                              >
                                <img
                                  src={url}
                                  alt={`Question image ${imgIdx + 1}`}
                                  className="rounded border border-gray-300 dark:border-gray-700 max-h-32 w-full object-cover hover:scale-105 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                                  <ZoomIn className="w-6 h-6 text-white" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        {Array.isArray(question.choices) && question.choices.map((choice: string, idx: number) => {
                          // Extract the letter prefix from choice (e.g., "A" from "A) 6")
                          const choiceLetter = choice.match(/^([A-D])\)/)?.[1];
                          const isCorrect = choiceLetter === question.correct_answer || choice === question.correct_answer;
                          return (
                            <div
                              key={idx}
                              className={`p-3 rounded border flex items-center justify-between ${
                                isCorrect
                                  ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                                  : 'border-border'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-light text-gray-500 dark:text-gray-400">{idx + 1})</span>
                                <ChoiceRenderer 
                                  choice={choice.replace(/^[A-D]\)\s*/, '')} 
                                  size={56}
                                  className="text-lg font-semibold text-blue-600 dark:text-blue-400"
                                />
                              </div>
                              {isCorrect && (
                                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                              )}
                            </div>
                          );
                        })}
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
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditQuestion(question)}
                        title="แก้ไขโจทย์"
                        className="justify-start"
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        แก้ไข
                      </Button>
                      {adminId && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenSingleTagEdit(question)}
                          title="แก้ไข Tags"
                          className="justify-start"
                        >
                          <Tag className="w-4 h-4 mr-2" />
                          แก้ไข Tags
                        </Button>
                      )}
                      {sharedQuestionsMap[question.id] ? (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-950 rounded-md border border-green-200 dark:border-green-800">
                            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                            <span className="text-xs font-medium text-green-700 dark:text-green-300">แชร์แล้ว</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnshare(question.id)}
                            title="ยกเลิกการแชร์"
                            className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                          >
                            <X className="w-4 h-4 mr-1" />
                            ยกเลิก
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShare(question.id)}
                          title="แชร์โจทย์"
                        >
                          <Share2 className="w-4 h-4 text-primary" />
                        </Button>
                      )}
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

        <TabsContent value="system">
          <SystemQuestionsBrowser teacherId={teacherId || adminId || null} onImportSuccess={handleRefresh} />
        </TabsContent>

        <TabsContent value="shared">
          <SharedQuestionsBrowser teacherId={teacherId || adminId || null} onImportSuccess={handleRefresh} />
        </TabsContent>

        <TabsContent value="manual">
          <ManualQuestionForm
            teacherId={teacherId}
            adminId={adminId}
            grade={selectedGrade}
            topics={topics}
            semester={selectedGrade === 3 ? undefined : selectedSemester}
            assessmentType={selectedGrade === 3 ? assessmentType : undefined}
            onSuccess={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="ai">
          <AIQuestionGenerator
            teacherId={teacherId}
            adminId={adminId}
            onSuccess={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="pdf-import">
          <PDFQuestionImporter
            teacherId={teacherId || null}
            adminId={adminId || null}
            grade={selectedGrade}
            semester={selectedGrade === 3 ? undefined : selectedSemester}
            assessmentType={selectedGrade === 3 ? assessmentType : undefined}
            onImportComplete={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="templates">
          <TemplateManager 
            teacherId={teacherId || adminId || null} 
            grade={selectedGrade}
            semester={selectedGrade === 3 ? undefined : selectedSemester}
            assessmentType={selectedGrade === 3 ? assessmentType : undefined}
          />
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

      {/* Bulk Edit Tags Dialog */}
      <Dialog open={showBulkTagDialog} onOpenChange={setShowBulkTagDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>แก้ไข Tags แบบกลุ่ม</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">
                📝 จำนวนโจทย์ที่เลือก: <span className="text-primary">{selectedQuestions.size} ข้อ</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                การเปลี่ยนแปลงจะมีผลกับทุกโจทย์ที่เลือกไว้
              </p>
            </div>

            {/* Add Tags Section */}
            <div>
              <Label htmlFor="bulk-add-tags">✨ เพิ่ม Tags</Label>
              <div className="mt-2">
                <TagInput
                  value={bulkTagsToAdd}
                  onChange={setBulkTagsToAdd}
                  suggestions={availableTags}
                  placeholder="เลือก tags ที่ต้องการเพิ่ม..."
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Tags เหล่านี้จะถูกเพิ่มเข้าไปในทุกโจทย์ที่เลือก (ไม่ซ้ำกัน)
              </p>
            </div>

            {/* Remove Tags Section */}
            <div>
              <Label htmlFor="bulk-remove-tags">🗑️ ลบ Tags</Label>
              <div className="mt-2">
                <TagInput
                  value={bulkTagsToRemove}
                  onChange={setBulkTagsToRemove}
                  suggestions={availableTags}
                  placeholder="เลือก tags ที่ต้องการลบ..."
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Tags เหล่านี้จะถูกลบออกจากทุกโจทย์ที่เลือก (ถ้ามีอยู่)
              </p>
            </div>

            {/* Preview Section */}
            {(bulkTagsToAdd.length > 0 || bulkTagsToRemove.length > 0) && (
              <div className="p-4 bg-accent/50 rounded-lg border">
                <p className="text-sm font-medium mb-2">📋 สรุปการเปลี่ยนแปลง:</p>
                {bulkTagsToAdd.length > 0 && (
                  <div className="text-xs mb-1">
                    ✅ เพิ่ม: {bulkTagsToAdd.map(tag => (
                      <Badge key={tag} variant="secondary" className="ml-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                {bulkTagsToRemove.length > 0 && (
                  <div className="text-xs">
                    ❌ ลบ: {bulkTagsToRemove.map(tag => (
                      <Badge key={tag} variant="destructive" className="ml-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowBulkTagDialog(false);
                setBulkTagsToAdd([]);
                setBulkTagsToRemove([]);
              }}
              disabled={bulkEditing}
            >
              ยกเลิก
            </Button>
            <Button 
              onClick={handleBulkEditTags}
              disabled={bulkEditing || (bulkTagsToAdd.length === 0 && bulkTagsToRemove.length === 0)}
            >
              {bulkEditing ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Question Dialog */}
      <Dialog open={!!editingQuestion} onOpenChange={() => handleCancelEdit()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>แก้ไขโจทย์</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Question Text */}
            <div>
              <Label htmlFor="edit-question">คำถาม</Label>
              <Textarea
                id="edit-question"
                value={editForm.question_text}
                onChange={(e) => setEditForm({ ...editForm, question_text: e.target.value })}
                rows={3}
                className="mt-1"
              />
            </div>

            {/* Image Upload */}
            <div>
              <Label>รูปภาพประกอบ (สูงสุด 1 รูป)</Label>
              <div className="mt-2">
                <ImageUploader
                  teacherId={teacherId || adminId || ''}
                  onImagesChange={(urls) => setEditForm({ ...editForm, image_urls: urls })}
                  maxImages={1}
                  initialImages={editForm.image_urls}
                />
              </div>
            </div>

            {/* Choices */}
            <div>
              <Label>ตัวเลือก (4 ข้อ)</Label>
              <div className="space-y-2 mt-2">
                {editForm.choices.map((choice, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      value={choice}
                      onChange={(e) => {
                        const newChoices = [...editForm.choices];
                        newChoices[idx] = e.target.value;
                        setEditForm({ ...editForm, choices: newChoices });
                      }}
                      placeholder={`ตัวเลือกที่ ${idx + 1}`}
                      className={`flex-1 ${
                        choice === editForm.correct_answer
                          ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                          : ''
                      }`}
                    />
                    
                    {/* Choice Preview (shapes, clocks, etc.) */}
                    <div className="min-w-[60px] flex items-center justify-center p-2 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                      <ChoiceRenderer choice={choice} size={40} />
                    </div>
                    
                    {/* "Set as Correct" Button */}
                    <Button
                      variant={choice === editForm.correct_answer ? "default" : "outline"}
                      size="sm"
                      onClick={() => setEditForm({ ...editForm, correct_answer: choice })}
                    >
                      {choice === editForm.correct_answer ? '✓ ถูก' : 'ตั้งเป็นคำตอบ'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Explanation */}
            <div>
              <Label htmlFor="edit-explanation">คำอธิบาย (ไม่บังคับ)</Label>
              <Textarea
                id="edit-explanation"
                value={editForm.explanation}
                onChange={(e) => setEditForm({ ...editForm, explanation: e.target.value })}
                rows={2}
                className="mt-1"
                placeholder="เฉลยหรือคำอธิบายเพิ่มเติม"
              />
            </div>

            {/* Difficulty */}
            <div>
              <Label htmlFor="edit-difficulty">ระดับความยาก</Label>
              <Select value={editForm.difficulty} onValueChange={(value) => setEditForm({ ...editForm, difficulty: value })}>
                <SelectTrigger id="edit-difficulty" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">ง่าย</SelectItem>
                  <SelectItem value="medium">ปานกลาง</SelectItem>
                  <SelectItem value="hard">ยาก</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tags Section - Admin Only */}
            {adminId && (
              <div>
                <Label htmlFor="edit-tags">🏷️ Tags (เฉพาะ Admin)</Label>
                <div className="mt-2">
                  <TagInput
                    value={editForm.tags}
                    onChange={(newTags) => setEditForm({ ...editForm, tags: newTags })}
                    suggestions={availableTags}
                    placeholder="เพิ่ม tags..."
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  เพิ่มหรือแก้ไข tags เพื่อจัดหมวดหมู่ข้อสอบ
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              ยกเลิก
            </Button>
            <Button onClick={handleSaveEdit}>
              บันทึกการแก้ไข
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Single Question Tags Edit Dialog */}
      <Dialog open={!!editingTagsQuestion} onOpenChange={() => {
        setEditingTagsQuestion(null);
        setSingleQuestionTags([]);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>แก้ไข Tags</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">
                📝 ข้อสอบที่กำลังแก้ไข:
              </p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {editingTagsQuestion?.question_text}
              </p>
            </div>

            <div>
              <Label htmlFor="single-question-tags">Tags</Label>
              <div className="mt-2">
                <TagInput
                  value={singleQuestionTags}
                  onChange={setSingleQuestionTags}
                  placeholder="พิมพ์ tag และกด Enter (เช่น ข้อสอบ NT, แนว O-NET)"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                💡 พิมพ์ชื่อ tag และกด Enter เพื่อเพิ่ม หรือคลิกปุ่ม X เพื่อลบ tag
              </p>
            </div>

            {singleQuestionTags.length > 0 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-2">
                  ✨ Tags ปัจจุบัน:
                </p>
                <div className="flex flex-wrap gap-2">
                  {singleQuestionTags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEditingTagsQuestion(null);
              setSingleQuestionTags([]);
            }}>
              ยกเลิก
            </Button>
            <Button onClick={handleSaveSingleTags}>
              บันทึกการเปลี่ยนแปลง
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl h-[90vh] p-0 bg-black/95">
          <div className="relative h-full flex items-center justify-center">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Navigation Buttons */}
            {lightboxImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 z-50 text-white hover:bg-white/20"
                  onClick={prevImage}
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 z-50 text-white hover:bg-white/20"
                  onClick={nextImage}
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}

            {/* Image */}
            <img
              src={lightboxImages[currentImageIndex]}
              alt={`Image ${currentImageIndex + 1}`}
              className="max-h-full max-w-full object-contain"
            />

            {/* Image Counter */}
            {lightboxImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                {currentImageIndex + 1} / {lightboxImages.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}