import React from 'react';
import FlashMessage from "react-native-flash-message";
import { AuthScreen } from './components/Auth/AuthScreen';
import { ThemeProvider } from './components/Theme.Context'; 
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context'; 

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StatusBar style="auto" />
        <AuthScreen />
        <FlashMessage position="top" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
