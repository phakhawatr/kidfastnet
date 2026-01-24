import React from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import SlideContainer from '../SlideContainer';
import { Map, CheckCircle, Rocket, Globe, Mail, ExternalLink, Heart } from 'lucide-react';

const Slide8Roadmap: React.FC = () => {
  const { t } = useTranslation('presentation');
  const demoUrl = 'https://kidfastnet.lovable.app';

  const phases = [
    { 
      title: t('roadmap.current'), 
      desc: t('roadmap.currentDesc'),
      icon: CheckCircle,
      color: 'bg-emerald-500',
      active: true
    },
    { 
      title: t('roadmap.phase1'), 
      desc: t('roadmap.phase1Desc'),
      icon: Rocket,
      color: 'bg-blue-500'
    },
    { 
      title: t('roadmap.phase2'), 
      desc: t('roadmap.phase2Desc'),
      icon: Rocket,
      color: 'bg-purple-500'
    },
    { 
      title: t('roadmap.phase3'), 
      desc: t('roadmap.phase3Desc'),
      icon: Globe,
      color: 'bg-amber-500'
    },
  ];

  return (
    <SlideContainer slideNumber={8} className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="flex items-center gap-3 mb-6">
        <Map className="w-10 h-10 text-emerald-400" />
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          {t('roadmap.title')}
        </h2>
      </div>
      
      {/* Timeline */}
      <div className="flex-1 grid grid-cols-4 gap-3">
        {phases.map((phase, index) => (
          <div 
            key={index}
            className={`rounded-xl p-4 ${phase.active 
              ? 'bg-emerald-500/20 border-2 border-emerald-400' 
              : 'bg-white/5 border border-white/10'
            }`}
          >
            <div className={`${phase.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
              <phase.icon className="w-5 h-5 text-white" />
            </div>
            <h3 className={`font-bold mb-1 ${phase.active ? 'text-emerald-400' : 'text-white'}`}>
              {phase.title}
            </h3>
            <p className="text-sm text-gray-400">{phase.desc}</p>
          </div>
        ))}
      </div>
      
      {/* Contact section */}
      <div className="mt-6 bg-white/10 backdrop-blur rounded-2xl p-5 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            {t('roadmap.contact')}
          </h3>
          <p className="text-gray-300 text-sm mb-1">{t('roadmap.email')}</p>
          <p className="text-gray-300 text-sm flex items-center gap-1">
            <ExternalLink className="w-4 h-4" />
            {t('roadmap.website')}
          </p>
        </div>
        
        <div className="bg-white p-3 rounded-xl">
          <QRCodeSVG value={demoUrl} size={80} />
        </div>
        
        <div className="text-right max-w-xs">
          <p className="text-lg font-semibold text-emerald-400 flex items-center gap-2 justify-end">
            <Heart className="w-5 h-5 fill-emerald-400" />
            {t('roadmap.callToAction')}
          </p>
        </div>
      </div>
    </SlideContainer>
  );
};

export default Slide8Roadmap;
