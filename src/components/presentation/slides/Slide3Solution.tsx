import React from 'react';
import { useTranslation } from 'react-i18next';
import SlideContainer from '../SlideContainer';
import { Brain, Calculator, Users, Sparkles, Globe } from 'lucide-react';

const Slide3Solution: React.FC = () => {
  const { t } = useTranslation('presentation');

  const features = [
    { 
      icon: Calculator, 
      title: t('solution.apps'), 
      desc: t('solution.appsDesc'),
      color: 'bg-blue-500'
    },
    { 
      icon: Users, 
      title: t('solution.roles'), 
      desc: t('solution.rolesDesc'),
      color: 'bg-purple-500'
    },
    { 
      icon: Sparkles, 
      title: t('solution.aiFeatures'), 
      desc: t('solution.aiFeaturesDesc'),
      color: 'bg-amber-500'
    },
    { 
      icon: Globe, 
      title: t('solution.languages'), 
      desc: t('solution.languagesDesc'),
      color: 'bg-teal-500'
    },
  ];

  return (
    <SlideContainer slideNumber={3}>
      <div className="flex items-center gap-3 mb-4">
        <Brain className="w-10 h-10 text-emerald-600" />
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
          {t('solution.title')}
        </h2>
      </div>
      
      <p className="text-lg text-gray-600 mb-8">
        {t('solution.description')}
      </p>
      
      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="bg-gray-50 rounded-2xl p-5 flex flex-col items-center text-center hover:shadow-lg transition-shadow"
          >
            <div className={`${feature.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4`}>
              <feature.icon className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-600">{feature.desc}</p>
          </div>
        ))}
      </div>
      
      {/* Platform Preview Mockup */}
      <div className="mt-6 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl p-4 flex items-center justify-center gap-4">
        <div className="flex gap-2">
          {['🧮', '📐', '🔢', '⏰', '💰', '📊'].map((emoji, i) => (
            <span key={i} className="text-2xl bg-white rounded-lg p-2 shadow-sm">
              {emoji}
            </span>
          ))}
        </div>
        <span className="text-gray-500">... และอีกมากมาย</span>
      </div>
    </SlideContainer>
  );
};

export default Slide3Solution;
