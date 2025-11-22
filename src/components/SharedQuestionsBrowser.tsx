import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, Eye, Copy, FileText, Sparkles, Users } from 'lucide-react';
import { useQuestionBank } from '@/hooks/useQuestionBank';

interface SharedQuestionsBrowserProps {
  teacherId: string;
  onImportSuccess?: () => void;
}

export default function SharedQuestionsBrowser({ teacherId, onImportSuccess }: SharedQuestionsBrowserProps) {
  const {
    fetchSharedQuestions,
    fetchSharedTemplates,
    copySharedQuestion,
    copySharedTemplate,
  } = useQuestionBank(teacherId);

  const [sharedQuestions, setSharedQuestions] = useState<any[]>([]);
  const [sharedTemplates, setSharedTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<number | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  useEffect(() => {
    loadSharedContent();
  }, []);

  const loadSharedContent = async () => {
    setLoading(true);
    const [questions, templates] = await Promise.all([
      fetchSharedQuestions(),
      fetchSharedTemplates(),
    ]);
    setSharedQuestions(questions);
    setSharedTemplates(templates);
    setLoading(false);
  };

  const handleCopyQuestion = async (questionId: string, sharedId: string) => {
    await copySharedQuestion(questionId, sharedId);
    onImportSuccess?.();
  };

  const handleCopyTemplate = async (templateId: string, sharedId: string) => {
    await copySharedTemplate(templateId, sharedId);
    onImportSuccess?.();
  };

  const filteredQuestions = sharedQuestions.filter((item) => {
    const question = item.question;
    if (!question) return false;
    if (selectedGrade !== 'all' && question.grade !== selectedGrade) return false;
    if (selectedDifficulty !== 'all' && question.difficulty !== selectedDifficulty) return false;
    if (searchQuery && !question.question_text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredTemplates = sharedTemplates.filter((item) => {
    const template = item.template;
    if (!template) return false;
    if (selectedGrade !== 'all' && template.grade !== selectedGrade) return false;
    if (selectedDifficulty !== 'all' && template.difficulty !== selectedDifficulty) return false;
    if (searchQuery && !template.template_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Users className="w-6 h-6" />
          โจทย์ที่แชร์จากครูท่านอื่น
        </h2>
        <p className="text-muted-foreground">
          ค้นหาและนำเข้าโจทย์หรือแม่แบบที่ครูท่านอื่นแชร์
        </p>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">ชั้นเรียน</label>
            <Select value={selectedGrade.toString()} onValueChange={(v) => setSelectedGrade(v === 'all' ? 'all' : Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                {[1, 2, 3, 4, 5, 6].map((grade) => (
                  <SelectItem key={grade} value={grade.toString()}>
                    ป.{grade}
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
                placeholder="ค้นหา..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="questions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="questions">
            โจทย์ ({filteredQuestions.length})
          </TabsTrigger>
          <TabsTrigger value="templates">
            แม่แบบ ({filteredTemplates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-4 mt-4">
          {loading ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">กำลังโหลด...</p>
            </Card>
          ) : filteredQuestions.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">ไม่พบโจทย์ที่แชร์</p>
            </Card>
          ) : (
            filteredQuestions.map((item) => {
              const question = item.question;
              return (
                <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline">ป.{question.grade}</Badge>
                        <Badge
                          variant={
                            question.difficulty === 'easy'
                              ? 'default'
                              : question.difficulty === 'medium'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {question.difficulty === 'easy' ? 'ง่าย' : question.difficulty === 'medium' ? 'ปานกลาง' : 'ยาก'}
                        </Badge>
                        {question.ai_generated && (
                          <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950">
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-muted-foreground font-medium">
                        แชร์โดยคุณครู {item.shared_by_user?.nickname || 'ไม่ระบุ'}
                      </div>

                      <p className="font-medium">{question.question_text}</p>

                      {question.image_urls && question.image_urls.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {question.image_urls.map((url: string, idx: number) => (
                            <img
                              key={idx}
                              src={url}
                              alt={`Question ${idx + 1}`}
                              className="rounded border max-h-32 object-cover"
                            />
                          ))}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Array.isArray(question.choices) &&
                          question.choices.map((choice: string, idx: number) => (
                            <div
                              key={idx}
                              className={`p-3 rounded border ${
                                choice === question.correct_answer
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-border'
                              }`}
                            >
                              <span className="text-sm font-light text-gray-500 dark:text-gray-400">{idx + 1})</span>
                              <span className="text-lg font-semibold text-blue-600 dark:text-blue-400 ml-2">{choice}</span>
                            </div>
                          ))}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {item.view_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {item.copy_count || 0}
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleCopyQuestion(question.id, item.id)}
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      นำเข้า
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4 mt-4">
          {loading ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">กำลังโหลด...</p>
            </Card>
          ) : filteredTemplates.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">ไม่พบแม่แบบที่แชร์</p>
            </Card>
          ) : (
            filteredTemplates.map((item) => {
              const template = item.template;
              return (
                <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <FileText className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-lg">{template.template_name}</h3>
                        <Badge variant="outline">ป.{template.grade}</Badge>
                        <Badge
                          variant={
                            template.difficulty === 'easy'
                              ? 'default'
                              : template.difficulty === 'medium'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {template.difficulty === 'easy' ? 'ง่าย' : template.difficulty === 'medium' ? 'ปานกลาง' : 'ยาก'}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground font-medium">
                        แชร์โดยคุณครู {item.shared_by_user?.nickname || 'ไม่ระบุ'}
                      </div>

                      <div className="bg-muted p-3 rounded text-sm font-mono">
                        {template.template_text}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {Object.entries(template.variables).map(([key, value]: [string, any]) => (
                          <Badge key={key} variant="outline" className="text-xs">
                            {key}: {value.type} ({value.min}-{value.max})
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {item.view_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {item.copy_count || 0}
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleCopyTemplate(template.id, item.id)}
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      นำเข้า
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
