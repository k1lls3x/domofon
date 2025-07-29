import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';

export interface Theme {
  mode: 'light' | 'dark';
  background: string;
  cardBg: string;
  shadow: string;
  text: string;
  subtext: string;
  inputBg: string;
  inputText: string;
  inputBorder: string;
  icon: string;
  tabBarBg: string;
  tabBarIcon: string;
  tabBarIconActive: string;
  button: string;
  buttonText: string;
  buttonSecondary: string;
  buttonSecondaryText: string;
  error: string;
  success: string;
  link: string;                
  gradientStart: string;
  gradientEnd: string;
}

const lightTheme: Theme = {
  gradientStart: '#1E69DE',
  gradientEnd: '#5596FF',
  mode: 'light',
  background: '#f4f7fa',
  cardBg: '#ffffff',
  shadow: '#b6d7fa',
  text: '#181B26',
  subtext: '#8592a8',
  inputBg: '#f6f8fc',
  inputText: '#262626',
  inputBorder: '#e0e0e0',
  icon: '#1E69DE',
  tabBarBg: '#ffffff',
  tabBarIcon: '#B0B7C2',
  tabBarIconActive: '#1869de',
  button: '#1E69DE',
  buttonText: '#ffffff',
  buttonSecondary: '#eaf2ff',
  buttonSecondaryText: '#1E69DE',
  error: '#E43A4B',
  success: '#3DD598',
  link: '#1E69DE',          
};

const darkTheme: Theme = {
  gradientStart: '#337AFF',
  gradientEnd: '#5596FF',
  mode: 'dark',
  background: '#181C2A',
  cardBg: '#22263A',
  shadow: '#10121B',
  text: '#FFFFFF',
  subtext: '#A5ADC3',
  inputBg: '#252A41',
  inputText: '#FFFFFF',
  inputBorder: '#313657',
  icon: '#6D9EFF',
  tabBarBg: '#22263A',
  tabBarIcon: '#A5ADC3',
  tabBarIconActive: '#4E8BFF',
  button: '#337AFF',
  buttonText: '#FFFFFF',
  buttonSecondary: '#252A41',
  buttonSecondaryText: '#FFFFFF',
  error: '#F45C6B',
  success: '#38E39F',
  link: '#6D9EFF',            // ← и более яркий синий в тёмной теме
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
    setTheme(prev => (prev.mode === 'light' ? darkTheme : lightTheme));

  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
