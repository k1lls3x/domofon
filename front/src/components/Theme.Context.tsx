import React, { createContext, useContext, useState, useMemo } from 'react';

const lightTheme = {
  mode: 'light',
  background: '#F7F8FA',
  card: '#fff',
  text: '#222',
  subtext: '#9099b6',
  inputBg: '#f7fafd',
  inputBorder: '#e0e6ef',
  btn: '#5568FE',
  btnText: '#fff',
  btnDisabled: '#e2e5f7',
  btnTextDisabled: '#bfc9de',
  icon: '#5568FE',
};

const darkTheme = {
  mode: 'dark',
  background: '#18192b',
  card: '#23243a',
  text: '#fff',
  subtext: '#b8bdd4',
  inputBg: '#23243a',
  inputBorder: '#414262',
  btn: '#6787d7',
  btnText: '#fff',
  btnDisabled: '#323356',
  btnTextDisabled: '#787a9b',
  icon: '#fff',
};

const ThemeContext = createContext({
  theme: lightTheme,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState(lightTheme);

  const toggleTheme = () => setTheme((prev) => (prev.mode === 'light' ? darkTheme : lightTheme));

  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
