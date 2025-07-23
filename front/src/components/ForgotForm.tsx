import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator
} from 'react-native';
import MaskInput from 'react-native-mask-input';
import {
  requestPasswordResetCode,
  verifyResetCode,
  resetPasswordByPhone
} from './rest';
import { useTheme } from './Theme.Context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PHONE_MASK = [
  '+','7',' ', '(', /\d/,/\d/,/\d/,')',' ',
  /\d/,/\d/,/\d/,'-',/\d/,/\d/,'-',/\d/,/\d/
];

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

  // --- Таймер ---
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (step === 1) {
      setSecondsLeft(300); // 5 минут
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

  const formatTimer = () => {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };
  // -----------

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
      Alert.alert('Код отправлен', 'Введите код из SMS');
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

  return (
    <View style={[styles.form, { backgroundColor: theme.card }]}>
      <Text style={[styles.title, { color: theme.text }]}>
        Восстановление пароля
      </Text>

      {step === 0 && (
        <>
          <MaskInput
            style={[
              styles.input,
              {
                backgroundColor: theme.inputBg,
                borderColor: theme.inputBorder,
                color: theme.text
              }
            ]}
            placeholder="Телефон"
            value={phone}
            onChangeText={setPhone}
            mask={PHONE_MASK}
            keyboardType="phone-pad"
            placeholderTextColor={theme.subtext}
          />
          {err ? <Text style={styles.error}>{err}</Text> : null}
          <TouchableOpacity
            style={[
              styles.btn,
              digits.length !== 11
                ? { backgroundColor: theme.btnDisabled }
                : { backgroundColor: theme.btn }
            ]}
            onPress={handleForgot}
            disabled={loading || digits.length !== 11}
          >
            {loading ? (
              <ActivityIndicator color={theme.btnText} />
            ) : (
              <Text
                style={[
                  styles.btnText,
                  digits.length !== 11
                    ? { color: theme.btnTextDisabled }
                    : { color: theme.btnText }
                ]}
              >
                Восстановить
              </Text>
            )}
          </TouchableOpacity>
        </>
      )}

      {step === 1 && (
        <>
          <Text style={{ textAlign: 'center', color: theme.subtext, marginBottom: 6 }}>
            Время на ввод кода: {formatTimer()}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.inputBg,
                borderColor: theme.inputBorder,
                color: theme.text
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
            style={[
              styles.btn,
              code.length !== 4 || secondsLeft === 0
                ? { backgroundColor: theme.btnDisabled }
                : { backgroundColor: theme.btn }
            ]}
            onPress={handleVerifyCode}
            disabled={loading || code.length !== 4 || secondsLeft === 0}
          >
            {loading ? (
              <ActivityIndicator color={theme.btnText} />
            ) : (
              <Text
                style={[
                  styles.btnText,
                  code.length !== 4 || secondsLeft === 0
                    ? { color: theme.btnTextDisabled }
                    : { color: theme.btnText }
                ]}
              >
                Проверить код
              </Text>
            )}
          </TouchableOpacity>
        </>
      )}

      {step === 2 && (
        <>
          <View style={styles.inputWrap}>
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
          <View style={{ marginBottom: 8, marginTop: 2 }}>
            <PasswordRule ok={pass.length} label="Не менее 8 символов" />
            <PasswordRule ok={pass.upper} label="Есть заглавная буква" />
            <PasswordRule ok={pass.lower} label="Есть строчная буква" />
            <PasswordRule ok={pass.digit} label="Есть цифра" />
            <PasswordRule ok={pass.symbol} label="Есть спецсимвол" />
          </View>
          {err ? <Text style={styles.error}>{err}</Text> : null}
          <TouchableOpacity
            style={[
              styles.btn,
              !pass.length ||
              !pass.latin ||
              !pass.upper ||
              !pass.lower ||
              !pass.digit ||
              !pass.symbol
                ? { backgroundColor: theme.btnDisabled }
                : { backgroundColor: theme.btn }
            ]}
            onPress={handleResetPassword}
            disabled={loading || !pass.length || !pass.latin}
          >
            {loading ? (
              <ActivityIndicator color={theme.btnText} />
            ) : (
              <Text
                style={[
                  styles.btnText,
                  !pass.length
                    ? { color: theme.btnTextDisabled }
                    : { color: theme.btnText }
                ]}
              >
                Сменить пароль
              </Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const PasswordRule: React.FC<{ ok: boolean; label: string }> = ({
  ok,
  label
}) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
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
  form: {
    borderRadius: 18,
    padding: 22,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center'
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
    marginBottom: 8
  },
  btnText: { fontWeight: '900', fontSize: 18, letterSpacing: 0.05 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  eye: { position: 'absolute', right: 10, top: 0, bottom: 0, justifyContent: 'center', height: '100%' },
  error: { color: '#e43a4b', marginTop: 8 },
});

export default ForgotForm;
