import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AIRecommendation } from '@/hooks/useLearningPath';
import { Sparkles, ChevronRight, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AIRecommendationsListProps {
  recommendations: AIRecommendation[];
  onComplete?: (id: string) => void;
}

const skillRoutes: Record<string, string> = {
  'บวก': '/addition',
  'ลบ': '/subtraction',
  'คูณ': '/multiplication',
  'หาร': '/division',
  'เศษส่วน': '/fraction-matching',
  'เวลา': '/time',
  'วัดขนาด': '/measurement',
  'ชั่ง': '/weighing',
  'รูปร่าง': '/shape-matching',
  'bar model': '/bar-model',
  'number bonds': '/number-bonds',
};

const findSkillRoute = (skillName: string): string => {
  const lowerSkill = skillName.toLowerCase();
  for (const [key, route] of Object.entries(skillRoutes)) {
    if (lowerSkill.includes(key.toLowerCase())) {
      return route;
    }
  }
  return '/';
};

export const AIRecommendationsList = ({ 
  recommendations, 
  onComplete 
}: AIRecommendationsListProps) => {
  if (!recommendations || recommendations.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">💡 คำแนะนำจาก AI</h3>
        </div>
        <p className="text-muted-foreground text-center py-8">
          สร้าง Learning Path เพื่อรับคำแนะนำ
        </p>
      </Card>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'ง่าย';
      case 'medium': return 'ปานกลาง';
      case 'hard': return 'ยาก';
      default: return difficulty;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold">💡 คำแนะนำจาก AI</h3>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, index) => {
          const skillRoute = findSkillRoute(rec.skill_name);
          
          return (
            <Card 
              key={rec.id}
              className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-purple-600">
                      #{rec.priority}
                    </span>
                    <h4 className="font-semibold">{rec.skill_name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(rec.suggested_difficulty)}`}>
                      {getDifficultyText(rec.suggested_difficulty)}
                    </span>
                  </div>
                  
                  <div className="flex items-start gap-2 text-sm text-muted-foreground mb-3">
                    <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p>{rec.reasoning}</p>
                  </div>

                  <div className="flex gap-2">
                    <Link to={skillRoute} className="flex-1">
                      <Button 
                        size="sm" 
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        เริ่มฝึก
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                    
                    {onComplete && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onComplete(rec.id)}
                      >
                        เสร็จแล้ว
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </Card>
  );
};
