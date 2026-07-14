import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
export type FontSize = 'small' | 'normal' | 'large';
export type LayoutStyle = 'modern' | 'classic' | 'minimalist' | 'elegant';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  layoutStyle: LayoutStyle;
  setLayoutStyle: (style: LayoutStyle) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemPrefersDark ? 'dark' : 'light';
  });

  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    const saved = localStorage.getItem('app-font-size') as FontSize | null;
    return saved === 'small' || saved === 'large' ? saved : 'normal';
  });

  const [layoutStyle, setLayoutStyleState] = useState<LayoutStyle>(() => {
    const saved = localStorage.getItem('app-layout-style') as LayoutStyle | null;
    return saved === 'classic' || saved === 'minimalist' || saved === 'elegant' ? saved : 'modern';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('app-font-small', 'app-font-large', 'app-font-normal');
    root.classList.add(`app-font-${fontSize}`);
    localStorage.setItem('app-font-size', fontSize);
  }, [fontSize]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('app-layout-modern', 'app-layout-classic', 'app-layout-minimalist', 'app-layout-elegant');
    root.classList.add(`app-layout-${layoutStyle}`);
    localStorage.setItem('app-layout-style', layoutStyle);
  }, [layoutStyle]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
  };

  const setLayoutStyle = (style: LayoutStyle) => {
    setLayoutStyleState(style);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, fontSize, setFontSize, layoutStyle, setLayoutStyle }}>
      {children}
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

