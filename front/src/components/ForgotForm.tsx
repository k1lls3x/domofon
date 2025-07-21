import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Platform, Alert, ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import MaskInput from 'react-native-mask-input';
import { forgotPassword } from './rest';

interface Props {
  onLogin: () => void;
}

export const ForgotForm: React.FC<Props> = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const mask = [
    '+','7',' ', '(', /\d/,/\d/,/\d/,')',' ',
    /\d/,/\d/,/\d/,'-',/\d/,/\d/,'-',/\d/,/\d/
  ];
  const digits = phone.replace(/\D/g, '');

  const onSend = async () => {
    if (digits.length !== 11) {
      return Alert.alert('Ошибка', 'Введите корректный номер');
    }
    setLoading(true);
    try {
      const resp = await forgotPassword(digits);
      Alert.alert('Успешная регистрация', resp.message, [
        { text: 'OK', onPress: onLogin }
      ]);
    } catch (e: any) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.center}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={60}
    >
      <View style={styles.form}>
        <Text style={styles.title}>Восстановление пароля</Text>
        <MaskInput
          style={styles.input}
          placeholder="Телефон"
          value={phone}
          onChangeText={setPhone}
          mask={mask}
          keyboardType="phone-pad"
          placeholderTextColor="#ABB2C1"
        />
        <TouchableOpacity style={styles.button} onPress={onSend} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#FFF" />
            : <Text style={styles.buttonText}>Восстановить</Text>
          }
        </TouchableOpacity>
        <TouchableOpacity onPress={onLogin} style={styles.back}>
          <Text style={styles.link}>Войти</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  form: {
    width: '92%',
    maxWidth: 400,
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
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
  back: {
    marginTop: 20,
    alignSelf: 'center',
  },
  link: {
    color: '#3B6BF3',
    fontSize: 16,
    fontWeight: '600',
  },
});
