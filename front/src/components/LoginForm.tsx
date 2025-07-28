import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput,ScrollView
} from 'react-native';
import MaskInput from 'react-native-mask-input';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from './Theme.Context';
import { LinearGradient } from 'expo-linear-gradient';
import { login } from './rest';
import AsyncStorage from '@react-native-async-storage/async-storage';
const PHONE_MASK = ['+','7',' ', '(', /\d/,/\d/,/\d/,')',' ',/\d/,/\d/,/\d/,'-',/\d/,/\d/,'-',/\d/,/\d/];

interface Props {
  onRegister: () => void;
  onForgot: () => void;
  onLoginSuccess: () => void;
}

export const LoginForm: React.FC<Props> = ({ onRegister, onForgot, onLoginSuccess }) => {
   const { theme } = useTheme();
  const [phone, setPhone] = useState('');
  const [pass, setPass] = useState('');
  const [hide, setHide] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const digits = phone.replace(/\D/g, '');
  const valid = digits.length === 11 && pass.length > 0;

const onSubmit = async () => {
  if (!valid) return;

  setLoading(true);
  setErr('');

  try {
    const response = await login(digits, pass);

    if (response?.access_token && response?.refresh_token) {
      await AsyncStorage.setItem('access_token', response.access_token);
      await AsyncStorage.setItem('refresh_token', response.refresh_token);
      onLoginSuccess();  // переход в приватную часть
    } else {
      setErr('Ошибка авторизации: некорректный ответ сервера');
      Alert.alert('Ошибка входа', 'Некорректный ответ сервера');
    }

  } catch (e: any) {
    setErr('Неверный номер телефона или пароль');
    Alert.alert('Ошибка входа', 'Неверный номер телефона или пароль');

  } finally {
    setLoading(false);
  }
};


return (
  <ScrollView
    contentContainerStyle={[
      styles.screen,
      { backgroundColor: theme.background }
    ]}
    keyboardShouldPersistTaps="handled"
  >
    <View
      style={[
        styles.outer,
        {
          backgroundColor: theme.cardBg,   // динамический фон
          shadowColor: theme.shadow,       // динамическая тень
        }
      ]}
    >
      {/* Аватар */}
      <View style={styles.avatarWrap}>
        <MaterialCommunityIcons
          name="account-circle"
          size={54}
          color={theme.icon}
        />
      </View>

      {/* Заголовок и описание */}
      <Text style={[styles.sysTitle, { color: theme.text }]}>
        Домофон
      </Text>
      <Text style={[styles.sysWelcome, { color: theme.subtext }]}>
        Добро пожаловать! Войдите в свой аккаунт.
      </Text>

      {/* Форма */}
      <MaskInput
        style={[
          styles.input,
          {
            backgroundColor: theme.inputBg,
            borderColor: theme.inputBorder,
            color: theme.text,
          }
        ]}
        placeholder="Телефон"
        placeholderTextColor={theme.subtext}
        value={phone}
        onChangeText={setPhone}
        mask={PHONE_MASK}
        keyboardType="phone-pad"
      />

      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.inputBg,
              borderColor: theme.inputBorder,
              color: theme.text,
            }
          ]}
          placeholder="Пароль"
          placeholderTextColor={theme.subtext}
          value={pass}
          onChangeText={setPass}
          secureTextEntry={hide}
        />
        <TouchableOpacity style={styles.eye} onPress={() => setHide(h => !h)}>
          <MaterialCommunityIcons
            name={hide ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color={theme.icon}
          />
        </TouchableOpacity>
      </View>

      {err.length > 0 && (
        <Text style={[styles.error, { color: '#e43a4b' }]}>
          {err}
        </Text>
      )}

      {/* Кнопка Войти */}
      <TouchableOpacity
        style={[styles.btn, !valid && { opacity: 0.7 }]}
        onPress={onSubmit}
        disabled={!valid || loading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[theme.gradientStart, theme.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.btnBg, !valid && { opacity: 0.7 }]}
        >
          {loading ? (
            <ActivityIndicator color={theme.btnText} />
          ) : (
            <Text style={[styles.btnText, { color: theme.btnText }]}>
              Войти
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Ссылки */}
      <View style={styles.bottomRow}>
        <TouchableOpacity onPress={onForgot} style={{ flex: 1 }}>
          <Text style={[styles.linkLeft, { color: theme.link }]}>
            Забыли пароль?
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onRegister} style={{ flex: 1 }}>
          <Text style={[styles.linkRight, { color: theme.link }]}>
            Регистрация
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </ScrollView>
);

};

const styles = StyleSheet.create({
  outer: {

    borderRadius: 26,
    padding: 28,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    shadowColor: '#23254b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.11,
    shadowRadius: 24,
    elevation: 9,
    marginTop: 0,
  },
   screen: {
   flexGrow: 1,
  justifyContent: 'center',
  padding: 16,
 },
  avatarWrap: {
    marginTop: 2,
    marginBottom: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sysTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    color: '#2d2d2d',
    letterSpacing: 0.01,
  },
  sysWelcome: {
    fontSize: 15,
    color: '#888',
    marginBottom: 14,
    textAlign: 'center',
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.2,
    paddingHorizontal: 16,
    fontSize: 16.5,
    marginBottom: 11,
    fontWeight: '500',
    width: '100%',
  },
  inputWrapper: { position: 'relative', marginBottom: 11, width: '100%' },
  eye: { position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' },
  btn: {
    width: '100%',
    borderRadius: 11,
    overflow: 'hidden',
    marginTop: 7,
    marginBottom: 7,
    height: 48,
  },
  btnBg: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 11,
  },
  btnText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#fff',
    letterSpacing: 0.04,
  },
  bottomRow: {
    width: '100%',
    flexDirection: 'row',
    marginTop: 3,
    marginBottom: 0,
    alignItems: 'center',
  },
  linkLeft: {
    fontWeight: '600',
    fontSize: 15.5,
    color: '#2585f4',
    textAlign: 'left',
    paddingLeft: 3,
    paddingTop: 2,
  },
  linkRight: {
    fontWeight: '600',
    fontSize: 15.5,
    color: '#2585f4',
    textAlign: 'right',
    paddingRight: 3,
    paddingTop: 2,
  },
  error: { fontSize: 13, marginLeft: 4, marginBottom: 6, fontWeight: '600' },
});