import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput
} from 'react-native';
import MaskInput from 'react-native-mask-input';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from './Theme.Context';
import { LinearGradient } from 'expo-linear-gradient';
import { login } from './rest';

const PHONE_MASK = ['+','7',' ', '(', /\d/,/\d/,/\d/,')',' ',/\d/,/\d/,/\d/,'-',/\d/,/\d/,'-',/\d/,/\d/];

interface Props {
  onRegister: () => void;
  onForgot: () => void;
}

export const LoginForm: React.FC<Props> = ({ onRegister, onForgot }) => {
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
      await login(digits, pass);
      Alert.alert('Успешный вход', 'Вы успешно вошли в аккаунт!');
    } catch (e: any) {
      setErr('Неверный номер телефона или пароль');
      Alert.alert('Ошибка входа', 'Неверный номер телефона или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.outer}>
      {/* Аватар */}
      <View style={styles.avatarWrap}>
        <MaterialCommunityIcons name="account-circle" size={54} color="#ddd" />
      </View>
      {/* Заголовок и описание */}
      <Text style={styles.sysTitle}>Домофон</Text>
      <Text style={styles.sysWelcome}>Добро пожаловать! Войдите в свой аккаунт.</Text>
      {/* Форма */}
      <MaskInput
        style={[
          styles.input,
          { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }
        ]}
        placeholder="Телефон"
        value={phone}
        onChangeText={setPhone}
        mask={PHONE_MASK}
        keyboardType="phone-pad"
        placeholderTextColor={theme.subtext}
      />
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }
          ]}
          placeholder="Пароль"
          placeholderTextColor={theme.subtext}
          value={pass}
          onChangeText={setPass}
          secureTextEntry={hide}
        />
        <TouchableOpacity style={styles.eye} onPress={() => setHide(h => !h)}>
          <MaterialCommunityIcons name={hide ? 'eye-off-outline' : 'eye-outline'} size={22} color={theme.icon} />
        </TouchableOpacity>
      </View>
      {err.length > 0 && <Text style={[styles.error, { color: '#e43a4b' }]}>{err}</Text>}

      {/* Красивая кнопка с градиентом */}
      <TouchableOpacity
        style={[styles.btn, !valid ? { opacity: 0.7 } : {}]}
        onPress={onSubmit}
        disabled={!valid || loading}
        activeOpacity={valid ? 0.8 : 1}
      >
        <LinearGradient
          colors={['#2585f4', '#1b2b64']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={[styles.btnBg, !valid && { opacity: 0.8 }]}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Войти</Text>
          }
        </LinearGradient>
      </TouchableOpacity>

      {/* Две ссылки снизу: забыли пароль слева, регистрация справа */}
      <View style={styles.bottomRow}>
        <TouchableOpacity onPress={onForgot} style={{ flex: 1 }}>
          <Text style={styles.linkLeft}>Забыли пароль?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onRegister} style={{ flex: 1 }}>
          <Text style={styles.linkRight}>Регистрация</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    backgroundColor: "#fff", // ВСЕГДА белый
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
