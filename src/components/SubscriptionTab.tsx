import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PlanCard } from './PlanCard';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Calendar, Zap, TrendingUp } from 'lucide-react';

export const SubscriptionTab = () => {
  const { user, profile } = useAuth();

  // Fetch subscription plans
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_6_months', { ascending: true });
      
      if (error) throw error;
      
      // Transform data to include proper types
      return data?.map(plan => ({
        ...plan,
        features: plan.features as { features: string[] }
      }));
    },
  });

  // Fetch AI usage stats
  const { data: usageStats } = useQuery({
    queryKey: ['ai-usage-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('ai_usage_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  if (plansLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isPremium = profile?.subscription_tier === 'premium';
  const usagePercentage = profile?.ai_monthly_quota 
    ? ((profile.ai_usage_count || 0) / profile.ai_monthly_quota) * 100 
    : 0;
  const remainingQuota = (profile?.ai_monthly_quota || 0) - (profile?.ai_usage_count || 0);

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>แพ็กเกจปัจจุบัน</span>
            <Badge 
              variant={isPremium ? 'default' : 'secondary'}
              className={isPremium ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}
            >
              {isPremium ? '🌟 Premium' : '📦 Basic'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Subscription Status */}
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Calendar className="w-8 h-8 text-primary" />
              <div>
                <div className="text-sm text-muted-foreground">สถานะ</div>
                <div className="font-semibold">
                  {isPremium ? 'เปิดใช้งาน' : 'แพ็กเกจ Basic'}
                </div>
              </div>
            </div>

            {/* AI Quota */}
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Zap className="w-8 h-8 text-purple-500" />
              <div>
                <div className="text-sm text-muted-foreground">AI Quota</div>
                <div className="font-semibold">
                  {isPremium ? `${remainingQuota} / ${profile?.ai_monthly_quota}` : 'ไม่มี'}
                </div>
              </div>
            </div>

            {/* Usage This Month */}
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div>
                <div className="text-sm text-muted-foreground">ใช้งานแล้ว</div>
                <div className="font-semibold">
                  {profile?.ai_usage_count || 0} ครั้ง
                </div>
              </div>
            </div>
          </div>

          {/* AI Usage Progress Bar */}
          {isPremium && (
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">การใช้งาน AI ในเดือนนี้</span>
                <span className="font-medium">{usagePercentage.toFixed(0)}%</span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
              <div className="text-xs text-muted-foreground mt-2">
                รีเซ็ตโควต้าวันที่ {profile?.ai_quota_reset_date 
                  ? new Date(profile.ai_quota_reset_date).toLocaleDateString('th-TH') 
                  : '1 ของเดือนหน้า'}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plans */}
      <div>
        <h3 className="text-xl font-bold mb-4">เลือกแพ็กเกจที่เหมาะกับคุณ</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {plans?.map((plan) => (
            <PlanCard 
              key={plan.id}
              plan={plan}
              currentPlan={profile?.subscription_tier}
              highlighted={plan.plan_name === 'premium'}
            />
          ))}
        </div>
      </div>

      {/* Recent AI Usage */}
      {isPremium && usageStats && usageStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>การใช้งาน AI ล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {usageStats.map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <div className="font-medium">
                      {log.feature_type === 'chatbot' && '💬 AI Math Tutor'}
                      {log.feature_type === 'analytics' && '📊 AI Analytics'}
                      {log.feature_type === 'problem_generation' && '✨ Adaptive Problems'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString('th-TH')}
                    </div>
                  </div>
                  {log.tokens_used && (
                    <Badge variant="outline">
                      {log.tokens_used.toLocaleString()} tokens
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
