import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface RegisterFormProps {
  onSuccess?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [secureTextConfirm, setSecureTextConfirm] = useState(true);

  const onRegister = async () => {
    if (!username || !password || !passwordConfirm) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }
    if (password !== passwordConfirm) {
      Alert.alert('Ошибка', 'Пароли не совпадают');
      return;
    }

    try {
      const response = await fetch('http://a7b7aa3ee7.vps.myjino.ru:49217/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Ошибка регистрации:', data);
        Alert.alert('Ошибка регистрации', data.message || 'Не удалось зарегистрироваться');
        return;
      }

      Alert.alert('Успех', 'Регистрация прошла успешно!');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Ошибка запроса:', error);
      Alert.alert('Ошибка', 'Ошибка сети или сервера');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Логин"
              placeholderTextColor="#92a3c5"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              keyboardType="default"
            />
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[styles.input, { paddingRight: 40 }]}
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
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[styles.input, { paddingRight: 40 }]}
                placeholder="Подтвердите пароль"
                placeholderTextColor="#92a3c5"
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                secureTextEntry={secureTextConfirm}
              />
              <TouchableOpacity
                onPress={() => setSecureTextConfirm(!secureTextConfirm)}
                style={styles.eyeIcon}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={secureTextConfirm ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Кнопки внизу под формой */}
          <View style={styles.links}>
            <TouchableOpacity>
              <Text style={styles.link}>Забыли пароль?</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.link}>Регистрация</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.button, { marginTop: 12 }]} onPress={onRegister}>
            <Text style={styles.buttonText}>Зарегистрироваться</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f7f8fa',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 30,
    shadowColor: '#2563eb',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 7,
    marginBottom: 12,
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
    position: 'relative',
    marginBottom: 18,
    justifyContent: 'center',
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: '50%',
    marginTop: -10,
    zIndex: 10,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 9,
    paddingVertical: 14,
    alignItems: 'center',
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
  },
  link: {
    color: '#2563eb',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.02,
  },
});
