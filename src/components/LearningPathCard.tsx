import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LearningPath } from '@/hooks/useLearningPath';
import { CheckCircle2, Clock, Target, TrendingUp } from 'lucide-react';

interface LearningPathCardProps {
  path: LearningPath;
  onUpdateProgress?: (pathId: string, newStep: number) => void;
}

export const LearningPathCard = ({ path, onUpdateProgress }: LearningPathCardProps) => {
  const progressPercentage = (path.current_step / path.total_steps) * 100;
  const isCompleted = path.current_step >= path.total_steps;

  const handleNextStep = () => {
    if (path.current_step < path.total_steps && onUpdateProgress) {
      onUpdateProgress(path.id, path.current_step + 1);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-purple-600" />
            <h3 className="text-xl font-bold">{path.path_name}</h3>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">
            {path.ai_reasoning}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {path.skills_to_focus.map((skill, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-white/60 dark:bg-black/20 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {isCompleted && (
          <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
        )}
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium">
                ขั้นตอน {path.current_step} / {path.total_steps}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>~{path.estimated_duration} นาที</span>
            </div>
          </div>
          
          <Progress value={progressPercentage} className="h-3" />
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">ระดับความยาก:</span>
          <span className="px-3 py-1 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 text-white rounded-full text-xs font-bold">
            {path.difficulty_progression}
          </span>
        </div>

        {!isCompleted && (
          <Button
            onClick={handleNextStep}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {path.current_step === 0 ? 'เริ่มต้น' : 'ขั้นตอนถัดไป'}
          </Button>
        )}

        {isCompleted && (
          <div className="text-center py-2">
            <p className="text-green-600 dark:text-green-400 font-bold">
              🎉 เสร็จสมบูรณ์แล้ว!
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
