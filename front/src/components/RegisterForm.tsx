import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import MaskInput from 'react-native-mask-input';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from './Theme.Context'; // твоя тема
import { SafeAreaView } from 'react-native';

import {
  requestRegistrationCode,
  verifyPhone,
  register
} from './rest';

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
  if ((field === 'phone' || msg.includes('phone') || msg.includes('номер') || msg.includes('существ')) && !msg.includes('username'))
    return 'Пользователь с этим номером уже существует';
  if ((field === 'username' || msg.includes('username')) && !msg.includes('phone'))
    return 'Этот username уже занят';
  if (field === 'code' && (msg.includes('код') || msg.includes('code') || msg.includes('not valid') || msg.includes('incorrect'))) return 'Неверный код';
  if (msg.includes('код') || msg.includes('code') || msg.includes('not valid') || msg.includes('incorrect')) return 'Неверный код';
  return e?.message || 'Ошибка';
}

interface Props { onLogin: () => void; }

const RESEND_TIMEOUT = 60;

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

  // Таймер повторного запроса кода
  const [codeTimeout, setCodeTimeout] = useState(RESEND_TIMEOUT);
  const codeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (step === 1) {
      setCodeTimeout(RESEND_TIMEOUT);
      if (codeTimerRef.current) clearInterval(codeTimerRef.current);
      codeTimerRef.current = setInterval(() => {
        setCodeTimeout((prev) => {
          if (prev <= 1) {
            if (codeTimerRef.current) clearInterval(codeTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (codeTimerRef.current) clearInterval(codeTimerRef.current);
    };
  }, [step]);

  const resendTimeoutText = codeTimeout > 0
    ? `Запросить код повторно (${codeTimeout < 10 ? '0' : ''}${codeTimeout})`
    : 'Запросить код повторно';

  // Отправка телефона (шаг 0)
  const onSendPhone = async () => {
    setErr('');
    if (digits.length !== 11) {
      setErr('Введите корректный номер');
      return;
    }
    setLoading(true);
    try {
      await requestRegistrationCode(digits);
      setStep(1);
      setCode('');
      Alert.alert('Код отправлен', 'Введите код из SMS');
    } catch (e: any) {
      setErr(formatErr(e, 'phone'));
    } finally {
      setLoading(false);
    }
  };

  // Подтверждение кода (шаг 1)
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

  // Повторный запрос кода
  const onResendCode = async () => {
    setErr('');
    setLoading(true);
    try {
      await requestRegistrationCode(digits);
      setCode('');
      setCodeTimeout(RESEND_TIMEOUT);
      codeTimerRef.current && clearInterval(codeTimerRef.current);
      codeTimerRef.current = setInterval(() => {
        setCodeTimeout((prev) => {
          if (prev <= 1) {
            codeTimerRef.current && clearInterval(codeTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      Alert.alert('Код отправлен', 'Введите новый код из SMS');
    } catch (e: any) {
      setErr(formatErr(e, 'phone'));
    } finally {
      setLoading(false);
    }
  };

  // Регистрация (шаг 3)
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

  // ---------- UI ----------
  return (
    <View style={styles.root}>
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  style={{ flex: 1, width: '100%' }}
  keyboardVerticalOffset={40}
>
  <ScrollView
    contentContainerStyle={{
      flexGrow: 1,
      justifyContent: 'flex-start', // <-- заменено
      alignItems: 'center',         // добавь
      minHeight: '100%',
    }}
    keyboardShouldPersistTaps="handled"
  >
    <View style={styles.card}>
          <MaterialCommunityIcons name="account-circle" size={56} color="#d2dae2" style={styles.logo} />
          {/* Убрана лишняя надпись */}
          <Text style={styles.subtitle}>Добро пожаловать! Создайте свой аккаунт.</Text>

        {step === 0 && (
  <>
    <InputWithIcon
      icon="phone-outline"
      placeholder="Телефон"
      value={phone}
      onChangeText={setPhone}
      keyboardType="phone-pad"
      mask={PHONE_MASK}
    />
    {err.length > 0 && (
      <Text style={styles.err}>{err}</Text>
    )}
    <GradientButton
      text="Далее"
      onPress={onSendPhone}
      loading={loading}
      disabled={!validStep0 || loading}
    />
    <TouchableOpacity onPress={onLogin} style={{ alignSelf: 'center', marginTop: 6 }}>
      <Text style={styles.link}>Уже есть аккаунт?</Text>
    </TouchableOpacity>
  </>
)}

            {step === 1 && (
            <>

              <InputWithIcon
                icon="message-processing-outline"
                placeholder="Код из SMS"
                value={code}
                onChangeText={setCode}
                keyboardType="numeric"
                maxLength={4}
              />
              {err.length > 0 && (
                <Text style={styles.err}>{err}</Text>
              )}
              <GradientButton
                text="Далее"
                onPress={onCheckCode}
                loading={loading}
                disabled={!validStep1 || loading}
              />
              <TouchableOpacity
                style={[
                  styles.btn,
                  codeTimeout > 0
                    ? { backgroundColor: '#e6eaf0' }
                    : { backgroundColor: 'transparent' }
                ]}
                onPress={onResendCode}
                disabled={loading || codeTimeout > 0}
                activeOpacity={codeTimeout > 0 ? 1 : 0.8}
              >
                <Text style={[
                  styles.btnText,
                  codeTimeout > 0 ? { color: '#bcc3cf' } : { color: '#3567d9' }
                ]}>
                  {resendTimeoutText}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {step === 2 && (
            <>
              <InputWithIcon
                icon="account-outline"
                placeholder="Имя"
                value={first_name}
                onChangeText={setFirstName}
              />
              <InputWithIcon
                icon="account-outline"
                placeholder="Фамилия"
                value={last_name}
                onChangeText={setLastName}
              />
              <InputWithIcon
                icon="email-outline"
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {err.length > 0 && (
                <Text style={styles.err}>{err}</Text>
              )}
              <GradientButton
                text="Далее"
                onPress={() => setStep(3)}
                disabled={!validStep2 || loading}
              />
            </>
          )}

          {step === 3 && (
            <>
              {userErr.length > 0 && (
                <Text style={{ color: '#e43a4b', marginBottom: 6, marginLeft: 2, fontSize: 14 }}>
                  {userErr}
                </Text>
              )}
              <InputWithIcon
                icon="account-outline"
                placeholder="Username"
                value={username}
                onChangeText={(t: string) => {
                  setUsername(t);
                  setUserErr('');
                }}
                autoCapitalize="none"
              />

              <PasswordInput
                placeholder="Пароль"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={hide}
                onToggleVisibility={() => setHide(h => !h)}
                visible={!hide}
              />
              <PasswordInput
                placeholder="Подтвердите пароль"
                value={password2}
                onChangeText={setPassword2}
                secureTextEntry={hide2}
                onToggleVisibility={() => setHide2(h => !h)}
                visible={!hide2}
              />

              <View style={{marginBottom: 10, marginTop: 2}}>
                <PasswordRule ok={pass.length} label="Не менее 8 символов" />
                <PasswordRule ok={pass.upper} label="Есть заглавная буква" />
                <PasswordRule ok={pass.lower} label="Есть строчная буква" />
                <PasswordRule ok={pass.digit} label="Есть цифра" />
                <PasswordRule ok={pass.symbol} label="Есть спецсимвол" />
                <PasswordRule ok={password === password2 && password2.length > 0} label="Пароли совпадают" />
              </View>
              {err.length > 0 && (
                <Text style={styles.err}>{err}</Text>
              )}
              <GradientButton
                text="Зарегистрироваться"
                onPress={onRegister}
                loading={loading}
                disabled={!validStep3 || loading}
              />
            </>
          )}

          <Text style={styles.footer}>© 2025 Домофон</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

// ---------- Компоненты ----------

const InputWithIcon = ({
  icon,
  mask,
  ...props
}: any) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
    <MaterialCommunityIcons name={icon} size={22} color="#b4bac3" style={{ position: 'absolute', left: 16, zIndex: 2 }} />
    {mask ? (
      <MaskInput
        {...props}
        style={[styles.input, { paddingLeft: 44 }]}
        mask={mask}
        placeholderTextColor="#bcc3cf"
      />
    ) : (
      <TextInput
        {...props}
        style={[styles.input, { paddingLeft: 44 }]}
        placeholderTextColor="#bcc3cf"
      />
    )}
  </View>
);

const PasswordInput = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  onToggleVisibility,
  visible
}: any) => (
  <View style={styles.inputWrap}>
    <TextInput
      style={[styles.input, { flex: 1, paddingLeft: 44, marginBottom: 0 }]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      autoCapitalize="none"
      placeholderTextColor="#bcc3cf"
    />
    <MaterialCommunityIcons name="lock-outline" size={22} color="#b4bac3" style={{ position: 'absolute', left: 16, zIndex: 2 }} />
    <TouchableOpacity style={styles.eye} onPress={onToggleVisibility}>
      <MaterialCommunityIcons name={visible ? 'eye-outline' : 'eye-off-outline'} size={22} color="#b4bac3" />
    </TouchableOpacity>
  </View>
);

const GradientButton = ({ text, onPress, loading, disabled }: any) => (
  <TouchableOpacity
    style={[styles.btn, disabled ? { opacity: 0.8 } : {}]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={disabled ? 1 : 0.85}
  >
    <LinearGradient
      colors={['#2a7cf7', '#08184a']}
      start={[0, 0]}
      end={[1, 0]}
      style={styles.gradient}
    />
    {loading
      ? <ActivityIndicator color="#fff" />
      : <Text style={styles.btnText}>{text}</Text>
    }
  </TouchableOpacity>
);

const PasswordRule: React.FC<{ ok: boolean; label: string }> = ({ ok, label }) => (
  <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 2}}>
    <MaterialCommunityIcons name={ok ? "check-circle-outline" : "close-circle-outline"} size={17} color={ok ? "#41d67a" : "#e43a4b"} />
    <Text style={{color: ok ? "#41d67a" : "#e43a4b", marginLeft: 5, fontSize: 14}}>{label}</Text>
  </View>
);

// ---------- Стили ----------

const styles = StyleSheet.create({
root: {
  flex: 1,
  backgroundColor: '#f5f6fa',
  alignItems: 'center',
  minHeight: '100%',
},

card: {
  width: '94%',
  // maxWidth: 380,      // убрать!
  paddingVertical: 24,   // вместо 38, чуть меньше
  paddingHorizontal: 24,
  backgroundColor: 'white',
  borderRadius: 26,
  marginTop: 42,         // как у LoginForm
  marginBottom: 18,      // добавить!
  alignItems: 'center',
  // ... остальные стили
},



  logo: {
    alignSelf: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
    color: '#222c32',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#8f98a6',
    marginBottom: 18,
  },
input: {
  width: '100%',
  height: 50,
  borderRadius: 14,
  borderWidth: 1.5,
  borderColor: '#e6eaf0',
  backgroundColor: '#f8fafd',
  paddingHorizontal: 18,
  fontSize: 16.5,
  fontWeight: '600'
},
  btn: {
    borderRadius: 13,
    overflow: 'hidden',
    width: '100%',
    marginTop: 4,
    marginBottom: 8,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 13,
    zIndex: 0,
  },
  btnText: {
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: 0.05,
    color: '#fff',
    zIndex: 1,
  },
  link: {
    alignSelf: 'flex-end',
    color: '#367cf6',
    marginTop: 7,
    fontWeight: '600',
    fontSize: 15,
  },
  footer: {
    marginTop: 22,
    alignSelf: 'center',
    fontSize: 13,
    color: '#bcc3cf',
  },
  err: {
    color: '#e43a4b',
    marginBottom: 7,
    fontSize: 15,
    textAlign: 'left',
    marginLeft: 4
  },
inputWrap: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 14,
  position: 'relative',
  width: '100%',
},
  eye: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    height: '100%'
  },
});

export default RegisterForm;
