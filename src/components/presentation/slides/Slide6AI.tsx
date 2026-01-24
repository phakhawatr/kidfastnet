import React from 'react';
import { useTranslation } from 'react-i18next';
import SlideContainer from '../SlideContainer';
import { Brain, Zap, Code, TrendingUp, Rocket, Mic, Eye, Box } from 'lucide-react';

const Slide6AI: React.FC = () => {
  const { t } = useTranslation('presentation');

  const currentFeatures = [
    { 
      icon: Zap, 
      title: t('ai.groq'), 
      desc: t('ai.groqDesc'),
      color: 'text-amber-500'
    },
    { 
      icon: Code, 
      title: t('ai.edgeFunctions'), 
      desc: t('ai.edgeFunctionsDesc'),
      color: 'text-blue-500'
    },
    { 
      icon: TrendingUp, 
      title: t('ai.adaptive'), 
      desc: t('ai.adaptiveDesc'),
      color: 'text-emerald-500'
    },
  ];

  const futureFeatures = [
    { icon: Eye, label: 'OCR' },
    { icon: Mic, label: 'Voice' },
    { icon: Box, label: '3D Avatar' },
  ];

  return (
    <SlideContainer slideNumber={6}>
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-10 h-10 text-purple-600" />
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
          {t('ai.title')}
        </h2>
      </div>
      
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
        {currentFeatures.map((feature, index) => (
          <div 
            key={index}
            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 border border-gray-200"
          >
            <feature.icon className={`w-10 h-10 ${feature.color} mb-3`} />
            <h3 className="text-lg font-bold text-gray-800 mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-600">{feature.desc}</p>
          </div>
        ))}
      </div>
      
      {/* Edge Functions list */}
      <div className="mt-4 bg-gray-900 text-green-400 rounded-xl p-4 font-mono text-sm">
        <div className="grid grid-cols-3 gap-2">
          <span>📦 generate-daily-mission</span>
          <span>📦 ai-math-tutor</span>
          <span>📦 ai-generate-questions</span>
          <span>📦 generate-learning-path</span>
          <span>📦 generate-word-problems</span>
          <span>📦 ai-lesson-planner</span>
        </div>
      </div>
      
      {/* Future */}
      <div className="mt-4 bg-purple-50 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <Rocket className="w-5 h-5 text-purple-600" />
          <span className="font-semibold text-purple-700">{t('ai.future')}: {t('ai.futureDesc')}</span>
        </div>
        <div className="flex gap-4 justify-center">
          {futureFeatures.map((item, i) => (
            <div key={i} className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <item.icon className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </SlideContainer>
  );
};

export default Slide6AI;
