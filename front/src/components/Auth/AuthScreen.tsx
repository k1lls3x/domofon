import React, { useRef, useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { LoginForm } from '../LoginForm';
import { RegisterForm } from '../RegisterForm';
import { ForgotForm } from '../ForgotForm';

type Mode = 'login' | 'register' | 'forgot';

export const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<Mode>('login');
  const fade = useRef(new Animated.Value(1)).current;

  // при смене mode — плавно затухаем и всплываем
  const switchMode = (newMode: Mode) => {
    if (newMode === mode) return;
    Animated.timing(fade, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start(() => {
      setMode(newMode);
      Animated.timing(fade, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    });
  };

  let Content: React.ReactNode;
  if (mode === 'login') {
    Content = <LoginForm onRegister={() => switchMode('register')} onForgot={() => switchMode('forgot')} />;
  } else if (mode === 'register') {
    Content = <RegisterForm onLogin={() => switchMode('login')} />;
  } else {
    Content = <ForgotForm onLogin={() => switchMode('login')} />;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.avoider}
        keyboardVerticalOffset={60}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Animated.View style={[styles.container, { opacity: fade }]}>
            {Content}
          </Animated.View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F8FA' },
  avoider: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
});
