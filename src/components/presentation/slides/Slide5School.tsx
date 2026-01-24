import React from 'react';
import { useTranslation } from 'react-i18next';
import SlideContainer from '../SlideContainer';
import { School, Building2, Database, FileText, BarChart3 } from 'lucide-react';

const Slide5School: React.FC = () => {
  const { t } = useTranslation('presentation');

  const features = [
    { 
      icon: Building2, 
      title: t('school.multiTenant'), 
      desc: t('school.multiTenantDesc'),
      color: 'bg-blue-500'
    },
    { 
      icon: Database, 
      title: t('school.questionBank'), 
      desc: t('school.questionBankDesc'),
      color: 'bg-purple-500'
    },
    { 
      icon: FileText, 
      title: t('school.lessonPlanner'), 
      desc: t('school.lessonPlannerDesc'),
      color: 'bg-emerald-500'
    },
    { 
      icon: BarChart3, 
      title: t('school.analytics'), 
      desc: t('school.analyticsDesc'),
      color: 'bg-amber-500'
    },
  ];

  return (
    <SlideContainer slideNumber={5}>
      <div className="flex items-center gap-3 mb-6">
        <School className="w-10 h-10 text-blue-600" />
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
          {t('school.title')}
        </h2>
      </div>
      
      <div className="flex-1 grid grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="bg-white border-2 border-gray-100 rounded-2xl p-5 hover:border-blue-200 hover:shadow-md transition-all"
          >
            <div className={`${feature.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-600">{feature.desc}</p>
          </div>
        ))}
      </div>
      
      {/* Role hierarchy diagram */}
      <div className="mt-4 bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium">Platform Admin</span>
          <span>→</span>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">School Admin</span>
          <span>→</span>
          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium">Teacher</span>
          <span>→</span>
          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">Student</span>
        </div>
      </div>
    </SlideContainer>
  );
};

export default Slide5School;
