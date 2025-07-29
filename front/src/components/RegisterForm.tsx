import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TextInput,
} from 'react-native';
import MaskInput from 'react-native-mask-input';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './Theme.Context';

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
    <View
      style={[
        styles.outer,
        {
          backgroundColor: theme.cardBg,
          shadowColor: theme.shadow,
        }
      ]}
    >
      {/* Аватар */}
      <View style={styles.avatarWrap}>
        <MaterialCommunityIcons name="account-circle" size={54} color={theme.icon} />
      </View>
      {/* Заголовок и описание */}
      <Text style={[styles.sysTitle, { color: theme.text }]}>Домофон</Text>
      <Text style={[styles.sysWelcome, { color: theme.subtext }]}>Создайте свой аккаунт</Text>

      {step === 0 && (
        <>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons
              name="phone-outline"
              size={22}
              color={theme.icon}
              style={styles.inputIcon}
            />
            <MaskInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.inputBorder,
                  color: theme.text,
                  paddingLeft: 46,
                },
              ]}
              placeholder="Телефон"
              value={phone}
              onChangeText={setPhone}
              mask={PHONE_MASK}
              keyboardType="phone-pad"
              placeholderTextColor={theme.subtext}
            />
          </View>
          {err.length > 0 && <Text style={[styles.error, { color: theme.error ?? '#e43a4b' }]}>{err}</Text>}

          <TouchableOpacity
            style={[styles.btn, !validStep0 ? { opacity: 0.7 } : {}]}
            onPress={onSendPhone}
            disabled={!validStep0 || loading}
            activeOpacity={validStep0 ? 0.8 : 1}
          >
            <LinearGradient
              colors={[theme.gradientStart, theme.gradientEnd]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[styles.btnBg, !validStep0 && { opacity: 0.8 }]}
            >
              {loading
                ? <ActivityIndicator color={theme.buttonText} />
                : <Text style={[styles.btnText, { color: theme.buttonText }]}>Далее</Text>
              }
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={onLogin} style={{ marginTop: 8 }}>
            <Text style={[styles.linkRight, { color: theme.link }]}>Уже есть аккаунт?</Text>
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
          {err.length > 0 && <Text style={[styles.error, { color: theme.error ?? '#e43a4b' }]}>{err}</Text>}

          <TouchableOpacity
            style={[styles.btn, !validStep1 ? { opacity: 0.7 } : {}]}
            onPress={onCheckCode}
            disabled={!validStep1 || loading}
            activeOpacity={validStep1 ? 0.8 : 1}
          >
            <LinearGradient
              colors={[theme.gradientStart, theme.gradientEnd]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[styles.btnBg, !validStep1 && { opacity: 0.8 }]}
            >
              {loading
                ? <ActivityIndicator color={theme.buttonText} />
                : <Text style={[styles.btnText, { color: theme.buttonText }]}>Далее</Text>
              }
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onResendCode}
            disabled={loading || codeTimeout > 0}
            activeOpacity={codeTimeout > 0 ? 1 : 0.8}
            style={{ alignSelf: 'center', marginTop: 6 }}
          >
            <Text style={[
              styles.resend,
              codeTimeout > 0 ? { color: theme.subtext } : { color: theme.link }
            ]}>
              {resendTimeoutText}
            </Text>
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
          {err.length > 0 && <Text style={[styles.error, { color: theme.error ?? '#e43a4b' }]}>{err}</Text>}

          <TouchableOpacity
            style={[styles.btn, !validStep2 ? { opacity: 0.7 } : {}]}
            onPress={() => setStep(3)}
            disabled={!validStep2 || loading}
            activeOpacity={validStep2 ? 0.8 : 1}
          >
            <LinearGradient
              colors={[theme.gradientStart, theme.gradientEnd]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[styles.btnBg, !validStep2 && { opacity: 0.8 }]}
            >
              <Text style={[styles.btnText, { color: theme.buttonText }]}>Далее</Text>
            </LinearGradient>
          </TouchableOpacity>
        </>
      )}

      {step === 3 && (
        <>
          {userErr.length > 0 && (
            <Text style={{ color: theme.error ?? '#e43a4b', marginBottom: 6, marginLeft: 2, fontSize: 14 }}>
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
            autoCapitalize="none"
            placeholderTextColor={theme.subtext}
          />
          <View style={styles.inputWrapper}>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }
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
          <View style={styles.inputWrapper}>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }
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
          <View style={{marginBottom: 10, marginTop: 2, width: '100%'}}>
            <PasswordRule ok={pass.length} label="Не менее 8 символов" />
            <PasswordRule ok={pass.upper} label="Есть заглавная буква" />
            <PasswordRule ok={pass.lower} label="Есть строчная буква" />
            <PasswordRule ok={pass.digit} label="Есть цифра" />
            <PasswordRule ok={pass.symbol} label="Есть спецсимвол" />
            <PasswordRule ok={password === password2 && password2.length > 0} label="Пароли совпадают" />
          </View>
          {err.length > 0 && <Text style={[styles.error, { color: theme.error ?? '#e43a4b' }]}>{err}</Text>}

          <TouchableOpacity
            style={[styles.btn, !validStep3 ? { opacity: 0.7 } : {}]}
            onPress={onRegister}
            disabled={!validStep3 || loading}
            activeOpacity={validStep3 ? 0.8 : 1}
          >
            <LinearGradient
              colors={[theme.gradientStart, theme.gradientEnd]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[styles.btnBg, !validStep3 && { opacity: 0.8 }]}
            >
              {loading
                ? <ActivityIndicator color={theme.buttonText} />
                : <Text style={[styles.btnText, { color: theme.buttonText }]}>Зарегистрироваться</Text>
              }
            </LinearGradient>
          </TouchableOpacity>
        </>
      )}

      <Text style={[styles.footer, { color: theme.subtext }]}>© 2025 Домофон</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    borderRadius: 26,
    padding: 28,
    width: '97%',
    alignSelf: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.11,
    shadowRadius: 24,
    elevation: 9,
    marginTop: 0,
  },
  avatarWrap: {
    marginTop: 2,
    marginBottom: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sysTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 0.01,
  },
  sysWelcome: {
    fontSize: 15,
    marginBottom: 14,
    textAlign: 'center',
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.2,
    paddingHorizontal: 16,
    fontSize: 16.5,
    marginBottom: 11,
    fontWeight: '500',
    width: '100%',
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 11,
    width: '100%',
    justifyContent: 'center',
  },
  eye: { position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' },
  btn: {
    width: '100%',
    borderRadius: 11,
    overflow: 'hidden',
    marginTop: 7,
    marginBottom: 7,
    height: 48,
  },
  btnBg: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 11,
  },
  btnText: {
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.04,
  },
  linkRight: {
    fontWeight: '600',
    fontSize: 15.5,
    textAlign: 'right',
    paddingRight: 3,
    paddingTop: 2,
  },
  error: { fontSize: 13, marginLeft: 4, marginBottom: 6, fontWeight: '600' },
  footer: {
    marginTop: 22,
    alignSelf: 'center',
    fontSize: 13,
  },
  resend: {
    fontWeight: '600',
    fontSize: 15,
    textAlign: 'center',
    alignSelf: 'center',
    marginTop: 6,
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 2,
    top: 13,
  },
});

// PasswordRule также с поддержкой theme
const PasswordRule: React.FC<{ ok: boolean; label: string }> = ({ ok, label }) => {
  const { theme } = useTheme();
  return (
    <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 2, width: '100%' }}>
      <MaterialCommunityIcons name={ok ? "check-circle-outline" : "close-circle-outline"} size={17} color={ok ? theme.link : (theme.error ?? "#e43a4b")} />
      <Text style={{color: ok ? theme.link : (theme.error ?? "#e43a4b"), marginLeft: 5, fontSize: 14}}>{label}</Text>
    </View>
  );
};

export default RegisterForm;
