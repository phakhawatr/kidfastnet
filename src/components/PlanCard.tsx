import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles } from 'lucide-react';

interface PlanCardProps {
  plan: {
    plan_name: string;
    price_monthly: number;
    price_6_months: number;
    ai_features_enabled: boolean;
    ai_monthly_quota: number;
    features: {
      features: string[];
    };
  };
  currentPlan?: string;
  highlighted?: boolean;
}

export const PlanCard = ({ plan, currentPlan, highlighted }: PlanCardProps) => {
  const isPremium = plan.plan_name === 'premium';
  const isCurrent = currentPlan === plan.plan_name;

  return (
    <Card className={`relative ${highlighted ? 'border-2 border-primary shadow-lg' : ''}`}>
      {highlighted && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1">
            <Sparkles className="w-3 h-3 mr-1" />
            แนะนำ
          </Badge>
        </div>
      )}
      
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-2xl">
            {isPremium ? '🌟 Premium' : '📦 Basic'}
          </span>
          {isCurrent && (
            <Badge variant="secondary">แพ็กเกจปัจจุบัน</Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price */}
        <div className="text-center py-4">
          {isPremium ? (
            <>
              <div className="text-4xl font-bold text-primary mb-2">
                ฿{plan.price_6_months}
              </div>
              <div className="text-sm text-muted-foreground">
                สำหรับ 6 เดือน
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                (เพียง ฿{Math.round(plan.price_6_months / 6)}/เดือน)
              </div>
            </>
          ) : (
            <>
              <div className="text-4xl font-bold text-primary mb-2">
                ฿{plan.price_monthly}
              </div>
              <div className="text-sm text-muted-foreground">
                ตลอดชีพ
              </div>
            </>
          )}
        </div>

        {/* AI Quota */}
        {isPremium && (
          <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg text-center">
            <div className="text-sm text-muted-foreground mb-1">AI Learning Assistant</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {plan.ai_monthly_quota} ครั้ง/เดือน
            </div>
          </div>
        )}

        {/* Features */}
        <div className="space-y-2 pt-4">
          {plan.features.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter>
        {isCurrent ? (
          <Button variant="outline" className="w-full" disabled>
            แพ็กเกจปัจจุบัน
          </Button>
        ) : isPremium ? (
          <Button 
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            onClick={() => {
              // TODO: Implement upgrade flow
              alert('ฟีเจอร์การอัพเกรดจะพร้อมใช้งานเร็วๆ นี้');
            }}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            อัพเกรดเป็น Premium
          </Button>
        ) : (
          <Button variant="ghost" className="w-full" disabled>
            แพ็กเกจปัจจุบัน
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
