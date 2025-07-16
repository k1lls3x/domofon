import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import MaskInput from 'react-native-mask-input';

interface Props {
  onLogin: () => void;
}

export const ForgotForm: React.FC<Props> = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const mask = ['+','7',' ', '(', /\d/, /\d/, /\d/, ')',' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/];
  const digits = phone.replace(/\D/g, '');

  const onSend = async () => {
    if (digits.length !== 11) return Alert.alert('Ошибка', 'Введите корректный номер');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Успех', 'Смс с инструкциями отправлено');
      onLogin();
    }, 800);
  };

  return (
    <View style={f.form}>
      <Text style={f.title}>Восстановление пароля</Text>
      <MaskInput
        style={f.input}
        placeholder="Телефон"
        value={phone}
        onChangeText={setPhone}
        mask={mask}
        keyboardType="phone-pad"
        placeholderTextColor="#ABB2C1"
      />
      <TouchableOpacity style={f.button} onPress={onSend} disabled={loading}>
        <Text style={f.buttonText}>{loading ? 'Отправка…' : 'Восстановить'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onLogin} style={f.back}>
        <Text style={f.backText}>Войти</Text>
      </TouchableOpacity>
    </View>
  );
};

const f = StyleSheet.create({
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
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
  button: {
    backgroundColor: '#3B6BF3',
    borderRadius: 8,
    paddingVertical: 14,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  back: {
    marginTop: 20,
    alignItems: 'center',
  },
  backText: {
    color: '#3B6BF3',
    fontSize: 15,
    fontWeight: '600',
  },
});
