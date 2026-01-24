import React from 'react';
import { useTranslation } from 'react-i18next';
import SlideContainer from '../SlideContainer';
import { DollarSign, Gift, Building, Handshake, Target } from 'lucide-react';

const Slide7Business: React.FC = () => {
  const { t } = useTranslation('presentation');

  const models = [
    { 
      icon: Gift, 
      title: t('business.freemium'), 
      desc: t('business.freemiumDesc'),
      color: 'bg-emerald-500'
    },
    { 
      icon: Building, 
      title: t('business.schoolLicense'), 
      desc: t('business.schoolLicenseDesc'),
      color: 'bg-blue-500'
    },
    { 
      icon: Handshake, 
      title: t('business.partnership'), 
      desc: t('business.partnershipDesc'),
      color: 'bg-purple-500'
    },
  ];

  return (
    <SlideContainer slideNumber={7}>
      <div className="flex items-center gap-3 mb-6">
        <DollarSign className="w-10 h-10 text-emerald-600" />
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
          {t('business.title')}
        </h2>
      </div>
      
      <div className="flex-1 grid grid-cols-3 gap-4">
        {models.map((model, index) => (
          <div 
            key={index}
            className="bg-white border-2 border-gray-100 rounded-2xl p-5 text-center hover:border-emerald-200 hover:shadow-md transition-all"
          >
            <div className={`${model.color} w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4`}>
              <model.icon className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{model.title}</h3>
            <p className="text-sm text-gray-600">{model.desc}</p>
          </div>
        ))}
      </div>
      
      {/* Revenue Target */}
      <div className="mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className="w-10 h-10" />
            <div>
              <p className="text-lg opacity-90">{t('business.revenueTarget')}</p>
              <p className="text-4xl font-bold">{t('business.revenueAmount')}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">10</span>
              <span className="opacity-80">โรงเรียนนำร่อง</span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold">1,000+</span>
              <span className="opacity-80">ผู้ใช้งาน</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Pricing tiers */}
      <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
        <div className="bg-gray-100 rounded-xl p-3">
          <p className="font-bold text-gray-800">Free</p>
          <p className="text-gray-500">4 Apps</p>
        </div>
        <div className="bg-emerald-100 rounded-xl p-3 border-2 border-emerald-300">
          <p className="font-bold text-emerald-700">Premium</p>
          <p className="text-emerald-600">฿199/เดือน</p>
        </div>
        <div className="bg-blue-100 rounded-xl p-3">
          <p className="font-bold text-blue-700">School</p>
          <p className="text-blue-600">ติดต่อขอราคา</p>
        </div>
      </div>
    </SlideContainer>
  );
};

export default Slide7Business;
