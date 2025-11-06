import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t, i18n } = useTranslation('footer');
  const currentLang = i18n.language;

  return <footer className="mt-16 py-12">
      <div className="container mx-auto px-4 text-center">
        {/* CTA Button */}
        

        {/* Links */}
        <div className="text-white/80 text-sm space-y-2">
          
          <p>{t('copyright')}</p>
          <p>{t('contactPrefix')} <a href="https://lin.ee/hFVAoTI" className="inline-block align-middle"><img src={`https://scdn.line-apps.com/n/line_add_friends/btn/${currentLang}.png`} alt={t('contactButton')} className="inline-block h-9 w-auto" /></a> 💬</p>
        </div>
      </div>
    </footer>;
};
export default Footer;