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

        {/* Special Promotion Section */}
        <section className="mb-12">
          <div className="relative card-glass p-8 md:p-12 overflow-hidden border-4 border-yellow-400 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02]">
            {/* Animated background elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-4 left-8 text-6xl animate-bounce">🎉</div>
              <div className="absolute top-8 right-12 text-5xl animate-bounce" style={{ animationDelay: '0.2s' }}>⭐</div>
              <div className="absolute bottom-8 left-16 text-4xl animate-bounce" style={{ animationDelay: '0.4s' }}>🎈</div>
              <div className="absolute bottom-12 right-8 text-5xl animate-bounce" style={{ animationDelay: '0.6s' }}>🌟</div>
            </div>

            <div className="relative z-10 text-center">
              {/* Badge */}
              <div className="inline-block mb-6">
                <span className="bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 text-white px-8 py-3 rounded-full text-xl md:text-2xl font-black shadow-xl animate-pulse-slow">
                  {t('promotion.badge')}
                </span>
              </div>

              {/* Main heading */}
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent drop-shadow-lg">
                {t('promotion.title')}
              </h2>

              {/* Price section */}
              <div className="mb-6">
                <div className="flex items-center justify-center gap-4 mb-4 flex-wrap">
                  <span className="text-2xl md:text-3xl text-gray-500">{t('promotion.originalPriceLabel')}</span>
                  <span className="relative text-3xl md:text-4xl font-bold text-gray-400">
                    <span className="line-through">{t('promotion.originalPrice')}</span>
                    <span className="absolute -top-2 -right-8 text-red-500 text-2xl rotate-12">❌</span>
                  </span>
                </div>

                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="text-2xl md:text-3xl font-bold text-[hsl(var(--text-primary))]">{t('promotion.discountLabel')}</span>
                </div>

                <div className="inline-block bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 p-1 rounded-3xl shadow-2xl mb-4 animate-pulse-slow">
                  <div className="bg-white rounded-3xl px-12 py-6">
                    <span className="text-6xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 bg-clip-text text-transparent drop-shadow-xl">
                      {t('promotion.specialPrice')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl md:text-4xl font-black text-green-600 animate-bounce">{t('promotion.onlyText')}</span>
                  <span className="text-5xl">🎯</span>
                </div>
              </div>

              {/* Supporting text */}
              <div className="max-w-2xl mx-auto mb-8">
                <p 
                  className="text-xl md:text-2xl font-bold text-[hsl(var(--text-primary))] bg-gradient-to-r from-blue-100 to-purple-100 px-8 py-4 rounded-full shadow-lg border-2 border-blue-300"
                  dangerouslySetInnerHTML={{ __html: t('promotion.supportText') }}
                />
              </div>

              {/* CTA Button */}
              <Link 
                to="/signup" 
                className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 hover:from-green-300 hover:to-teal-400 text-white font-black text-2xl md:text-3xl px-12 py-6 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 animate-pulse-slow"
              >
                <span className="text-4xl">🎉</span>
                <span>{t('promotion.ctaButton')}</span>
                <span className="text-4xl">🎉</span>
              </Link>

              {/* Countdown or urgency text */}
              <p 
                className="text-lg md:text-xl font-bold text-red-600 mt-6 animate-pulse"
                dangerouslySetInnerHTML={{ __html: t('promotion.urgencyText') }}
              />
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