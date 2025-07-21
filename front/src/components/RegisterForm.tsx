import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator
} from 'react-native';
import MaskInput from 'react-native-mask-input';
import { useTheme } from './Theme.Context';
import { requestPhoneVerification, verifyPhone, register } from './rest';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PHONE_MASK = ['+','7',' ', '(', /\d/,/\d/,/\d/,')',' ',/\d/,/\d/,/\d/,'-',/\d/,/\d/,'-',/\d/,/\d/];

interface Props { onLogin: () => void; }

export const RegisterForm: React.FC<Props> = ({ onLogin }) => {
  const { theme } = useTheme();
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);

  // Step 0
  const [phone, setPhone] = useState('');
  const digits = phone.replace(/\D/g, '');

  // Step 1
  const [code, setCode] = useState('');

  // Step 2
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [email, setEmail] = useState('');

  // Step 3
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [hide, setHide] = useState(true);
  const [hide2, setHide2] = useState(true);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  // Step 0: отправить код на телефон
  const onSendPhone = async () => {
    setErr('');
    if (digits.length !== 11) {
      setErr('Введите корректный номер');
      return;
    }
    setLoading(true);
    try {
      await requestPhoneVerification(digits);
      setStep(1);
      Alert.alert('Код отправлен', 'Введите код из SMS');
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: верификация кода
  const onCheckCode = async () => {
    setErr('');
    if (code.length !== 4) {
      setErr('Введите 4-значный код');
      return;
    }
    setLoading(true);
    try {
      await verifyPhone(digits, code);
      setStep(2);
      Alert.alert('Код подтверждён', 'Заполните имя, фамилию и email');
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: регистрация (отправить все данные)
  const onRegister = async () => {
    setErr('');
    if (
      !first_name || !last_name || !email ||
      !username ||
      password.length < 6 ||
      !/[A-Za-z]/.test(password) ||
      !/\d/.test(password) ||
      password !== password2 ||
      !/^[\w\-\.]+@[\w\-]+\.[a-z]{2,}$/.test(email)
    ) {
      setErr('Заполните все поля корректно');
      return;
    }
    setLoading(true);
    try {
      await register({
        username,
        password,
        email,
        phone: digits,
        role: 'user',
        first_name,
        last_name,
      });
      Alert.alert('Успех', 'Регистрация завершена!', [{ text: 'Войти', onPress: onLogin }]);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Валидации
  const validStep0 = digits.length === 11;
  const validStep1 = code.length === 4;
  const validStep2 = !!first_name && !!last_name && /^[\w\-\.]+@[\w\-]+\.[a-z]{2,}$/.test(email);
  const validStep3 = !!username && password.length >= 6 && /[A-Za-z]/.test(password) && /\d/.test(password) && password === password2;

  return (
    <View style={[styles.form, { backgroundColor: theme.card }]}>
      <Text style={[styles.title, { color: theme.text }]}>Регистрация</Text>

      {step === 0 && (
        <>
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
          {err.length > 0 && (
            <Text style={{ color: '#e43a4b', marginTop: 8, marginBottom: 2 }}>{err}</Text>
          )}
          <TouchableOpacity
            style={[
              styles.btn,
              !validStep0 ? { backgroundColor: theme.btnDisabled } : { backgroundColor: theme.btn }
            ]}
            onPress={onSendPhone}
            disabled={loading || !validStep0}
            activeOpacity={validStep0 ? 0.8 : 1}
          >
            {loading
              ? <ActivityIndicator color={theme.btnText} />
              : <Text style={[
                  styles.btnText,
                  !validStep0 ? { color: theme.btnTextDisabled } : { color: theme.btnText }
                ]}>Далее</Text>
            }
          </TouchableOpacity>
        </>
      )}

      {step === 1 && (
        <>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }
            ]}
            placeholder="Код из SMS"
            value={code}
            onChangeText={setCode}
            keyboardType="numeric"
            maxLength={4}
            placeholderTextColor={theme.subtext}
          />
          {err.length > 0 && (
            <Text style={{ color: '#e43a4b', marginTop: 8, marginBottom: 2 }}>{err}</Text>
          )}
          <TouchableOpacity
            style={[
              styles.btn,
              !validStep1 ? { backgroundColor: theme.btnDisabled } : { backgroundColor: theme.btn }
            ]}
            onPress={onCheckCode}
            disabled={loading || !validStep1}
            activeOpacity={validStep1 ? 0.8 : 1}
          >
            {loading
              ? <ActivityIndicator color={theme.btnText} />
              : <Text style={[
                  styles.btnText,
                  !validStep1 ? { color: theme.btnTextDisabled } : { color: theme.btnText }
                ]}>Далее</Text>
            }
          </TouchableOpacity>
        </>
      )}

      {step === 2 && (
        <>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }
            ]}
            placeholder="Имя"
            value={first_name}
            onChangeText={setFirstName}
            placeholderTextColor={theme.subtext}
          />
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }
            ]}
            placeholder="Фамилия"
            value={last_name}
            onChangeText={setLastName}
            placeholderTextColor={theme.subtext}
          />
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }
            ]}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={theme.subtext}
          />
          {err.length > 0 && (
            <Text style={{ color: '#e43a4b', marginTop: 8, marginBottom: 2 }}>{err}</Text>
          )}
          <TouchableOpacity
            style={[
              styles.btn,
              !validStep2 ? { backgroundColor: theme.btnDisabled } : { backgroundColor: theme.btn }
            ]}
            onPress={() => setStep(3)}
            disabled={loading || !validStep2}
            activeOpacity={validStep2 ? 0.8 : 1}
          >
            <Text style={[
              styles.btnText,
              !validStep2 ? { color: theme.btnTextDisabled } : { color: theme.btnText }
            ]}>Далее</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 3 && (
        <>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }
            ]}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            placeholderTextColor={theme.subtext}
            autoCapitalize="none"
          />
          <View style={styles.inputWrap}>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text, marginBottom: 0 }
              ]}
              placeholder="Пароль"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={hide}
              placeholderTextColor={theme.subtext}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.eye} onPress={() => setHide(h => !h)}>
              <MaterialCommunityIcons name={hide ? 'eye-off-outline' : 'eye-outline'} size={22} color={theme.icon} />
            </TouchableOpacity>
          </View>
          <View style={styles.inputWrap}>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text, marginBottom: 0 }
              ]}
              placeholder="Подтвердите пароль"
              value={password2}
              onChangeText={setPassword2}
              secureTextEntry={hide2}
              placeholderTextColor={theme.subtext}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.eye} onPress={() => setHide2(h => !h)}>
              <MaterialCommunityIcons name={hide2 ? 'eye-off-outline' : 'eye-outline'} size={22} color={theme.icon} />
            </TouchableOpacity>
          </View>
          <Text style={{ color: theme.subtext, fontSize: 12, marginLeft: 6, marginBottom: 6 }}>
            Минимум 6 символов, буквы и цифры. Пароли должны совпадать.
          </Text>
          {err.length > 0 && (
            <Text style={{ color: '#e43a4b', marginTop: 8, marginBottom: 2 }}>{err}</Text>
          )}
          <TouchableOpacity
            style={[
              styles.btn,
              !validStep3 ? { backgroundColor: theme.btnDisabled } : { backgroundColor: theme.btn }
            ]}
            onPress={onRegister}
            disabled={loading || !validStep3}
            activeOpacity={validStep3 ? 0.8 : 1}
          >
            {loading
              ? <ActivityIndicator color={theme.btnText} />
              : <Text style={[
                  styles.btnText,
                  !validStep3 ? { color: theme.btnTextDisabled } : { color: theme.btnText }
                ]}>Зарегистрироваться</Text>
            }
          </TouchableOpacity>
        </>
      )}
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
    fontWeight: '600'
  },
  btn: {
    borderRadius: 13,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  btnText: { fontWeight: '900', fontSize: 18, letterSpacing: 0.05 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  eye: { position: 'absolute', right: 10, top: 0, bottom: 0, justifyContent: 'center', height: '100%' },
});

export default RegisterForm;
