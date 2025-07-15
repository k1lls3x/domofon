import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { LoginForm }   from '../LoginForm';
import { RegisterForm } from '../RegisterForm';
import { ForgotForm }   from '../ForgotForm';

export const AuthScreen = () => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');

  return (
    <View style={styles.container}>
      {/* ❗️ белую «коробку» оставляем только для login / forgot,
          у RegisterForm уже есть собственная обёртка */}
      {mode === 'login' && (
        <View style={styles.formBox}>
          <LoginForm
            onRegister={() => setMode('register')}
            onForgot={() => setMode('forgot')}
          />
        </View>
      )}

      {mode === 'register' && (
        <RegisterForm onLogin={() => setMode('login')} />
      )}

      {mode === 'forgot' && (
        <View style={styles.formBox}>
          <ForgotForm onLogin={() => setMode('login')} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
  },
  formBox: {
    flex: 1,                      
    marginHorizontal: '2.5%',     
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
