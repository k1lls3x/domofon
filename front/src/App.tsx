import React, { useState } from 'react';
import FlashMessage from "react-native-flash-message";
import { ThemeProvider } from './components/Theme.Context';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthScreen } from './components/Auth/AuthScreen';
import MainForm from './components/MAIN/MainForm';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StatusBar style="auto" />
        {isLoggedIn ? (
          <MainForm onLogout={() => setIsLoggedIn(false)} />
        ) : (
          <AuthScreen onLoginSuccess={() => setIsLoggedIn(true)} />
        )}
        <FlashMessage position="top" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
