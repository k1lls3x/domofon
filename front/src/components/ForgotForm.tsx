import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator
} from 'react-native';
import MaskInput from 'react-native-mask-input';
import { useTheme } from './Theme.Context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import {
  requestPasswordResetCode,
  verifyResetCode,
  resetPasswordByPhone
} from './rest';

const PHONE_MASK = [
  '+','7',' ', '(', /\d/,/\d/,/\d/,')',' ',
  /\d/,/\d/,/\d/,'-',/\d/,/\d/,'-',/\d/,/\d/
];

const RESEND_TIMEOUT = 60;

const isLatin = (str: string) =>
  /^[A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]+$/.test(str);

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
  if (field === 'phone' && (msg.includes('phone') || msg.includes('номер')))
    return 'Данный телефон не зарегистрирован';
  if (field === 'code' && (msg.includes('код') || msg.includes('code')))
    return 'Неверный код';
  return e?.message || 'Ошибка';
}

interface Props { onLogin: () => void; }

export const ForgotForm: React.FC<Props> = ({ onLogin }) => {
  const { theme } = useTheme();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [newPass, setNewPass] = useState('');
  const [hide, setHide] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const digits = phone.replace(/\D/g, '');
  const pass = checkPassword(newPass);

  // Таймер повторной отправки кода
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (step === 1) {
      setSecondsLeft(RESEND_TIMEOUT);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s <= 1) {
            timerRef.current && clearInterval(timerRef.current);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => { timerRef.current && clearInterval(timerRef.current); };
  }, [step]);

  const handleForgot = async () => {
    setErr('');
    if (digits.length !== 11) {
      setErr('Введите корректный номер');
      return;
    }
    setLoading(true);
    try {
      await requestPasswordResetCode(digits);
      setStep(1);
      setCode('');
    } catch (e: any) {
      setErr(formatErr(e, 'phone'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setErr('');
    if (code.length !== 4) {
      setErr('Введите код из 4 цифр');
      return;
    }
    setLoading(true);
    try {
      await verifyResetCode(digits, code);
      setStep(2);
      setNewPass('');
      Alert.alert('Код подтверждён', 'Введите новый пароль');
    } catch (e: any) {
      setErr(formatErr(e, 'code'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setErr('');
    setLoading(true);
    try {
      await requestPasswordResetCode(digits);
      setCode('');
      setSecondsLeft(RESEND_TIMEOUT);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s <= 1) {
            timerRef.current && clearInterval(timerRef.current);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
      Alert.alert('Код отправлен', 'Введите новый код из SMS');
    } catch (e: any) {
      setErr(formatErr(e, 'phone'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setErr('');
    if (
      !pass.length ||
      !pass.latin ||
      !pass.upper ||
      !pass.lower ||
      !pass.digit ||
      !pass.symbol
    ) {
      setErr('Пароль должен быть не менее 8 символов, с латиницей, заглавной, строчной буквой, цифрой и спецсимволом');
      return;
    }
    setLoading(true);
    try {
      await resetPasswordByPhone(digits, newPass);
      Alert.alert('Готово', 'Пароль успешно изменён!', [
        { text: 'Войти', onPress: onLogin }
      ]);
    } catch (e: any) {
      setErr(formatErr(e));
    } finally {
      setLoading(false);
    }
  };

  const resendTimeoutText = secondsLeft > 0
    ? `Запросить код повторно (${secondsLeft < 10 ? '0' : ''}${secondsLeft})`
    : 'Запросить код повторно';

  return (
    <View style={styles.outer}>
      <View style={styles.avatarWrap}>
        <MaterialCommunityIcons name="lock-outline" size={54} color="#ddd" />
      </View>
      <Text style={styles.sysTitle}>Восстановление пароля</Text>


      {/* Шаг 0 — ввод телефона */}
      {step === 0 && (
        <>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons
              name="phone-outline"
              size={22}
              color="#b4bac3"
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
                }
              ]}
              placeholder="Телефон"
              value={phone}
              onChangeText={setPhone}
              mask={PHONE_MASK}
              keyboardType="phone-pad"
              placeholderTextColor={theme.subtext}
            />
          </View>
          {err ? <Text style={styles.error}>{err}</Text> : null}
          <TouchableOpacity
            style={[styles.btn, digits.length !== 11 ? { opacity: 0.7 } : {}]}
            onPress={handleForgot}
            disabled={loading || digits.length !== 11}
            activeOpacity={digits.length === 11 ? 0.8 : 1}
          >
            <LinearGradient
              colors={['#2585f4', '#1b2b64']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.btnBg}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>Восстановить</Text>
              }
            </LinearGradient>
          </TouchableOpacity>
        </>
      )}

      {/* Шаг 1 — ввод кода */}
      {step === 1 && (
        <>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.inputBg,
                borderColor: theme.inputBorder,
                color: theme.text,
              }
            ]}
            placeholder="Код из SMS"
            value={code}
            onChangeText={setCode}
            keyboardType="numeric"
            maxLength={4}
            placeholderTextColor={theme.subtext}
          />
          {err ? <Text style={styles.error}>{err}</Text> : null}
          <TouchableOpacity
            style={[styles.btn, code.length !== 4 || secondsLeft === 0 ? { opacity: 0.7 } : {}]}
            onPress={handleVerifyCode}
            disabled={loading || code.length !== 4 || secondsLeft === 0}
            activeOpacity={code.length === 4 && secondsLeft > 0 ? 0.8 : 1}
          >
            <LinearGradient
              colors={['#2585f4', '#1b2b64']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.btnBg}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>Проверить код</Text>
              }
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleResendCode}
            disabled={loading || secondsLeft > 0}
            activeOpacity={secondsLeft > 0 ? 1 : 0.8}
            style={{ alignSelf: 'center', marginTop: 6 }}
          >
            <Text style={[
              styles.btnText,
              { color: secondsLeft > 0 ? '#bcc3cf' : '#2585f4', fontSize: 15 }
            ]}>
              {resendTimeoutText}
            </Text>
          </TouchableOpacity>
        </>
      )}

      {/* Шаг 2 — новый пароль */}
      {step === 2 && (
        <>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[
                styles.input,
                {
                  flex: 1,
                  backgroundColor: theme.inputBg,
                  borderColor: theme.inputBorder,
                  color: theme.text
                }
              ]}
              placeholder="Новый пароль"
              value={newPass}
              onChangeText={setNewPass}
              secureTextEntry={hide}
              placeholderTextColor={theme.subtext}
            />
            <TouchableOpacity
              style={styles.eye}
              onPress={() => setHide(h => !h)}
            >
              <MaterialCommunityIcons
                name={hide ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={theme.icon}
              />
            </TouchableOpacity>
          </View>
          <View style={{ marginBottom: 10, marginTop: 2, width: '100%' }}>
            <PasswordRule ok={pass.length} label="Не менее 8 символов" />
            <PasswordRule ok={pass.upper} label="Есть заглавная буква" />
            <PasswordRule ok={pass.lower} label="Есть строчная буква" />
            <PasswordRule ok={pass.digit} label="Есть цифра" />
            <PasswordRule ok={pass.symbol} label="Есть спецсимвол" />
          </View>
          {err ? <Text style={styles.error}>{err}</Text> : null}
          <TouchableOpacity
            style={[styles.btn, !pass.length || !pass.latin || !pass.upper || !pass.lower || !pass.digit || !pass.symbol ? { opacity: 0.7 } : {}]}
            onPress={handleResetPassword}
            disabled={loading || !pass.length || !pass.latin}
            activeOpacity={pass.length && pass.latin && pass.upper && pass.lower && pass.digit && pass.symbol ? 0.8 : 1}
          >
            <LinearGradient
              colors={['#2585f4', '#1b2b64']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.btnBg}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>Сменить пароль</Text>
              }
            </LinearGradient>
          </TouchableOpacity>
        </>
      )}

      <Text style={styles.footer}>© 2025 Домофон</Text>
    </View>
  );
};

