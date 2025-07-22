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

const isLatin = (str: string) => /^[A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]+$/.test(str);

const checkPassword = (password: string) => ({
  length: password.length >= 8,
  latin: isLatin(password),
  upper: /[A-Z]/.test(password),
  lower: /[a-z]/.test(password),
  digit: /\d/.test(password),
  symbol: /[^A-Za-z0-9]/.test(password),
});

function formatErr(e: any, field?: string) {
  const msg = (typeof e === 'string' ? e : (e?.message || '')).toLowerCase();
  if (field === 'username' && msg.includes('username')) return 'Этот username уже занят';
  if (field === 'phone' && (msg.includes('phone') || msg.includes('номер'))) return 'Аккаунт с этим номером уже существует';
  if (field === 'code' && (msg.includes('код') || msg.includes('code') || msg.includes('not valid') || msg.includes('incorrect'))) return 'Неверный код';
  if (msg.includes('username')) return 'Этот username уже занят';
  if (msg.includes('phone') || msg.includes('номер')) return 'Аккаунт с этим номером уже существует';
  if (msg.includes('код') || msg.includes('code') || msg.includes('not valid') || msg.includes('incorrect')) return 'Неверный код';
  return e?.message || 'Ошибка';
}

interface Props { onLogin: () => void; }

export const RegisterForm: React.FC<Props> = ({ onLogin }) => {
  const { theme } = useTheme();
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);

  const [phone, setPhone] = useState('');
  const digits = phone.replace(/\D/g, '');

  const [code, setCode] = useState('');
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [email, setEmail] = useState('');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [hide, setHide] = useState(true);
  const [hide2, setHide2] = useState(true);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [userErr, setUserErr] = useState('');

  const pass = checkPassword(password);

  // Шаг 0: отправка телефона (и проверка на уникальность — сервер сам всё валидирует!)
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
      setCode('');
      Alert.alert('Код отправлен', 'Введите код из SMS');
    } catch (e: any) {
      setErr(formatErr(e, 'phone'));
    } finally {
      setLoading(false);
    }
  };

  // Шаг 1: подтверждение кода
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
    } catch (e: any) {
      setErr(formatErr(e, 'code'));
    } finally {
      setLoading(false);
    }
  };

  // Шаг 3: регистрация (unique username — только при сабмите!)
  const onRegister = async () => {
    setErr('');
    setUserErr('');
    if (
      !first_name || !last_name || !email ||
      !username ||
      !pass.length || !pass.latin || !pass.upper || !pass.lower || !pass.digit || !pass.symbol ||
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
      const msg = formatErr(e);
      if (msg.includes('username')) setUserErr(msg);
      else setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  const validStep0 = digits.length === 11;
  const validStep1 = code.length === 4;
  const validStep2 = !!first_name && !!last_name && /^[\w\-\.]+@[\w\-]+\.[a-z]{2,}$/.test(email);
  const validStep3 =
    !!username &&
    pass.length && pass.latin && pass.upper && pass.lower && pass.digit && pass.symbol &&
    password === password2 && !userErr;

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
            <Text style={{ color: '#e43a4b', marginTop: 8 }}>{err}</Text>
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
            <Text style={{ color: '#e43a4b', marginTop: 8 }}>{err}</Text>
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
            <Text style={{ color: '#e43a4b', marginTop: 8 }}>{err}</Text>
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
    {/* Сообщение об ошибке username — НАД инпутом */}
    {userErr.length > 0 && (
      <Text style={{
        color: '#e43a4b',
        marginBottom: 6,
        marginLeft: 2,
        fontSize: 14
      }}>
        {userErr}
      </Text>
    )}

    <TextInput
      style={[
        styles.input,
        { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }
      ]}
      placeholder="Username"
      value={username}
      onChangeText={t => {
        setUsername(t);
        setUserErr('');
      }}
      placeholderTextColor={theme.subtext}
      autoCapitalize="none"
    />

    <View style={styles.inputWrap}>
      <TextInput
        style={[
          styles.input,
          { flex: 1, backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text, marginBottom: 0 }
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
          { flex: 1, backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text, marginBottom: 0 }
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
    <View style={{marginBottom: 8, marginTop: 2}}>
      <PasswordRule ok={pass.length} label="Не менее 8 символов" />
      <PasswordRule ok={pass.upper} label="Есть заглавная буква" />
      <PasswordRule ok={pass.lower} label="Есть строчная буква" />
      <PasswordRule ok={pass.digit} label="Есть цифра" />
      <PasswordRule ok={pass.symbol} label="Есть спецсимвол" />
      <PasswordRule ok={password === password2 && password2.length > 0} label="Пароли совпадают" />
    </View>
    {err.length > 0 && (
      <Text style={{ color: '#e43a4b', marginTop: 8 }}>{err}</Text>
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

const PasswordRule: React.FC<{ ok: boolean; label: string }> = ({ ok, label }) => (
  <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 2}}>
    <MaterialCommunityIcons name={ok ? "check-circle-outline" : "close-circle-outline"} size={17} color={ok ? "#41d67a" : "#e43a4b"} />
    <Text style={{color: ok ? "#41d67a" : "#e43a4b", marginLeft: 5, fontSize: 14}}>{label}</Text>
  </View>
);

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