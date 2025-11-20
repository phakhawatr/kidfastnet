import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowRight, Atom, Beaker, Cpu, Hammer, Calculator, FlaskConical, TrendingUp } from 'lucide-react';

const STEMHub = () => {
  const { t } = useTranslation('stem');
  const navigate = useNavigate();

  const stemCategories = [
    {
      id: 'science',
      icon: Beaker,
      color: 'from-green-500 to-emerald-600',
      emoji: '🔬',
    },
    {
      id: 'technology',
      icon: Cpu,
      color: 'from-blue-500 to-cyan-600',
      emoji: '💻',
    },
    {
      id: 'engineering',
      icon: Hammer,
      color: 'from-orange-500 to-amber-600',
      emoji: '🏗️',
    },
    {
      id: 'mathematics',
      icon: Calculator,
      color: 'from-purple-500 to-pink-600',
      emoji: '🔢',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-green-500">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
            <Atom className="w-8 h-8 text-yellow-300 animate-spin-slow" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              {t('title')}
            </h1>
          </div>
          <p className="text-xl text-white/90 mb-4">{t('subtitle')}</p>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            {t('hero.description')}
          </p>
        </div>

        {/* STEM Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stemCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Card
                key={category.id}
                className="group hover:scale-105 transition-all duration-300 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 cursor-pointer"
              >
                <CardHeader>
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-center text-white flex items-center justify-center gap-2">
                    <span>{category.emoji}</span>
                    <span>{t(`categories.${category.id}.title`)}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-white/80 text-sm mb-4">
                    {t(`categories.${category.id}.description`)}
                  </p>
                  <div className="bg-white/10 rounded-lg p-3 mb-4">
                    <p className="text-xs text-white/70">
                      {t(`categories.${category.id}.topics`)}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full bg-white/20 text-white border-white/30 hover:bg-white/30"
                  >
                    {t('buttons.explore')}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Access */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-12">
          <CardHeader>
            <CardTitle className="text-center text-white text-2xl">
              {t('quickAccess.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/word-problems">
                <Card className="group h-full bg-gradient-to-br from-green-500 via-blue-500 to-purple-500 border-0 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl cursor-pointer">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                    <div className="text-5xl group-hover:scale-110 transition-transform">🔬</div>
                    <div>
                      <h3 className="font-bold text-white text-lg mb-1">{t('quickAccess.stem.title')}</h3>
                      <p className="text-white/90 text-xs leading-relaxed">{t('quickAccess.stem.desc')}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/coding-basics">
                <Card className="group h-full bg-gradient-to-br from-indigo-500 to-purple-500 border-0 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl cursor-pointer">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                    <div className="text-5xl group-hover:scale-110 transition-transform">💻</div>
                    <div>
                      <h3 className="font-bold text-white text-lg mb-1">{t('quickAccess.code.title')}</h3>
                      <p className="text-white/90 text-xs leading-relaxed">{t('quickAccess.code.desc')}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/science-lab">
                <Card className="group h-full bg-gradient-to-br from-teal-500 to-green-500 border-0 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl cursor-pointer">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                    <div className="text-5xl group-hover:scale-110 transition-transform">🧪</div>
                    <div>
                      <h3 className="font-bold text-white text-lg mb-1">{t('quickAccess.lab.title')}</h3>
                      <p className="text-white/90 text-xs leading-relaxed">{t('quickAccess.lab.desc')}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/engineering-challenges">
                <Card className="group h-full bg-gradient-to-br from-orange-500 to-red-500 border-0 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl cursor-pointer">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                    <div className="text-5xl group-hover:scale-110 transition-transform">🏗️</div>
                    <div>
                      <h3 className="font-bold text-white text-lg mb-1">{t('quickAccess.build.title')}</h3>
                      <p className="text-white/90 text-xs leading-relaxed">{t('quickAccess.build.desc')}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/physics-lab">
                <Card className="group h-full bg-gradient-to-br from-violet-500 to-purple-500 border-0 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl cursor-pointer">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                    <div className="text-5xl group-hover:scale-110 transition-transform">⚡</div>
                    <div>
                      <h3 className="font-bold text-white text-lg mb-1">{t('quickAccess.physics.title')}</h3>
                      <p className="text-white/90 text-xs leading-relaxed">{t('quickAccess.physics.desc')}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/chemistry-lab">
                <Card className="group h-full bg-gradient-to-br from-purple-500 to-pink-500 border-0 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl cursor-pointer">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                    <div className="text-5xl group-hover:scale-110 transition-transform">🧬</div>
                    <div>
                      <h3 className="font-bold text-white text-lg mb-1">{t('quickAccess.chemistry.title')}</h3>
                      <p className="text-white/90 text-xs leading-relaxed">{t('quickAccess.chemistry.desc')}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/biology-lab">
                <Card className="group h-full bg-gradient-to-br from-emerald-500 to-teal-500 border-0 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl cursor-pointer">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                    <div className="text-5xl group-hover:scale-110 transition-transform">🦠</div>
                    <div>
                      <h3 className="font-bold text-white text-lg mb-1">{t('quickAccess.biology.title')}</h3>
                      <p className="text-white/90 text-xs leading-relaxed">{t('quickAccess.biology.desc')}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/astronomy-lab">
                <Card className="group h-full bg-gradient-to-br from-indigo-600 to-purple-600 border-0 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl cursor-pointer">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                    <div className="text-5xl group-hover:scale-110 transition-transform">🌌</div>
                    <div>
                      <h3 className="font-bold text-white text-lg mb-1">{t('quickAccess.astronomy.title')}</h3>
                      <p className="text-white/90 text-xs leading-relaxed">{t('quickAccess.astronomy.desc')}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              {/* Hidden: AI Tutor and Learning Path cards */}
            </div>
          </CardContent>
        </Card>

        {/* STEM Achievements */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-center text-white text-2xl">
              {t('achievements.title')}
            </CardTitle>
            <p className="text-center text-white/70 text-sm">
              {t('achievements.subtitle')}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 rounded-lg p-4 text-center hover:bg-white/20 transition-all">
                <div className="text-4xl mb-2">🔬</div>
                <p className="text-white text-sm font-medium">
                  {t('achievements.youngScientist')}
                </p>
              </div>
              
              <div className="bg-white/10 rounded-lg p-4 text-center hover:bg-white/20 transition-all">
                <div className="text-4xl mb-2">💻</div>
                <p className="text-white text-sm font-medium">
                  {t('achievements.techWizard')}
                </p>
              </div>
              
              <div className="bg-white/10 rounded-lg p-4 text-center hover:bg-white/20 transition-all">
                <div className="text-4xl mb-2">🏗️</div>
                <p className="text-white text-sm font-medium">
                  {t('achievements.masterBuilder')}
                </p>
              </div>
              
              <div className="bg-white/10 rounded-lg p-4 text-center hover:bg-white/20 transition-all">
                <div className="text-4xl mb-2">🏆</div>
                <p className="text-white text-sm font-medium">
                  {t('achievements.stemChampion')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default STEMHub;