const PasswordRule: React.FC<{ ok: boolean; label: string }> = ({
  ok,
  label
}) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2, width: '100%' }}>
    <MaterialCommunityIcons
      name={ok ? 'check-circle-outline' : 'close-circle-outline'}
      size={17}
      color={ok ? '#41d67a' : '#e43a4b'}
    />
    <Text style={{ color: ok ? '#41d67a' : '#e43a4b', marginLeft: 5, fontSize: 14 }}>
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  outer: {
    backgroundColor: "#fff",
    borderRadius: 26,
    padding: 28,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    shadowColor: '#23254b',
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
  marginBottom: 15, // увеличил с 4 до 20
  color: '#2d2d2d',
  letterSpacing: 0.01,
},

  sysWelcome: {
    fontSize: 14,
    color: '#bcc3cf',
    marginBottom: 12,
    textAlign: 'left',
    fontWeight: '500',
    alignSelf: 'flex-start',
    marginLeft: 16,
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
  inputWrapper: { position: 'relative', marginBottom: 11, width: '100%', justifyContent: 'center' },
  inputIcon: { position: 'absolute', left: 16, top: 13, zIndex: 2 },
  eye: { position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center', height: '100%' },
  btn: {
    width: '100%',
    borderRadius: 11,
    overflow: 'hidden',
    marginTop: 7,
    marginBottom: 7,
    height: 48,
    justifyContent: 'center',
  },
  btnBg: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 11,
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  btnText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#fff',
    letterSpacing: 0.04,
    zIndex: 1,
  },
  error: { fontSize: 13, marginLeft: 4, marginBottom: 6, fontWeight: '600', color: '#e43a4b', alignSelf: 'flex-start' },
  footer: {
    marginTop: 22,
    alignSelf: 'center',
    fontSize: 13,
    color: '#bcc3cf',
  },
});

export default ForgotForm;
