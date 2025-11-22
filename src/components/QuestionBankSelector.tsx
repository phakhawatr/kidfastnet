import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Check } from 'lucide-react';
import { useQuestionBank } from '@/hooks/useQuestionBank';

interface QuestionBankSelectorProps {
  teacherId: string;
  grade: number;
  selectedQuestions: string[];
  onSelect: (questionIds: string[]) => void;
  maxSelection?: number;
}

export default function QuestionBankSelector({
  teacherId,
  grade,
  selectedQuestions,
  onSelect,
  maxSelection
}: QuestionBankSelectorProps) {
  const { questions, topics, fetchQuestions, fetchTopicsByGrade } = useQuestionBank(teacherId);
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');

  useEffect(() => {
    fetchTopicsByGrade(grade);
    fetchQuestions({ grade });
  }, [grade]);

  useEffect(() => {
    fetchQuestions({
      grade,
      topic: topicFilter || undefined,
      difficulty: difficultyFilter || undefined,
      search: search || undefined,
    });
  }, [topicFilter, difficultyFilter, search]);

  const toggleQuestion = (id: string) => {
    if (selectedQuestions.includes(id)) {
      onSelect(selectedQuestions.filter(qId => qId !== id));
    } else {
      if (maxSelection && selectedQuestions.length >= maxSelection) {
        return;
      }
      onSelect([...selectedQuestions, id]);
    }
  };

  const toggleAll = () => {
    if (selectedQuestions.length === questions.length) {
      onSelect([]);
    } else {
      const limit = maxSelection || questions.length;
      onSelect(questions.slice(0, limit).map(q => q.id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาโจทย์..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={topicFilter} onValueChange={setTopicFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="หัวข้อทั้งหมด" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">ทั้งหมด</SelectItem>
            {topics.map((topic) => (
              <SelectItem key={topic.id} value={topic.topic_name_th}>
                {topic.topic_name_th}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="ความยาก" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">ทั้งหมด</SelectItem>
            <SelectItem value="easy">ง่าย</SelectItem>
            <SelectItem value="medium">ปานกลาง</SelectItem>
            <SelectItem value="hard">ยาก</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedQuestions.length === questions.length && questions.length > 0}
            onCheckedChange={toggleAll}
          />
          <span className="text-sm font-medium">
            เลือกทั้งหมด ({selectedQuestions.length}/{maxSelection || questions.length})
          </span>
        </div>
        
        {maxSelection && selectedQuestions.length >= maxSelection && (
          <Badge variant="secondary">เลือกครบจำนวนแล้ว</Badge>
        )}
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {questions.map((question) => (
          <Card
            key={question.id}
            className={`p-4 cursor-pointer transition-colors ${
              selectedQuestions.includes(question.id)
                ? 'border-primary bg-primary/5'
                : 'hover:bg-muted/50'
            }`}
            onClick={() => toggleQuestion(question.id)}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <Checkbox
                  checked={selectedQuestions.includes(question.id)}
                  onCheckedChange={() => toggleQuestion(question.id)}
                />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={
                    question.difficulty === 'easy' ? 'default' :
                    question.difficulty === 'medium' ? 'secondary' : 'destructive'
                  } className="text-xs">
                    {question.difficulty === 'easy' ? 'ง่าย' :
                     question.difficulty === 'medium' ? 'ปานกลาง' : 'ยาก'}
                  </Badge>
                  
                  {question.topic && (
                    <Badge variant="outline" className="text-xs">
                      {question.topic}
                    </Badge>
                  )}

                  {question.ai_generated && (
                    <Badge variant="outline" className="text-xs">
                      AI
                    </Badge>
                  )}

                  {selectedQuestions.includes(question.id) && (
                    <Check className="w-4 h-4 text-primary ml-auto" />
                  )}
                </div>

                <p className="font-medium">{question.question_text}</p>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  {question.choices.map((choice: string, idx: number) => (
                    <div
                      key={idx}
                      className={`p-3 rounded border ${
                        choice === question.correct_answer
                          ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                          : 'border-border'
                      }`}
                    >
                      <span className="text-sm font-light text-gray-500 dark:text-gray-400">{idx + 1})</span>
                      <span className="text-lg font-semibold text-blue-600 dark:text-blue-400 ml-2">{choice}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}

        {questions.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>ไม่พบโจทย์ที่ตรงกับเงื่อนไข</p>
          </div>
        )}
      </div>
    </div>
  );
}
