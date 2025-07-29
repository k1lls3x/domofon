// App.tsx
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import FlashMessage from 'react-native-flash-message';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ThemeProvider } from './components/Theme.Context';
import { AuthScreen } from './components/Auth/AuthScreen';
import MainForm from './components/MAIN/MainForm';

/* ---------- типы экранов ---------- */
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/* ---------- вложенные стеки ---------- */
const AuthStack = ({ onLogin }: { onLogin: () => void }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Auth">
      {() => <AuthScreen onLoginSuccess={onLogin} />}
    </Stack.Screen>
  </Stack.Navigator>
);

const AppStack = ({ onLogout }: { onLogout: () => void }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Main">
      {() => <MainForm onLogout={onLogout} />}
    </Stack.Screen>
  </Stack.Navigator>
);

/* ---------- корневой компонент ---------- */
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StatusBar style="auto" />

        <NavigationContainer>
          {isLoggedIn ? (
            <AppStack onLogout={() => setIsLoggedIn(false)} />
          ) : (
            <AuthStack onLogin={() => setIsLoggedIn(true)} />
          )}
        </NavigationContainer>

        <FlashMessage position="top" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
