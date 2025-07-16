import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import MaskInput from 'react-native-mask-input';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  onRegister: () => void;
  onForgot: () => void;
}

export const LoginForm: React.FC<Props> = ({ onRegister, onForgot }) => {
  const [phone, setPhone] = useState('');
  const [pass, setPass] = useState('');
  const [hide, setHide] = useState(true);
  const [loading, setLoading] = useState(false);

  const phoneMask = ['+','7',' ', '(', /\d/, /\d/, /\d/, ')',' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/];
  const digits = phone.replace(/\D/g, '');

  const onLogin = async () => {
    if (!digits || !pass) return Alert.alert('Ошибка', 'Заполните все поля');
    setLoading(true);
    // ...fetch логин...
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Успех', 'Авторизация прошла успешно');
    }, 800);
  };

  return (
    <View style={s.form}>
      <Text style={s.title}>Вход</Text>
      <MaskInput
        style={s.input}
        placeholder="Телефон"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        mask={phoneMask}
        placeholderTextColor="#ABB2C1"
      />
      <View style={s.inputWrapper}>
        <TextInput
          style={s.input}
          placeholder="Пароль"
          secureTextEntry={hide}
          value={pass}
          onChangeText={setPass}
          placeholderTextColor="#ABB2C1"
        />
        <TouchableOpacity style={s.eye} onPress={() => setHide(h => !h)}>
          <MaterialCommunityIcons
            name={hide ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color="#3B6BF3"
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={s.button} onPress={onLogin} disabled={loading}>
        <Text style={s.buttonText}>{loading ? 'Загрузка…' : 'Войти'}</Text>
      </TouchableOpacity>
      <View style={s.links}>
        <TouchableOpacity onPress={onForgot}><Text style={s.link}>Забыли пароль?</Text></TouchableOpacity>
        <TouchableOpacity onPress={onRegister}><Text style={s.link}>Регистрация</Text></TouchableOpacity>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 24,
    color: '#222',
  },
  input: {
    height: 48,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D9E6',
    paddingHorizontal: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  inputWrapper: {
    position: 'relative',
  },
  eye: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#3B6BF3',
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  link: {
    color: '#3B6BF3',
    fontSize: 15,
    fontWeight: '600',
  },
});
