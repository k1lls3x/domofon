import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator
} from 'react-native';
import MaskInput from 'react-native-mask-input';
import { forgotPassword, verifyPhone, resetPassword } from './rest';
import { useTheme } from './Theme.Context';


const PHONE_MASK = ['+','7',' ', '(', /\d/,/\d/,/\d/,')',' ',/\d/,/\d/,/\d/,'-',/\d/,/\d/,'-',/\d/,/\d/];

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

  // 1. Отправить код на телефон
  const handleForgot = async () => {
    setErr('');
    if (digits.length !== 11) {
      setErr('Введите корректный номер');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(digits);
      setStep(1);
      Alert.alert('Код отправлен', 'Введите код из SMS');
    } catch (e: any) {
      setErr(e.message || 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  // 2. Верификация кода
  const handleVerifyCode = async () => {
    setErr('');
    if (code.length !== 4) {
      setErr('Введите код из 4 цифр');
      return;
    }
    setLoading(true);
    try {
      await verifyPhone(digits, code);
      setStep(2);
      Alert.alert('Код подтверждён', 'Придумайте новый пароль.');
    } catch (e: any) {
      setErr(e.message || 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  // 3. Смена пароля
  const handleResetPassword = async () => {
    setErr('');
    if (newPass.length < 6 || !/[A-Za-z]/.test(newPass) || !/\d/.test(newPass)) {
      setErr('Пароль должен быть минимум 6 символов, содержать буквы и цифры');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(digits, newPass);
      Alert.alert('Готово', 'Пароль успешно изменён!', [{ text: 'Войти', onPress: onLogin }]);
    } catch (e: any) {
      setErr(e.message || 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.form, { backgroundColor: theme.card }]}>
      <Text style={[styles.title, { color: theme.text }]}>Восстановление пароля</Text>

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
          <TouchableOpacity
            style={[
              styles.btn,
              digits.length !== 11 ? { backgroundColor: theme.btnDisabled } : { backgroundColor: theme.btn }
            ]}
            onPress={handleForgot}
            disabled={loading || digits.length !== 11}
            activeOpacity={digits.length === 11 ? 0.8 : 1}
          >
            {loading
              ? <ActivityIndicator color={theme.btnText} />
              : <Text style={[
                  styles.btnText,
                  digits.length !== 11 ? { color: theme.btnTextDisabled } : { color: theme.btnText }
                ]}>Восстановить</Text>
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
          <TouchableOpacity
            style={[
              styles.btn,
              code.length !== 4 ? { backgroundColor: theme.btnDisabled } : { backgroundColor: theme.btn }
            ]}
            onPress={handleVerifyCode}
            disabled={loading || code.length !== 4}
            activeOpacity={code.length === 4 ? 0.8 : 1}
          >
            {loading
              ? <ActivityIndicator color={theme.btnText} />
              : <Text style={[
                  styles.btnText,
                  code.length !== 4 ? { color: theme.btnTextDisabled } : { color: theme.btnText }
                ]}>Проверить код</Text>
            }
          </TouchableOpacity>
        </>
      )}

      {step === 2 && (
        <>
          <View style={styles.inputWrap}>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }
              ]}
              placeholder="Новый пароль"
              value={newPass}
              onChangeText={setNewPass}
              secureTextEntry={hide}
              placeholderTextColor={theme.subtext}
            />
            <TouchableOpacity style={styles.eye} onPress={() => setHide(h => !h)}>
              <Text style={{ color: theme.icon, fontSize: 18, paddingHorizontal: 10 }}>
                {hide ? '👁️' : '🚫'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={{ color: theme.subtext, fontSize: 12, marginLeft: 6 }}>
            Минимум 6 символов, обязательно буквы и цифры
          </Text>
          <TouchableOpacity
            style={[
              styles.btn,
              newPass.length < 6 || !/[A-Za-z]/.test(newPass) || !/\d/.test(newPass)
                ? { backgroundColor: theme.btnDisabled }
                : { backgroundColor: theme.btn }
            ]}
            onPress={handleResetPassword}
            disabled={loading || newPass.length < 6 || !/[A-Za-z]/.test(newPass) || !/\d/.test(newPass)}
            activeOpacity={newPass.length >= 6 && /[A-Za-z]/.test(newPass) && /\d/.test(newPass) ? 0.8 : 1}
          >
            {loading
              ? <ActivityIndicator color={theme.btnText} />
              : <Text style={[
                  styles.btnText,
                  newPass.length < 6 || !/[A-Za-z]/.test(newPass) || !/\d/.test(newPass)
                    ? { color: theme.btnTextDisabled }
                    : { color: theme.btnText }
                ]}>Сменить пароль</Text>
            }
          </TouchableOpacity>
        </>
      )}

      {err.length > 0 && (
        <Text style={{ color: '#e43a4b', marginTop: 8 }}>{err}</Text>
      )}

      <TouchableOpacity
        onPress={() => {
          if (step > 0) {
            if (step === 2) setStep(1);
            else if (step === 1) setStep(0);
            setErr('');
            if (step === 1) setCode('');
            if (step === 2) setNewPass('');
          } else {
            onLogin();
          }
        }}
        style={styles.back}
      >
        <Text style={[styles.link, { color: theme.icon }]}>Назад</Text>
      </TouchableOpacity>
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
    marginTop: 18,
    marginBottom: 8,
  },
  btnText: { fontWeight: '900', fontSize: 18, letterSpacing: 0.05 },
  back: { marginTop: 18, alignSelf: 'center' },
  link: { fontWeight: '700', fontSize: 15.5 },
  inputWrap: { flexDirection: 'row', alignItems: 'center' },
  eye: { position: 'absolute', right: 10, top: 0, bottom: 0, justifyContent: 'center', height: '100%' },
});

export default ForgotForm;
