import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';

export interface Theme {
  mode: 'light' | 'dark';
  background: string;      // фон экрана
  cardBg: string;          // фон карточек (форм, попапов)
  shadow: string;          // цвет тени карточек
  text: string;            // основной текст
  subtext: string;         // вспомогательный текст (placeholder, описания)
  inputBg: string;         // фон полей ввода
  inputBorder: string;     // рамка полей ввода
  icon: string;            // цвет иконок
  link: string;            // цвет ссылок
  gradientStart: string;   // начало градиента кнопок
  gradientEnd: string;     // конец градиента кнопок
  btnText: string;         // текст внутри кнопок
  btnDisabled: string;     // фон отключённых кнопок (если понадобится)
  btnTextDisabled: string; // текст отключённых кнопок

  error: string;
  success: string;
}

const lightTheme: Theme = {
  mode: 'light',
  background: '#F7F8FA',
  cardBg: '#FFFFFF',
  shadow: '#23254B20',      // полупрозрачная тень
  text: '#222222',
  subtext: '#9099B6',
  inputBg: '#F7FAFD',
  inputBorder: '#E0E6EF',
  icon: '#5568FE',
  link: '#2585F4',
  gradientStart: '#2585F4',
  gradientEnd: '#1B2B64',
  btnText: '#FFFFFF',
  btnDisabled: '#E2E5F7',
  btnTextDisabled: '#BFC9DE',

error: '#e43a4b',
success: '#41d67a',
};

const darkTheme: Theme = {
  mode: 'dark',
  background: '#18192B',
  cardBg: '#23243A',
  shadow: '#00000080',      // полупрозрачная чёрная тень
  text: '#FFFFFF',

error: '#e43a4b',
success: '#41d67a',
  subtext: '#B8BDD4',
  inputBg: '#23243A',
  inputBorder: '#414262',
  icon: '#FFFFFF',
  link: '#68A0FF',
  gradientStart: '#6FB1FC',
  gradientEnd: '#1E69DE',
  btnText: '#FFFFFF',
  btnDisabled: '#323356',
  btnTextDisabled: '#787A9B',
};

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(lightTheme);

  const toggleTheme = () =>
    setTheme((prev) => (prev.mode === 'light' ? darkTheme : lightTheme));

  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
