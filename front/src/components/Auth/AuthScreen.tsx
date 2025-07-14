import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // иконки Expo

export const AuthScreen = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true); // для переключения пароля

  const onLogin = () => {
    if (login === 'demo' && password === 'demo') {
      Alert.alert('Успех', 'Вы успешно вошли!');
    } else {
      Alert.alert('Ошибка', 'Неверный логин или пароль');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f7f8fa' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0} // Отступ для iOS
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoWrap}>
          <Text style={styles.logo}>🔒</Text>
          <Text style={styles.title}>Вход в систему</Text>
        </View>
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Логин или телефон"
            placeholderTextColor="#92a3c5"
            value={login}
            onChangeText={setLogin}
            autoCapitalize="none"
            keyboardType="default"
          />
          <View style={styles.passwordWrapper}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Пароль"
              placeholderTextColor="#92a3c5"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureText}
            />
            <TouchableOpacity
              onPress={() => setSecureText(!secureText)}
              style={styles.eyeIcon}
              activeOpacity={0.7}
            >
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
          <View style={styles.links}>
            <TouchableOpacity>
              <Text style={styles.link}>Забыли пароль?</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.link}>Регистрация</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    fontSize: 56,
    marginBottom: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#23242a',
    marginBottom: 8,
    letterSpacing: 0.03,
  },
  form: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 30,
    shadowColor: '#2563eb',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 7,
  },
  input: {
    height: 48,
    borderWidth: 1.3,
    borderColor: '#e3eaff',
    borderRadius: 9,
    marginBottom: 18,
    paddingHorizontal: 14,
    fontSize: 17,
    fontWeight: '600',
    color: '#23242a',
    backgroundColor: '#f9fbff',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeIcon: {
    paddingHorizontal: 8,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 9,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
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
    marginTop: 12,
  },
  link: {
    color: '#2563eb',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.02,
  },
});
