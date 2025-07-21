import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import MaskInput from 'react-native-mask-input';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { register } from './rest';

interface Props { onLogin: () => void; }

const rules = [
  { ok: (p: string) => /\d/.test(p),        label: 'Есть цифра' },
  { ok: (p: string) => /[a-zA-Z]/.test(p),  label: 'Есть латиница' },
  { ok: (p: string) => /[A-Z]/.test(p),     label: 'Есть заглавная' },
  { ok: (p: string) => /[!@#$%^&*()_\-+=\[\]{};'"":,.<>\/?\\|`~]/.test(p), label: 'Есть символ' },
  { ok: (p: string) => p.length >= 8,       label: '≥ 8 символов' },
];

export const RegisterForm: React.FC<Props> = ({ onLogin }) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [pass1, setPass1] = useState('');
  const [pass2, setPass2] = useState('');
  const [hide1, setHide1] = useState(true);
  const [hide2, setHide2] = useState(true);
  const [loading, setLoading] = useState(false);

  const phoneMask = ['+','7',' ', '(', /\d/,/\d/,/\d/,')',' ',/\d/,/\d/,/\d/,'-',/\d/,/\d/,'-',/\d/,/\d/];
  const digits = phone.replace(/\D/g, '');

  const checks = rules.map(r => r.ok(pass1));
  const strong = checks.every(Boolean);

  const isValid =
    (step === 0 && name && surname && /^[\w\-\.]+@[\w\-]+\.[a-z]{2,}$/.test(email)) ||
    (step === 1 && digits.length === 11) ||
    (step === 2 && code.length === 4) ||
    (step === 3 && strong && pass1 === pass2);

  const nextStep = () => setStep(s => s + 1);

  const onRegisterPress = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      const resp = await register({
        first_name: name,
        last_name: surname,
        email,
        phone: digits,
        password: pass1,
      });
      Alert.alert('Успех', resp.message, [
        { text: 'OK', onPress: onLogin }
      ]);
    } catch (e: any) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <TextInput
              style={styles.input}
              placeholder="Имя"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            <TextInput
              style={styles.input}
              placeholder="Фамилия"
              value={surname}
              onChangeText={setSurname}
              autoCapitalize="words"
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </>
        );
      case 1:
        return (
          <MaskInput
            style={styles.input}
            placeholder="Телефон"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            mask={phoneMask}
          />
        );
      case 2:
        return (
          <TextInput
            style={styles.input}
            placeholder="Код из SMS (4 цифры)"
            keyboardType="numeric"
            value={code}
            onChangeText={setCode}
            maxLength={4}
          />
        );
      case 3:
        return (
          <>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Пароль"
                secureTextEntry={hide1}
                value={pass1}
                onChangeText={setPass1}
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.eye} onPress={() => setHide1(h => !h)}>
                <MaterialCommunityIcons
                  name={hide1 ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#3B6BF3"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Подтвердите пароль"
                secureTextEntry={hide2}
                value={pass2}
                onChangeText={setPass2}
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.eye} onPress={() => setHide2(h => !h)}>
                <MaterialCommunityIcons
                  name={hide2 ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#3B6BF3"
                />
              </TouchableOpacity>
            </View>
            {rules.map((r, i) => (
              <Text
                key={i}
                style={[styles.rule, { color: checks[i] ? '#28a745' : '#f00' }]}
              >
                {checks[i] ? '✓' : '✗'} {r.label}
              </Text>
            ))}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.center}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={60}
    >
      <View style={styles.form}>
        <Text style={styles.title}>Регистрация</Text>
        {renderStep()}
        <TouchableOpacity
          style={[styles.button, !isValid && styles.buttonDisabled]}
          onPress={step < 3 ? nextStep : onRegisterPress}
          disabled={!isValid || loading}
        >
          {loading
            ? <ActivityIndicator color="#FFF" />
            : <Text style={[styles.buttonText, !isValid && styles.buttonTextDisabled]}>
                {step < 3 ? 'Далее' : 'Зарегистрироваться'}
              </Text>
          }
        </TouchableOpacity>
        <TouchableOpacity onPress={onLogin} style={styles.back}>
          <Text style={styles.link}>Войти</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  form: {
    width: '92%',
    maxWidth: 400,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 24,
    color: '#222',
  },
  input: {
    height: 48,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D9E6',
    paddingHorizontal: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  eye: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  rule: {
    fontSize: 13,
    marginLeft: 4,
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#3B6BF3',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#E6EAFD',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
  buttonTextDisabled: {
    color: '#BFC9DE',
  },
  back: {
    marginTop: 20,
    alignSelf: 'center',
  },
  link: {
    color: '#3B6BF3',
    fontSize: 16,
    fontWeight: '600',
  },
});
