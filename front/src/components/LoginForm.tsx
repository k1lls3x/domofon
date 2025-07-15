import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface LoginFormProps {
  onRegister: () => void;
  onForgot: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onRegister, onForgot }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!login || !password) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('http://a7b7aa3ee7.vps.myjino.ru:49217/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: login, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Ошибка входа', data.message || 'Неверный логин или пароль');
        setLoading(false);
        return;
      }

      Alert.alert('Успех', 'Вы успешно вошли!');
      // Тут можно вызвать переход на главный экран или сохранить токен, если нужно
    } catch (e) {
      Alert.alert('Ошибка', 'Ошибка сети или сервера');
    }
    setLoading(false);
  };

  return (
    <View>
      <Text style={styles.title}>Вход</Text>
      <TextInput
        style={styles.input}
        placeholder="Логин или телефон"
        placeholderTextColor="#b7c4e1"
        value={login}
        onChangeText={setLogin}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <View style={styles.passwordWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Пароль"
          placeholderTextColor="#b7c4e1"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={secure}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setSecure(!secure)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={secure ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color="#2563eb"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={onLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Загрузка...' : 'Войти'}</Text>
      </TouchableOpacity>
      <View style={styles.links}>
        <TouchableOpacity onPress={onForgot}>
          <Text style={styles.link}>Забыли пароль?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onRegister}>
          <Text style={styles.link}>Регистрация</Text>
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
    paddingRight: 38,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
    marginBottom: 15,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -10,
    zIndex: 10,
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
  links: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 2,
  },
  link: {
    color: '#2563eb',
    fontWeight: '700',
    fontSize: 15.5,
    marginTop: 8,
  },
});
