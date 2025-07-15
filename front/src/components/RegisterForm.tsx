import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface RegisterFormProps {
  onLogin: () => void;
}

const passwordChecks = [
  { check: (p: string) => /\d/.test(p), label: 'Есть цифра' },
  { check: (p: string) => /[a-zA-Z]/.test(p), label: 'Есть латинская буква' },
  { check: (p: string) => /[A-Z]/.test(p), label: 'Есть заглавная латинская буква' },
  { check: (p: string) => /[!@#$%^&*()_\-+=\[\]{};\'":,.<>/?\\|`~]/.test(p), label: 'Есть символ' },
  { check: (p: string) => p.length >= 8, label: 'Минимум 8 символов' },
];

export const RegisterForm: React.FC<RegisterFormProps> = ({ onLogin }) => {
  const [login, setLogin]                     = useState('');
  const [fullName, setFullName]               = useState('');
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [secure1, setSecure1]                 = useState(true);
  const [secure2, setSecure2]                 = useState(true);
  const [loading, setLoading]                 = useState(false);

  const API = 'http://a7b7aa3ee7.vps.myjino.ru:49217';
  const strong = passwordChecks.every(r => r.check(password));

  const onRegister = async () => {
    if (!login || !fullName || !email || !password || !passwordConfirm) {
      Alert.alert('Ошибка', 'Заполни все поля'); return;
    }
    if (!strong)                { Alert.alert('Ошибка', 'Пароль ненадёжный'); return; }
    if (password !== passwordConfirm) { Alert.alert('Ошибка', 'Пароли не совпадают'); return; }

    setLoading(true);
    try {
      const r = await fetch(`${API}/auth/register`, {
        method : 'POST',
        headers: { 'Content-Type':'application/json' },
        body   : JSON.stringify({ username: login, password, email, full_name: fullName }),
      });
      const d = await r.json();
      if (!r.ok) { Alert.alert('Ошибка', d.message || 'Регистрация не удалась'); setLoading(false); return; }

      Alert.alert('Успех', 'Регистрация прошла успешно!');
      await fetch(`${API}/auth/login`, {
        method : 'POST',
        headers: { 'Content-Type':'application/json' },
        body   : JSON.stringify({ username: login, password }),
      });
      onLogin();
    } catch { Alert.alert('Ошибка','Сеть/сервер недоступны'); }
    setLoading(false);
  };

  /* ---------- UI ---------- */
  return (
    <KeyboardAvoidingView
      style={{ flex:1, backgroundColor:'#fff' }}
      behavior={Platform.OS==='ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS==='ios' ? 60 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.scroll}>
          <View style={s.box}>
            <Text style={s.title}>Регистрация</Text>

            <TextInput style={s.input} placeholder="Логин"          value={login}     onChangeText={setLogin}     placeholderTextColor="#b7c4e1" autoCapitalize="none" autoCorrect={false}/>
            <TextInput style={s.input} placeholder="Имя и фамилия"  value={fullName}  onChangeText={setFullName}  placeholderTextColor="#b7c4e1"/>
            <TextInput style={s.input} placeholder="Email"          value={email}     onChangeText={setEmail}     placeholderTextColor="#b7c4e1" keyboardType="email-address" autoCapitalize="none" autoCorrect={false}/>

            {/* пароль */}
            <View style={s.pwWrap}>
              <TextInput style={s.input} placeholder="Пароль"
                value={password} onChangeText={setPassword}
                placeholderTextColor="#b7c4e1" secureTextEntry={secure1}
                autoCapitalize="none" autoCorrect={false}
              />
              <TouchableOpacity onPress={()=>setSecure1(p=>!p)} style={s.eye} activeOpacity={0.7}>
                <MaterialCommunityIcons name={secure1?'eye-off-outline':'eye-outline'} size={20} color="#2563eb"/>
              </TouchableOpacity>
            </View>

            {/* подсказки */}
            {!!password && passwordChecks.map((r,i)=>(
              <Text key={i} style={{ color:r.check(password)?'#28a745':'#f00', fontSize:13, marginLeft:5 }}>
                {r.check(password)?'✓':'✗'} {r.label}
              </Text>
            ))}

            {/* подтверждение */}
            <View style={s.pwWrap}>
              <TextInput style={s.input} placeholder="Подтвердите пароль"
                value={passwordConfirm} onChangeText={setPasswordConfirm}
                placeholderTextColor="#b7c4e1" secureTextEntry={secure2}
                autoCapitalize="none" autoCorrect={false}
              />
              <TouchableOpacity onPress={()=>setSecure2(p=>!p)} style={s.eye} activeOpacity={0.7}>
                <MaterialCommunityIcons name={secure2?'eye-off-outline':'eye-outline'} size={20} color="#2563eb"/>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={s.button} onPress={onRegister} disabled={loading}>
              <Text style={s.btnText}>{loading?'Загрузка…':'Зарегистрироваться'}</Text>
            </TouchableOpacity>

            <View style={s.links}>
              <TouchableOpacity onPress={onLogin}><Text style={s.link}>Войти</Text></TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  scroll:{ flexGrow:1, justifyContent:'center' },

  box:{
    backgroundColor:'#fff', borderRadius:14, marginHorizontal:14, padding:20,
    elevation:2, shadowColor:'#000', shadowOpacity:0.04, shadowRadius:12,
  },

  title:{ fontSize:24, fontWeight:'900', textAlign:'center', marginBottom:22, color:'#222' },

  input:{
    height:46, borderWidth:1, borderColor:'#e3eaff', backgroundColor:'#f9fbff',
    borderRadius:10, paddingHorizontal:16, fontSize:16, marginBottom:14, fontWeight:'600',
  },

  pwWrap:{ position:'relative', justifyContent:'center' },
  eye   :{ position:'absolute', right:14, top:'50%', marginTop:-10 },

  button:{ marginTop:10, backgroundColor:'#2563eb', borderRadius:9, paddingVertical:13, alignItems:'center',
           shadowColor:'#2563eb', shadowOpacity:0.08, shadowOffset:{width:0,height:3}, shadowRadius:9, elevation:5 },
  btnText:{ color:'#fff', fontWeight:'900', fontSize:18 },

  links:{ marginTop:18, alignItems:'flex-end' },
  link :{ color:'#2563eb', fontWeight:'700', fontSize:15.5 },
});
