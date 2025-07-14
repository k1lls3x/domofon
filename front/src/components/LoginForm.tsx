import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './Auth/AuthScreen.styles';
import axios from 'axios';

export const LoginForm = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);



const onLogin = async () => {
  console.log('Отправляем запрос с данными:', { username: login, password });

  if (!login || !password) {
    Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
    return;
  }

  try {
    const response = await fetch('http://a7b7aa3ee7.vps.myjino.ru:49217/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: login, password }),
    });

    console.log('Статус ответа:', response.status);

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      console.warn('Ответ не JSON:', text);
      Alert.alert('Ошибка', 'Сервер вернул неожиданный формат ответа');
      return;
    }

    const data = await response.json();
    console.log('Тело ответа JSON:', data);

    if (!response.ok) {
      Alert.alert('Ошибка входа', data.message || JSON.stringify(data));
      return;
    }

    Alert.alert('Успех', 'Вы успешно вошли!');
  } catch (error) {
    console.error('Ошибка запроса:', error);
    Alert.alert('Ошибка', 'Ошибка сети или сервера');
  }
};





  return (
    <View style={styles.form}>
      <TextInput
        style={styles.input}
        placeholder="Логин или телефон"
        placeholderTextColor="#92a3c5"
        value={login}
        onChangeText={setLogin}
        autoCapitalize="none"
      />
      <View style={styles.passwordWrapper}>
        <TextInput
          style={[styles.input, { paddingRight: 44 }]}
          placeholder="Пароль"
          placeholderTextColor="#92a3c5"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={secureText}
        />
        <TouchableOpacity onPress={() => setSecureText(!secureText)} style={styles.eyeIcon} activeOpacity={0.7}>
          <MaterialCommunityIcons
            name={secureText ? 'eye-off-outline' : 'eye-outline'}
            size={24}
            color="#666"
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={onLogin}>
        <Text style={styles.buttonText}>Войти</Text>
      </TouchableOpacity>
    </View>
  );
};
