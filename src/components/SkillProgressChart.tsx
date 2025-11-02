import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SkillAssessment } from '@/hooks/useLearningPath';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SkillProgressChartProps {
  assessments: SkillAssessment[];
}

export const SkillProgressChart = ({ assessments }: SkillProgressChartProps) => {
  if (!assessments || assessments.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">📊 ความก้าวหน้าของทักษะ</h3>
        <p className="text-muted-foreground text-center py-8">
          ยังไม่มีข้อมูลการฝึกฝน<br />
          เริ่มฝึกฝนเพื่อดูความก้าวหน้าของคุณ
        </p>
      </Card>
    );
  }

  const getSkillIcon = (skillName: string) => {
    const icons: Record<string, string> = {
      'บวก': '➕',
      'ลบ': '➖',
      'คูณ': '✖️',
      'หาร': '➗',
      'เศษส่วน': '🍕',
      'ทศนิยม': '🔢',
      'เรขาคณิต': '📐',
      'วัดขนาด': '📏',
      'เวลา': '⏰',
      'กราฟ': '📊',
    };
    
    for (const [key, icon] of Object.entries(icons)) {
      if (skillName.includes(key)) return icon;
    }
    return '🎯';
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 85) return 'text-green-600 dark:text-green-400';
    if (accuracy >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getProgressColor = (accuracy: number) => {
    if (accuracy >= 85) return 'bg-green-500';
    if (accuracy >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTrendIcon = (accuracy: number) => {
    if (accuracy >= 85) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (accuracy >= 70) return <Minus className="w-4 h-4 text-yellow-600" />;
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">📊 ความก้าวหน้าของทักษะ</h3>
      
      <div className="space-y-4">
        {assessments.map((assessment) => (
          <div key={assessment.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getSkillIcon(assessment.skill_name)}</span>
                <div>
                  <p className="font-medium">{assessment.skill_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {assessment.total_attempts} ครั้ง | 
                    {assessment.average_time ? ` ${Math.round(assessment.average_time)}วินาที` : ' N/A'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {getTrendIcon(assessment.accuracy_rate)}
                <span className={`text-lg font-bold ${getAccuracyColor(assessment.accuracy_rate)}`}>
                  {Math.round(assessment.accuracy_rate)}%
                </span>
              </div>
            </div>
            
            <div className="relative">
              <Progress 
                value={assessment.accuracy_rate} 
                className="h-2"
              />
              <div 
                className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor(assessment.accuracy_rate)}`}
                style={{ width: `${assessment.accuracy_rate}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
