import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation('header');
  const currentLang = i18n.language;

  const toggleLanguage = () => {
    const newLang = currentLang === 'th' ? 'en' : 'th';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 text-sm font-medium border border-white/20 hover:border-white/40"
      title={currentLang === 'th' ? t('switchToEnglish') : t('switchToThai')}
    >
      <Languages className="w-4 h-4" />
      <span className="font-semibold">{currentLang === 'th' ? 'EN' : 'TH'}</span>
    </button>
  );
};

export default LanguageSwitcher;
