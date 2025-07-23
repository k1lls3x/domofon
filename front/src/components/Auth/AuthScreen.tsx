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
  const fade = useRef(new Animated.Value(1)).current;
  const { theme } = useTheme();

  const switchMode = (newMode: Mode) => {
    if (newMode === mode) return;
    Animated.timing(fade, { toValue: 0, duration: 120, useNativeDriver: true, easing: Easing.out(Easing.ease) }).start(() => {
      setMode(newMode);
      Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true, easing: Easing.out(Easing.ease) }).start();
    });
  };

  let Content: React.ReactNode;
  if (mode === 'login') Content = (
    <LoginForm
      onRegister={() => switchMode('register')}
      onForgot={() => switchMode('forgot')}
    />
  );
  else if (mode === 'register') Content = (
    <RegisterForm
      onLogin={() => switchMode('login')}
    />
  );
  else Content = (
    <ForgotForm
      onLogin={() => switchMode('login')}
    />
  );

  // Показывать стрелку "Назад" только на регистрации и восстановлении
  const showBack = mode === 'register' || mode === 'forgot';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Шапка */}
      <View style={styles.header}>
        {showBack ? (
          <TouchableOpacity style={styles.backBtn} onPress={() => switchMode('login')} activeOpacity={0.7}>
            <MaterialCommunityIcons name="arrow-left" size={28} color={theme.icon} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtnPlaceholder} />
        )}
        <View style={{ flex: 1 }} />
      </View>
      {/* ThemeSwitcher — чуть ниже шапки, фиксировано */}
      <View style={styles.themeSwitcherWrap}>
        <ThemeSwitcher />
      </View>
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
      {/* Копирайт внизу */}
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
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
    marginBottom: 6,
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
  themeSwitcherWrap: {
    position: 'absolute',
    right: 20,
    top: 94, // СТАЛО ниже (шапка ~58 + отступ 36)
    zIndex: 20,
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
