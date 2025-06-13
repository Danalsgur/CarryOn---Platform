import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-gray-500" />
      <div className="flex rounded-md overflow-hidden">
        <button 
          className={`px-2 py-1 text-sm transition-colors ${
            i18n.language === 'ko' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
          onClick={() => changeLanguage('ko')}
        >
          한국어
        </button>
        <button 
          className={`px-2 py-1 text-sm transition-colors ${
            i18n.language === 'en' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
          onClick={() => changeLanguage('en')}
        >
          English
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
