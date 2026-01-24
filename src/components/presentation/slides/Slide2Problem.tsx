import React from 'react';
import { useTranslation } from 'react-i18next';
import SlideContainer from '../SlideContainer';
import { AlertTriangle, TrendingUp, Users, School, FileCheck } from 'lucide-react';

const Slide2Problem: React.FC = () => {
  const { t } = useTranslation('presentation');

  const challenges = [
    { icon: AlertTriangle, text: t('problem.challenge1'), color: 'text-red-500' },
    { icon: AlertTriangle, text: t('problem.challenge2'), color: 'text-orange-500' },
    { icon: AlertTriangle, text: t('problem.challenge3'), color: 'text-amber-500' },
    { icon: AlertTriangle, text: t('problem.challenge4'), color: 'text-yellow-500' },
  ];

  return (
    <SlideContainer slideNumber={2}>
      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">
        {t('problem.title')}
      </h2>
      
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Challenges */}
        <div className="bg-red-50 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-red-700 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            {t('problem.challenges')}
          </h3>
          <ul className="space-y-3">
            {challenges.map((challenge, index) => (
              <li key={index} className="flex items-start gap-3">
                <challenge.icon className={`w-5 h-5 mt-0.5 ${challenge.color}`} />
                <span className="text-gray-700">{challenge.text}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Opportunity */}
        <div className="bg-emerald-50 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-emerald-700 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            {t('problem.opportunity')}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm">
              <Users className="w-10 h-10 text-emerald-500" />
              <div>
                <p className="text-2xl font-bold text-emerald-600">{t('problem.students')}</p>
                <p className="text-sm text-gray-600">{t('problem.studentsLabel')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm">
              <School className="w-10 h-10 text-emerald-500" />
              <div>
                <p className="text-2xl font-bold text-emerald-600">{t('problem.schools')}</p>
                <p className="text-sm text-gray-600">{t('problem.schoolsLabel')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm">
              <FileCheck className="w-10 h-10 text-emerald-500" />
              <div>
                <p className="text-lg font-bold text-emerald-600">{t('problem.policy')}</p>
                <p className="text-sm text-gray-600">{t('problem.policyLabel')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SlideContainer>
  );
};

export default Slide2Problem;
