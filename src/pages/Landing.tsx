import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SkillsSection from '../components/SkillsSection';
import PremiumFeaturesShowcase from '../components/PremiumFeaturesShowcase';
import exampleAddition from '../assets/example-addition.jpg';
import exampleSubtraction from '../assets/example-subtraction.jpg';
import exampleMultiplication from '../assets/example-multiplication.jpg';
import exampleFractions from '../assets/example-fractions.jpg';
import exampleWeighing from '../assets/example-weighing.jpg';
import exampleMeasurement from '../assets/example-measurement.jpg';

const Landing = () => {
  const { t } = useTranslation('landing');
  
  const benefits = t('benefits.items', { returnObjects: true }) as Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  return <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="card-glass p-8 md:p-12 mb-12 text-center">
          {/* Kidfast AI Logo Text */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-2 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent animate-ai-gradient animate-ai-glow animate-ai-float drop-shadow-2xl tracking-tight">
              ⭐ {t('hero.brandName')} ⭐
            </h1>
          </div>

          <h2 
            className="text-3xl md:text-5xl font-bold mb-6 text-[hsl(var(--text-primary))]"
            dangerouslySetInnerHTML={{ __html: t('hero.title') }}
          />
          <p 
            className="text-lg md:text-xl text-[hsl(var(--text-secondary))] mb-8 max-w-3xl mx-auto"
            dangerouslySetInnerHTML={{ __html: t('hero.subtitle') }}
          />
          
          {/* Emoji Icons */}
          <div className="flex justify-center gap-4 text-4xl mb-8">
            <span className="animate-bounce" style={{
            animationDelay: '0s'
          }}>🎯</span>
            <span className="animate-bounce" style={{
            animationDelay: '0.1s'
          }}>🏆</span>
            <span className="animate-bounce" style={{
            animationDelay: '0.2s'
          }}>🎮</span>
            <span className="animate-bounce" style={{
            animationDelay: '0.3s'
          }}>⭐</span>
            <span className="animate-bounce" style={{
            animationDelay: '0.4s'
          }}>✍️</span>
          </div>

          {/* AI Generate Button */}
          <div className="flex flex-col items-center mb-8">
            <button className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-purple-500 text-white px-12 py-5 rounded-full text-xl font-bold shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 flex items-center gap-3 mb-6">
              <span className="text-3xl">✨</span>
              <span>{t('hero.aiGenerateButton')}</span>
            </button>
            
            <p 
              className="text-xl md:text-2xl font-bold text-[hsl(var(--text-primary))] bg-gradient-to-r from-purple-100 to-pink-100 px-10 py-4 rounded-full shadow-xl"
              dangerouslySetInnerHTML={{ __html: t('hero.aiTagline') }}
            />
          </div>
        </section>

        {/* Skills Section - Show all skills */}
        <SkillsSection
          disableLinks={true}
        />

        {/* Benefits Section */}
        <section className="mb-12">
          <div className="card-glass p-8">
            <div className="text-center mb-8">
              <h2 
                className="text-2xl md:text-3xl font-bold text-[hsl(var(--text-primary))] mb-4"
                dangerouslySetInnerHTML={{ __html: t('benefits.title') }}
              />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => <div key={index} className="text-center p-6 rounded-2xl bg-white/50 hover:bg-white/70 transition-all duration-300 hover:scale-105">
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h3 className="font-bold text-lg mb-3 text-[hsl(var(--text-primary))]">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-[hsl(var(--text-secondary))]">
                    {benefit.description}
                  </p>
                </div>)}
            </div>
          </div>
        </section>

        {/* Premium Features Showcase - New Component */}
        <PremiumFeaturesShowcase />

        {/* AI Examples Section */}
        <section className="mb-12">
          <div className="card-glass p-8">
            <div className="text-center mb-8">
              <h2 
                className="text-2xl md:text-3xl font-bold text-[hsl(var(--text-primary))] mb-4"
                dangerouslySetInnerHTML={{ __html: t('aiExamples.title') }}
              />
              <p 
                className="text-lg text-[hsl(var(--text-secondary))] max-w-3xl mx-auto"
                dangerouslySetInnerHTML={{ __html: t('aiExamples.subtitle') }}
              />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={exampleAddition} 
                    alt={t('aiExamples.examples.0.alt')}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 text-[hsl(var(--text-primary))]">
                    {t('aiExamples.examples.0.icon')} {t('aiExamples.examples.0.title')}
                  </h3>
                  <p className="text-sm text-[hsl(var(--text-secondary))]">
                    {t('aiExamples.examples.0.description')}
                  </p>
                </div>
              </div>

              <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={exampleSubtraction} 
                    alt={t('aiExamples.examples.1.alt')}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 text-[hsl(var(--text-primary))]">
                    {t('aiExamples.examples.1.icon')} {t('aiExamples.examples.1.title')}
                  </h3>
                  <p className="text-sm text-[hsl(var(--text-secondary))]">
                    {t('aiExamples.examples.1.description')}
                  </p>
                </div>
              </div>

              <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={exampleMultiplication} 
                    alt={t('aiExamples.examples.2.alt')}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 text-[hsl(var(--text-primary))]">
                    {t('aiExamples.examples.2.icon')} {t('aiExamples.examples.2.title')}
                  </h3>
                  <p className="text-sm text-[hsl(var(--text-secondary))]">
                    {t('aiExamples.examples.2.description')}
                  </p>
                </div>
              </div>

              <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={exampleFractions} 
                    alt={t('aiExamples.examples.3.alt')}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 text-[hsl(var(--text-primary))]">
                    {t('aiExamples.examples.3.icon')} {t('aiExamples.examples.3.title')}
                  </h3>
                  <p className="text-sm text-[hsl(var(--text-secondary))]">
                    {t('aiExamples.examples.3.description')}
                  </p>
                </div>
              </div>

              <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={exampleWeighing} 
                    alt={t('aiExamples.examples.4.alt')}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 text-[hsl(var(--text-primary))]">
                    {t('aiExamples.examples.4.icon')} {t('aiExamples.examples.4.title')}
                  </h3>
                  <p className="text-sm text-[hsl(var(--text-secondary))]">
                    {t('aiExamples.examples.4.description')}
                  </p>
                </div>
              </div>

              <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={exampleMeasurement} 
                    alt={t('aiExamples.examples.5.alt')}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 text-[hsl(var(--text-primary))]">
                    {t('aiExamples.examples.5.icon')} {t('aiExamples.examples.5.title')}
                  </h3>
                  <p className="text-sm text-[hsl(var(--text-secondary))]">
                    {t('aiExamples.examples.5.description')}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <p 
                className="text-xl md:text-2xl font-bold text-[hsl(var(--text-primary))] bg-gradient-to-r from-yellow-100 to-orange-100 px-12 py-6 rounded-full shadow-2xl inline-block border-2 border-yellow-300 hover:scale-105 transition-transform duration-300"
                dangerouslySetInnerHTML={{ __html: t('aiExamples.cta') }}
              />
            </div>
          </div>
        </section>

        {/* Free Signup Section */}
        <section className="mb-12">
          <div className="relative card-glass p-8 md:p-12 overflow-hidden border-4 border-green-400 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02]">
            {/* Animated background elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-4 left-8 text-6xl animate-bounce">💚</div>
              <div className="absolute top-8 right-12 text-5xl animate-bounce" style={{ animationDelay: '0.2s' }}>⭐</div>
              <div className="absolute bottom-8 left-16 text-4xl animate-bounce" style={{ animationDelay: '0.4s' }}>🎁</div>
              <div className="absolute bottom-12 right-8 text-5xl animate-bounce" style={{ animationDelay: '0.6s' }}>✨</div>
            </div>

            <div className="relative z-10 text-center">
              {/* Badge */}
              <div className="inline-block mb-6">
                <span className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white px-8 py-3 rounded-full text-xl md:text-2xl font-black shadow-xl animate-pulse">
                  {t('freeSignup.badge')}
                </span>
              </div>

              {/* Main heading */}
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-500 bg-clip-text text-transparent drop-shadow-lg">
                {t('freeSignup.title')}
              </h2>

              {/* Message */}
              <div className="max-w-3xl mx-auto mb-6">
                <p className="text-lg md:text-xl text-[hsl(var(--text-primary))] leading-relaxed mb-4">
                  {t('freeSignup.message')}
                </p>
                
                {/* Highlight box */}
                <div className="inline-block bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 px-6 py-4 rounded-2xl border-2 border-green-400 shadow-lg mb-6">
                  <p className="text-xl md:text-2xl font-black text-green-600 dark:text-green-400">
                    💚 {t('freeSignup.highlight')} 💚
                  </p>
                </div>
              </div>

              {/* 4 Apps Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 p-4 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300 border-2 border-blue-300">
                  <div className="text-4xl mb-2">➕</div>
                  <div className="font-bold text-blue-700 dark:text-blue-300">{t('freeSignup.addition')}</div>
                </div>
                <div className="bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40 p-4 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300 border-2 border-orange-300">
                  <div className="text-4xl mb-2">➖</div>
                  <div className="font-bold text-orange-700 dark:text-orange-300">{t('freeSignup.subtraction')}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 p-4 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300 border-2 border-purple-300">
                  <div className="text-4xl mb-2">✖️</div>
                  <div className="font-bold text-purple-700 dark:text-purple-300">{t('freeSignup.multiplication')}</div>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 p-4 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300 border-2 border-green-300">
                  <div className="text-4xl mb-2">➗</div>
                  <div className="font-bold text-green-700 dark:text-green-300">{t('freeSignup.division')}</div>
                </div>
              </div>

              {/* Gmail note */}
              <p className="text-lg md:text-xl font-semibold text-[hsl(var(--text-primary))] mb-6">
                📧 {t('freeSignup.gmailNote')}
              </p>

              {/* CTA Button - Google Sign Up */}
              <Link 
                to="/signup" 
                className="group inline-flex items-center justify-center gap-4 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-400 hover:via-emerald-400 hover:to-teal-400 text-white font-black text-xl md:text-2xl lg:text-3xl px-8 md:px-12 py-5 md:py-6 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 animate-pulse"
              >
                {/* Google Icon */}
                <svg className="w-8 h-8 md:w-10 md:h-10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>{t('freeSignup.ctaButton')}</span>
                <span className="text-3xl group-hover:animate-bounce">🚀</span>
              </Link>

              {/* Sub-text benefits */}
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-6 text-sm md:text-base font-semibold text-green-600 dark:text-green-400">
                <span className="flex items-center gap-1">
                  <span className="text-lg">✓</span> {t('freeSignup.noCost')}
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-lg">✓</span> {t('freeSignup.noCard')}
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-lg">✓</span> {t('freeSignup.useForever')}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="p-8 md:p-12 rounded-2xl border border-white/20 backdrop-blur-sm shadow-[0_8px_30px_hsl(251_100%_69%/0.15)]">
            <Link 
              to="/signup" 
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-white font-medium text-lg md:text-xl px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-pulse-slow drop-shadow-sm"
              dangerouslySetInnerHTML={{ __html: t('finalCta.button') }}
            />
            <p className="text-sm text-[hsl(var(--text-secondary))] mt-4">
              {t('finalCta.subtitle')}
            </p>
          </div>
        </section>
      </main>

      {/* Floating Elements */}
      <div className="fixed top-20 left-4 text-4xl opacity-20 animate-pulse pointer-events-none">⭐</div>
      <div className="fixed top-40 right-8 text-3xl opacity-20 animate-pulse pointer-events-none" style={{
      animationDelay: '1s'
    }}>📚</div>
      <div className="fixed bottom-32 left-8 text-5xl opacity-20 animate-pulse pointer-events-none" style={{
      animationDelay: '2s'
    }}>✏️</div>
      <div className="fixed top-60 left-1/4 text-2xl opacity-20 animate-pulse pointer-events-none" style={{
      animationDelay: '0.5s'
    }}>🎯</div>
      
      <Footer />
    </div>;
};
export default Landing;