import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput
} from 'react-native';
import MaskInput from 'react-native-mask-input';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from './Theme.Context';
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
      await login(digits, pass); // Предполагаем, что login выбрасывает ошибку при неверных данных
      Alert.alert('Успешный вход', 'Вы успешно вошли в аккаунт!');
      // Здесь можно сбросить поля или выполнить переход
    } catch (e: any) {
      setErr('Неверный номер телефона или пароль');
      Alert.alert('Ошибка входа', 'Неверный номер телефона или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.form, { backgroundColor: theme.card }]}>
      <Text style={[styles.title, { color: theme.text }]}>Вход</Text>
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
      <TouchableOpacity
        style={[
          styles.btn,
          !valid ? { backgroundColor: theme.btnDisabled } : { backgroundColor: theme.btn }
        ]}
        onPress={onSubmit}
        disabled={!valid || loading}
        activeOpacity={valid ? 0.8 : 1}
      >
        {loading
          ? <ActivityIndicator color={theme.btnText} />
          : <Text style={[
              styles.btnText,
              !valid ? { color: theme.btnTextDisabled } : { color: theme.btnText }
            ]}>Войти</Text>
        }
      </TouchableOpacity>
      <View style={styles.linkRow}>
        <TouchableOpacity onPress={onForgot} style={{ flex: 1 }}>
          <Text style={[styles.link, { color: theme.icon }]}>Забыли пароль?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onRegister} style={{ flex: 1 }}>
          <Text style={[styles.link, { color: theme.icon }]}>Регистрация</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    borderRadius: 18,
    padding: 22,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  title: { fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 20 },
  input: {
    height: 50,
    borderRadius: 13,
    borderWidth: 1.5,
    paddingHorizontal: 18,
    fontSize: 16.5,
    marginBottom: 12,
    fontWeight: '600',
  },
  inputWrapper: { position: 'relative', marginBottom: 12 },
  eye: { position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' },
  btn: {
    borderRadius: 13,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  btnText: { fontWeight: '900', fontSize: 18, letterSpacing: 0.05 },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    width: '100%',
  },
  link: {
    fontWeight: '700',
    fontSize: 15.5,
    textAlign: 'center',
  },
  error: { fontSize: 13, marginLeft: 4, marginBottom: 10, fontWeight: '600' },
});
