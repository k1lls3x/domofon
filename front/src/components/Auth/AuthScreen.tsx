import React, { useRef, useState } from 'react';
import {
  SafeAreaView, View, StyleSheet, KeyboardAvoidingView,
  TouchableWithoutFeedback, Keyboard, Animated, Easing, Platform, TouchableOpacity
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
  if (mode === 'login') Content = <LoginForm onRegister={() => switchMode('register')} onForgot={() => switchMode('forgot')} />;
  else if (mode === 'register') Content = <RegisterForm onLogin={() => switchMode('login')} />;
  else Content = <ForgotForm onLogin={() => switchMode('login')} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={60}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.center}>
              {(mode === 'register' || mode === 'forgot') && (
                <TouchableOpacity style={styles.backRow} onPress={() => switchMode('login')} activeOpacity={0.7}>
                  <MaterialCommunityIcons name="arrow-left" size={26} color={theme.icon} />
                  <Animated.Text style={[styles.backTxt, { color: theme.icon }]}>Назад</Animated.Text>
                </TouchableOpacity>
              )}
              <View style={styles.innerWrap}>
                <Animated.View style={styles.formWrap} pointerEvents="box-none">
                  {Content}
                </Animated.View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
        {/* ThemeSwitcher вне KeyboardAvoidingView */}
        <View style={styles.themeSwitcherWrap} pointerEvents="box-none">
          <ThemeSwitcher />
        </View>
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  innerWrap: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formWrap: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  backRow: {
    position: 'absolute',
    left: 0,
    top: Platform.OS === 'ios' ? 4 : 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 22,
  },
  backTxt: {
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 5,
  },
  themeSwitcherWrap: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    zIndex: 20,
  },
});
