import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('ai');
  
  if (!isEnabled) {
    return (
      <Card className="p-8 text-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
        <Lock className="w-16 h-16 mx-auto mb-4 text-purple-400" />
        <h3 className="text-xl font-bold mb-2">
          {t('featureGuard.premiumTitle', { featureName })}
        </h3>
        <p className="text-muted-foreground mb-4">
          {t('featureGuard.upgradeMessage')}
        </p>
        <Link to="/profile?tab=subscription">
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            <Sparkles className="w-4 h-4 mr-2" />
            {t('featureGuard.upgradeButton')}
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
          {t('featureGuard.quotaExhausted')}
        </h3>
        <p className="text-muted-foreground mb-4">
          {t('featureGuard.quotaMessage')}
        </p>
      </Card>
    );
  }

  return <>{children}</>;
};
