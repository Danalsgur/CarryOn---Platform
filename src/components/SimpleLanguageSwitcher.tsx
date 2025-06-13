import { useTranslation } from 'react-i18next';

const SimpleLanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  // 현재 언어에 따라 표시할 텍스트와 전환할 언어 결정
  const currentLang = i18n.language;
  const displayText = currentLang === 'ko' ? 'ko' : 'en';
  const targetLang = currentLang === 'ko' ? 'en' : 'ko';

  return (
    <button 
      className="px-2 py-1 rounded-md text-sm font-medium bg-gray-100 hover:bg-gray-200 transition-colors"
      onClick={() => changeLanguage(targetLang)}
      aria-label={t('language.switchTo', { language: t(`language.${targetLang}`) })}
    >
      {displayText}
    </button>
  );
};

export default SimpleLanguageSwitcher;
