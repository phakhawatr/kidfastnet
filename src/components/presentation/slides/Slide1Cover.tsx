import React from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import SlideContainer from '../SlideContainer';
import { Brain, Sparkles } from 'lucide-react';

const Slide1Cover: React.FC = () => {
  const { t } = useTranslation('presentation');
  const demoUrl = 'https://kidfastnet.lovable.app';

  return (
    <SlideContainer slideNumber={1} className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600">
      <div className="flex-1 flex flex-col items-center justify-center text-white text-center relative z-10">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 opacity-20">
          <Sparkles className="w-24 h-24" />
        </div>
        <div className="absolute bottom-20 right-10 opacity-20">
          <Brain className="w-32 h-32" />
        </div>
        
        {/* Logo and Title */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-xl">
            <Brain className="w-12 h-12 text-emerald-600" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            {t('title')}
          </h1>
        </div>
        
        {/* Tagline */}
        <p className="text-2xl md:text-3xl font-light mb-3 opacity-95">
          {t('tagline')}
        </p>
        
        <p className="text-xl opacity-80 mb-8">
          {t('cover.subtitle')}
        </p>
        
        {/* Grade badge */}
        <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-10">
          <span className="text-lg font-medium">{t('cover.forGrades')}</span>
        </div>
        
        {/* QR Code */}
        <div className="bg-white p-4 rounded-xl shadow-xl">
          <QRCodeSVG value={demoUrl} size={100} />
          <p className="text-xs text-gray-600 mt-2 font-medium">{t('cover.scanToTry')}</p>
        </div>
      </div>
      
      {/* Decorative wave */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-white/10" 
           style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 0 60%)' }} />
    </SlideContainer>
  );
};

export default Slide1Cover;
