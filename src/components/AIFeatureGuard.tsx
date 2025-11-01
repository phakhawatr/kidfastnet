import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AIFeatureGuardProps {
  children: ReactNode;
  isEnabled: boolean;
  remainingQuota?: number;
  featureName: string;
}

export const AIFeatureGuard = ({ 
  children, 
  isEnabled, 
  remainingQuota = 0,
  featureName 
}: AIFeatureGuardProps) => {
  if (!isEnabled) {
    return (
      <Card className="p-8 text-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
        <Lock className="w-16 h-16 mx-auto mb-4 text-purple-400" />
        <h3 className="text-xl font-bold mb-2">
          🎓 ฟีเจอร์ {featureName} (Premium)
        </h3>
        <p className="text-muted-foreground mb-4">
          อัพเกรดเป็น Premium เพื่อใช้งาน AI Learning Assistant
        </p>
        <Link to="/profile?tab=subscription">
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            <Sparkles className="w-4 h-4 mr-2" />
            อัพเกรด Premium
          </Button>
        </Link>
      </Card>
    );
  }

  if (remainingQuota <= 0) {
    return (
      <Card className="p-8 text-center bg-orange-50 dark:bg-orange-950/20">
        <div className="text-4xl mb-4">⏱️</div>
        <h3 className="text-xl font-bold mb-2">
          ใช้งาน AI ครบโควต้าแล้ว
        </h3>
        <p className="text-muted-foreground mb-4">
          คุณใช้งาน AI ครบโควต้าในเดือนนี้แล้ว
          <br />
          โควต้าจะรีเซ็ตในวันที่ 1 ของเดือนหน้า
        </p>
      </Card>
    );
  }

  return <>{children}</>;
};
