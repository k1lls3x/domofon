import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';

interface ForgotFormProps {
  onLogin: () => void;
}

export const ForgotForm: React.FC<ForgotFormProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const onForgot = async () => {
    if (!email) {
      Alert.alert('Ошибка', 'Пожалуйста, введите email');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('http://a7b7aa3ee7.vps.myjino.ru:49217/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Ошибка', data.message || 'Не удалось восстановить пароль');
        setLoading(false);
        return;
      }

      Alert.alert('Успех', 'Инструкция по восстановлению отправлена на email!');
      // Если нужно сразу возвращаться на login:
      onLogin();
    } catch (e) {
      Alert.alert('Ошибка', 'Ошибка сети или сервера');
    }
    setLoading(false);
  };

  return (
    <View>
      <Text style={styles.title}>Восстановление пароля</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#b7c4e1"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TouchableOpacity style={styles.button} onPress={onForgot} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Загрузка...' : 'Восстановить'}</Text>
      </TouchableOpacity>
      <View style={styles.linksOne}>
        <TouchableOpacity onPress={onLogin}>
          <Text style={styles.link}>Войти</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 22,
    color: '#222',
    letterSpacing: 0.05,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e3eaff',
    backgroundColor: '#f9fbff',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#2563eb',
    borderRadius: 9,
    paddingVertical: 13,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 9,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: 0.03,
  },
  linksOne: {
    marginTop: 18,
    alignItems: 'flex-end',
    paddingHorizontal: 2,
  },
  link: {
    color: '#2563eb',
    fontWeight: '700',
    fontSize: 15.5,
    marginTop: 8,
  },
});
