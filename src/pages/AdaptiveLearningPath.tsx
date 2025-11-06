import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLearningPath } from '@/hooks/useLearningPath';
import { SkillProgressChart } from '@/components/SkillProgressChart';
import { LearningPathCard } from '@/components/LearningPathCard';
import { AIRecommendationsList } from '@/components/AIRecommendationsList';
import { AIFeatureGuard } from '@/components/AIFeatureGuard';
import { ArrowLeft, Sparkles, Brain, TrendingUp, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTranslation } from 'react-i18next';

export default function AdaptiveLearningPath() {
  const { t } = useTranslation('ai');
  const navigate = useNavigate();
  const { profile } = useAuth();
  const {
    isLoading,
    skillAssessments,
    learningPaths,
    recommendations,
    isGenerating,
    generateLearningPath,
    completeRecommendation,
    updatePathProgress,
  } = useLearningPath();

  const activePath = learningPaths.find(p => p.status === 'active');
  
  // Get AI features status - with fallback for localStorage auth
  const aiEnabled = profile?.ai_features_enabled || false;
  const remainingQuota = profile ? (profile.ai_monthly_quota - profile.ai_usage_count) : 0;
  
  console.log('[AdaptiveLearningPath] AI Enabled:', aiEnabled, 'Profile:', profile, 'Remaining Quota:', remainingQuota);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/landing')}
                variant="outline"
                size="icon"
                className="rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {t('adaptivePath.title')}
                </h1>
                <p className="text-muted-foreground">
                  {t('adaptivePath.subtitle')}
                </p>
              </div>
            </div>

            {aiEnabled && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{t('adaptivePath.aiQuota')}</p>
                <p className="text-2xl font-bold text-purple-600">
                  {remainingQuota}
                </p>
              </div>
            )}
          </div>

          <AIFeatureGuard
            isEnabled={aiEnabled}
            remainingQuota={remainingQuota}
            featureName={t('adaptivePath.title')}
          >
            {isLoading ? (
              <Card className="p-12">
                <div className="flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
                  <p className="text-muted-foreground">{t('adaptivePath.loading')}</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Generate Button */}
                {!activePath && skillAssessments.length > 0 && (
                  <Card className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold mb-2">
                          {t('adaptivePath.generateTitle')}
                        </h3>
                        <p className="text-white/90">
                          {t('adaptivePath.generateDesc')}
                        </p>
                      </div>
                      <Button
                        onClick={generateLearningPath}
                        disabled={isGenerating}
                        size="lg"
                        className="bg-white text-purple-600 hover:bg-white/90 font-bold"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            {t('adaptivePath.generating')}
                          </>
                        ) : (
                          <>
                            <Brain className="w-5 h-5 mr-2" />
                            {t('adaptivePath.generateButton')}
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                )}

                {/* No Data Message */}
                {skillAssessments.length === 0 && (
                  <Card className="p-12">
                    <div className="text-center space-y-4">
                      <div className="text-6xl">🎯</div>
                      <h3 className="text-2xl font-bold">{t('adaptivePath.noData')}</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        {t('adaptivePath.noDataMessage')}
                      </p>
                      <Button
                        onClick={() => navigate('/landing')}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        <Sparkles className="w-5 h-5 mr-2" />
                        {t('adaptivePath.goToPractice')}
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Active Learning Path */}
                {activePath && (
                  <LearningPathCard
                    path={activePath}
                    onUpdateProgress={updatePathProgress}
                  />
                )}

                {/* Two Column Layout */}
                {skillAssessments.length > 0 && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Skill Progress */}
                    <SkillProgressChart assessments={skillAssessments} />

                    {/* AI Recommendations */}
                    <AIRecommendationsList
                      recommendations={recommendations}
                      onComplete={completeRecommendation}
                    />
                  </div>
                )}

                {/* Past Learning Paths */}
                {learningPaths.length > 1 && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      {t('adaptivePath.history')}
                    </h3>
                    <div className="space-y-3">
                      {learningPaths.slice(1).map((path) => (
                        <div
                          key={path.id}
                          className="p-4 border rounded-lg bg-card"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{path.path_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {path.current_step}/{path.total_steps} {t('adaptivePath.steps')} • 
                                {path.status === 'active' ? ` ${t('adaptivePath.active')}` : ` ${t('adaptivePath.completed')}`}
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(path.created_at).toLocaleDateString('th-TH')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}
          </AIFeatureGuard>
        </div>
      </main>

      <Footer />
    </div>
  );
}
