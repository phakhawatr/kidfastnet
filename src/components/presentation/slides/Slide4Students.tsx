import React from 'react';
import { useTranslation } from 'react-i18next';
import SlideContainer from '../SlideContainer';
import { GraduationCap, Calendar, MessageCircle, Atom, Trophy, Star, Flame } from 'lucide-react';

const Slide4Students: React.FC = () => {
  const { t } = useTranslation('presentation');

  const features = [
    { 
      icon: Calendar, 
      title: t('students.calendar'), 
      desc: t('students.calendarDesc'),
      color: 'from-emerald-400 to-teal-500',
      visual: (
        <div className="flex gap-1 mt-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white/30 rounded px-2 py-1 text-xs">
              ภารกิจ {i}
            </div>
          ))}
        </div>
      )
    },
    { 
      icon: MessageCircle, 
      title: t('students.tutor'), 
      desc: t('students.tutorDesc'),
      color: 'from-blue-400 to-indigo-500',
      visual: (
        <div className="bg-white/30 rounded-lg p-2 mt-2 text-xs">
          💬 "5 + 3 เท่ากับเท่าไหร่?"
        </div>
      )
    },
    { 
      icon: Atom, 
      title: t('students.stem'), 
      desc: t('students.stemDesc'),
      color: 'from-purple-400 to-pink-500',
      visual: (
        <div className="flex gap-1 mt-2 text-lg">
          🔬 🧪 🔭 💻
        </div>
      )
    },
    { 
      icon: Trophy, 
      title: t('students.gamification'), 
      desc: t('students.gamificationDesc'),
      color: 'from-amber-400 to-orange-500',
      visual: (
        <div className="flex items-center gap-2 mt-2">
          <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
          <Flame className="w-5 h-5 text-orange-300" />
          <span className="text-xs bg-white/30 px-2 py-1 rounded">🏆</span>
        </div>
      )
    },
  ];

  return (
    <SlideContainer slideNumber={4}>
      <div className="flex items-center gap-3 mb-6">
        <GraduationCap className="w-10 h-10 text-emerald-600" />
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
          {t('students.title')}
        </h2>
      </div>
      
      <div className="flex-1 grid grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <div 
            key={index}
            className={`bg-gradient-to-br ${feature.color} rounded-2xl p-5 text-white`}
          >
            <feature.icon className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-bold mb-1">{feature.title}</h3>
            <p className="text-sm opacity-90">{feature.desc}</p>
            {feature.visual}
          </div>
        ))}
      </div>
    </SlideContainer>
  );
};

export default Slide4Students;
