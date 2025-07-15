// components/Auth/AuthScreen.tsx
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';

import { LoginForm    } from '../LoginForm';
import { RegisterForm } from '../RegisterForm';
import { ForgotForm   } from '../ForgotForm';

export const AuthScreen = () => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');

  /** обёртка для login / forgot */
  const wrap = (node: React.ReactNode) => (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}          // ↑ увеличено
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.formCard}>{node}</View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );

  return (
    <SafeAreaView style={styles.screen}>
      {mode === 'login'   && wrap(
        <LoginForm
          onRegister={() => setMode('register')}
          onForgot   ={() => setMode('forgot')}
        />
      )}

      {mode === 'forgot'  && wrap(
        <ForgotForm onLogin={() => setMode('login')} />
      )}

      {mode === 'register' && (
        /* RegisterForm уже включает ScrollView + KAV */
        <RegisterForm onLogin={() => setMode('login')} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f7f8fa' },

  /* карточка не центрируем: сверху небольшой отступ,
     дальше ScrollView берёт на себя прокрутку */
  scroll: {
    flexGrow: 1,
    paddingTop: 40,            // внешний отступ сверху
    paddingBottom: 24,
    alignItems: 'center',
  },

  formCard: {
    width: '95%',
    maxWidth: 410,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#2563eb',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 15,
  },
});
