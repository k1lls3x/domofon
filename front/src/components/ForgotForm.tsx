// ForgotForm.tsx

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

  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (step === 1) {
      setSecondsLeft(RESEND_TIMEOUT);
      timerRef.current && clearInterval(timerRef.current);
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
      timerRef.current && clearInterval(timerRef.current);
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
    if (!pass.length || !pass.latin || !pass.upper || !pass.lower || !pass.digit || !pass.symbol) {
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
    <View style={[styles.outer, { backgroundColor: theme.cardBg    }]}>
      <View style={styles.avatarWrap}>
        <MaterialCommunityIcons name="lock-outline" size={54} color={theme.icon} />
      </View>

      <Text style={[styles.sysTitle, { color: theme.text }]}>
        Восстановление пароля
      </Text>

      {/* Шаг 0 – ввод телефона */}
      {step === 0 && (
        <>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons
              name="phone-outline"
              size={22}
              color={theme.subtext}
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
              placeholderTextColor={theme.subtext}
              value={phone}
              onChangeText={setPhone}
              mask={PHONE_MASK}
              keyboardType="phone-pad"
            />
          </View>
          {err ? <Text style={[styles.error, { color: theme.error }]}> {err} </Text> : null}
          <TouchableOpacity
            style={[styles.btn, digits.length !== 11 && { opacity: 0.7 }]}
            onPress={handleForgot}
            disabled={loading || digits.length !== 11}
          >
            <LinearGradient
              colors={[theme.gradientStart, theme.gradientEnd]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.btnBg}
            >
              {loading
                ? <ActivityIndicator color={theme.btnText} />
                : <Text style={[styles.btnText, { color: theme.btnText }]}>Восстановить</Text>
              }
            </LinearGradient>
          </TouchableOpacity>
        </>
      )}

      {/* Шаг 1 – ввод кода */}
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
            placeholderTextColor={theme.subtext}
            value={code}
            onChangeText={setCode}
            keyboardType="numeric"
            maxLength={4}
          />
          {err ? <Text style={[styles.error, { color: theme.error }]}>{err}</Text> : null}
          <TouchableOpacity
            style={[styles.btn, (code.length !== 4 || secondsLeft === 0) && { opacity: 0.7 }]}
            onPress={handleVerifyCode}
            disabled={loading || code.length !== 4 || secondsLeft === 0}
          >
            <LinearGradient
              colors={[theme.gradientStart, theme.gradientEnd]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.btnBg}
            >
              {loading
                ? <ActivityIndicator color={theme.btnText} />
                : <Text style={[styles.btnText, { color: theme.btnText }]}>Проверить код</Text>
              }
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleResendCode}
            disabled={loading || secondsLeft > 0}
          >
            <Text style={[
              styles.resendText,
              { color: secondsLeft > 0 ? theme.subtext : theme.link }
            ]}>
              {resendTimeoutText}
            </Text>
          </TouchableOpacity>
        </>
      )}

      {/* Шаг 2 – новый пароль */}
      {step === 2 && (
        <>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.inputBorder,
                  color: theme.text,
                }
              ]}
              placeholder="Новый пароль"
              placeholderTextColor={theme.subtext}
              value={newPass}
              onChangeText={setNewPass}
              secureTextEntry={hide}
            />
            <TouchableOpacity style={styles.eye} onPress={() => setHide(h => !h)}>
              <MaterialCommunityIcons
                name={hide ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={theme.icon}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.rules}>
            <PasswordRule ok={pass.length} label="Не менее 8 символов" />
            <PasswordRule ok={pass.upper}  label="Есть заглавная буква" />
            <PasswordRule ok={pass.lower}  label="Есть строчная буква" />
            <PasswordRule ok={pass.digit}  label="Есть цифра" />
            <PasswordRule ok={pass.symbol} label="Есть спецсимвол" />
          </View>

          {err ? <Text style={[styles.error, { color: theme.error }]}>{err}</Text> : null}
          <TouchableOpacity
            style={[styles.btn, !(pass.latin && pass.upper && pass.lower && pass.digit && pass.symbol) && { opacity: 0.7 }]}
            onPress={handleResetPassword}
            disabled={loading || !(pass.latin && pass.upper && pass.lower && pass.digit && pass.symbol)}
          >
            <LinearGradient
              colors={[theme.gradientStart, theme.gradientEnd]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.btnBg}
            >
              {loading
                ? <ActivityIndicator color={theme.btnText} />
                : <Text style={[styles.btnText, { color: theme.btnText }]}>Сменить пароль</Text>
              }
            </LinearGradient>
          </TouchableOpacity>
        </>
      )}

      <Text style={[styles.footer, { color: theme.subtext }]}>© 2025 Домофон</Text>
    </View>
  );
};

const PasswordRule: React.FC<{ ok: boolean; label: string }> = ({ ok, label }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.ruleRow}>
      <MaterialCommunityIcons
        name={ok ? 'check-circle-outline' : 'close-circle-outline'}
        size={17}
        color={ok ? theme.success : theme.error}
      />
      <Text style={{ marginLeft: 6, fontSize: 14, color: ok ? theme.success : theme.error }}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    borderRadius: 26,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.11,
    shadowRadius: 24,
    elevation: 9,
    marginTop: 0,
  },
  avatarWrap: {
    marginBottom: 12,
    alignItems: 'center',
  },
  sysTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 12,
    width: '100%',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: 14,
    zIndex: 1,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 6,
    width: '100%',
  },
  eye: {
    position: 'absolute', right: 12, top: 0, bottom: 0,
    justifyContent: 'center',
  },
  btn: {
    marginTop: 12,
    marginBottom: 12,
    width: '100%',
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
  },
  btnBg: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },
  btnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  rules: {
    marginBottom: 12,
    width: '100%',
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  error: {
    fontSize: 13,
    marginBottom: 8,
  },
  resendText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 8,
  },
  footer: {
    marginTop: 16,
    fontSize: 13,
    textAlign: 'center',
  },
});

export default ForgotForm;
