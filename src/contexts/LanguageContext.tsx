import React, { createContext, useContext, useEffect, useState } from 'react';
import i18n from '../i18n';

interface LanguageContextType {
  language: string;
  changeLanguage: (code: string) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'id',
  changeLanguage: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<string>(i18n.language || 'id');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('app_language');
    if (savedLanguage && savedLanguage !== language) {
      setLanguage(savedLanguage);
      i18n.changeLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (code: string) => {
    setLanguage(code);
    i18n.changeLanguage(code);
    localStorage.setItem('app_language', code);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
