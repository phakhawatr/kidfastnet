import { useTranslation } from 'react-i18next';
import { getVersionString } from '@/config/version';

const Footer = () => {
  const { t, i18n } = useTranslation('footer');
  const currentLang = i18n.language;

  return (
    <footer className="mt-16 py-12">
      <div className="container mx-auto px-4 text-center">
        <div className="text-white/80 text-sm space-y-2">
          <p>{t('copyright')}</p>
          <p>
            {t('contactPrefix')}{' '}
            <a href="https://lin.ee/hFVAoTI" className="inline-block align-middle">
              <img 
                src={`https://scdn.line-apps.com/n/line_add_friends/btn/${currentLang}.png`} 
                alt={t('contactButton')} 
                className="inline-block h-9 w-auto" 
              />
            </a>{' '}
            💬
          </p>
          <p className="text-white/50 text-xs mt-4">
            {getVersionString()}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
