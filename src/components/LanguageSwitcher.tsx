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
      className="flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white transition-all duration-200 text-sm font-medium border border-emerald-600 hover:border-emerald-700 shadow-md hover:shadow-lg"
      title={currentLang === 'th' ? t('switchToEnglish') : t('switchToThai')}
    >
      <Languages className="w-4 h-4" />
      <span className="font-semibold">{currentLang === 'th' ? 'EN' : 'TH'}</span>
    </button>
  );
};

export default LanguageSwitcher;
