import React, { useRef, useState } from 'react';
import {
  SafeAreaView, View, StyleSheet, KeyboardAvoidingView,
  TouchableWithoutFeedback, Keyboard, Animated, Easing, Platform, TouchableOpacity, Text
} from 'react-native';
import { LoginForm } from '../LoginForm';
import { RegisterForm } from '../RegisterForm';
import { ForgotForm } from '../ForgotForm';
import { useTheme } from '../Theme.Context';
import { ThemeSwitcher } from '../ThemeSwitcher';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Mode = 'login' | 'register' | 'forgot';

export const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<Mode>('login');
  const [registerStep, setRegisterStep] = useState<0 | 1 | 2 | 3>(0);
  const fade = useRef(new Animated.Value(1)).current;
  const { theme } = useTheme();

  const switchMode = (newMode: Mode) => {
    if (newMode === mode) return;
    Animated.timing(fade, { toValue: 0, duration: 120, useNativeDriver: true, easing: Easing.out(Easing.ease) }).start(() => {
      setMode(newMode);
      Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true, easing: Easing.out(Easing.ease) }).start();
    });
  };

  // Step-by-step стрелка назад для регистрации
  const handleBack = () => {
    if (mode === 'register' && registerStep > 0) {
      setRegisterStep(prev => (prev - 1) as 0 | 1 | 2 | 3);
    } else {
      switchMode('login');
    }
  };

  let Content: React.ReactNode;
  if (mode === 'login') {
    Content = (
      <LoginForm
        onRegister={() => switchMode('register')}
        onForgot={() => switchMode('forgot')}
      />
    );
  } else if (mode === 'register') {
  Content = (
    <RegisterForm
      onLogin={() => switchMode('login')}
    />
  );
} else {
    Content = (
      <ForgotForm
        onLogin={() => switchMode('login')}
      />
    );
  }

  const showBack = mode === 'register' || mode === 'forgot';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* --- ШАПКА --- */}
      <View style={styles.header}>
        {showBack ? (
          <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
            <MaterialCommunityIcons name="arrow-left" size={28} color={theme.icon} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtnPlaceholder} />
        )}
        {/* Центр — под лого */}
        <View style={{ flex: 1 }} />
        {/* ThemeSwitcher — абсолютное позиционирование, ОПУЩЕН ниже центра шапки */}
        <View style={styles.themeSwitcherWrapAbs}>
          <ThemeSwitcher />
        </View>
      </View>
      {/* --- /ШАПКА --- */}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={60}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.center}>
            <Animated.View style={[styles.formWrap, { opacity: fade }]}>
              {Content}
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      <View style={styles.copyrightWrap}>
        <Text style={styles.copyright}>© 2025 Домофон</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    width: '100%',
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: 'transparent',
    marginBottom: 6,
    position: 'relative',
  },
  backBtn: {
    width: 46,
    height: 46,
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderRadius: 23,
    marginLeft: -8,
  },
  backBtnPlaceholder: {
    width: 46,
    height: 46,
  },
  themeSwitcherWrapAbs: {
    position: 'absolute',
    right: 0,
    bottom: 6, // чем больше — тем ниже (например, 0, 6, 10, 16 и т.д.)
    zIndex: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  formWrap: {
    width: '90%',
    maxWidth: 400,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  copyrightWrap: {
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 18,
  },
  copyright: {
    color: '#aaa',
    fontSize: 13,
  },
});

export default AuthScreen;
