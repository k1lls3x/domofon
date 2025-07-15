import React, { useState } from 'react';
import {
  View, TextInput, TouchableOpacity, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MaskInput from 'react-native-mask-input';

interface Props { onLogin: () => void; }

const rules = [
  { ok: (p:string)=>/\d/.test(p),                          label:'Есть цифра' },
  { ok: (p:string)=>/[a-zA-Z]/.test(p),                   label:'Есть латиница'},
  { ok: (p:string)=>/[A-Z]/.test(p),                      label:'Есть заглавная' },
  { ok: (p:string)=>/[!@#$%^&*()_\-+=\[\]{};\'":,.<>/?\\|`~]/.test(p), label:'Есть символ'},
  { ok: (p:string)=>p.length>=8,                          label:'≥ 8 символов'},
];

export const RegisterForm: React.FC<Props> = ({ onLogin }) => {
  const [login,  setLogin ] = useState('');
  const [name,   setName  ] = useState('');
  const [surname,setSurname] = useState('');
  const [email,  setEmail ] = useState('');
  const [phone,  setPhone ] = useState('');
  const [pass1,  setPass1 ] = useState('');
  const [pass2,  setPass2 ] = useState('');
  const [hide1,  setHide1 ] = useState(true);
  const [hide2,  setHide2 ] = useState(true);
  const [load,   setLoad  ] = useState(false);

  const strong = rules.every(r=>r.ok(pass1));
  const API    = 'http://a7b7aa3ee7.vps.myjino.ru:49217/auth/register';

  const phoneMask = [
    '+', '7', ' ',
    '(', /\d/, /\d/, /\d/, ')', ' ',
    /\d/, /\d/, /\d/, '-',
    /\d/, /\d/, '-',
    /\d/, /\d/,
  ];

  const onRegister = async () => {
    if (!login||!name||!surname||!email||!phone||!pass1||!pass2) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }
    if (!strong) {
      Alert.alert('Ошибка', 'Пароль недостаточно надёжный');
      return;
    }
    if (pass1 !== pass2) {
      Alert.alert('Ошибка', 'Пароли не совпадают');
      return;
    }

    setLoad(true);
    try {
      const response = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: login,
          password: pass1,
          email,
          first_name: name,
          last_name: surname,
          phone,  // Отправляем с маской, можно при необходимости обработать
        }),
      });

      let data = null;
      try {
        data = await response.json();
      } catch {}

      if (!response.ok) {
        Alert.alert('Ошибка регистрации', data?.message || `Ошибка ${response.status}`);
        setLoad(false);
        return;
      }

      Alert.alert('Успех', 'Регистрация прошла успешно!');
      onLogin();

    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert('Ошибка', `Ошибка сети или сервера:\n${error.message}`);
      } else {
        Alert.alert('Ошибка', 'Неизвестная ошибка');
      }
    }
    setLoad(false);
  };

  return (
    <KeyboardAvoidingView
      style={{flex:1}}
      behavior={Platform.OS==='ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS==='ios'?60:0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView keyboardShouldPersistTaps='handled' contentContainerStyle={st.scroll}>
          <View style={st.card}>
            <Text style={st.h1}>Регистрация</Text>

            <TextInput style={st.input} placeholder="Логин"      value={login}   onChangeText={setLogin} autoCapitalize='none'/>
            <TextInput style={st.input} placeholder="Имя"        value={name}    onChangeText={setName} />
            <TextInput style={st.input} placeholder="Фамилия"    value={surname} onChangeText={setSurname}/>
            <TextInput style={st.input} placeholder="Email"      value={email}   onChangeText={setEmail}
                       autoCapitalize='none' keyboardType='email-address'/>

            <MaskInput
              style={st.input}
              placeholder="Телефон"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              mask={phoneMask}
            />

            <View style={st.pwBox}>
              <TextInput style={st.input} placeholder="Пароль" value={pass1}
                         onChangeText={setPass1} secureTextEntry={hide1} autoCapitalize='none'/>
              <TouchableOpacity style={st.eye} onPress={()=>setHide1(p=>!p)}>
                <MaterialCommunityIcons name={hide1?'eye-off-outline':'eye-outline'} size={20} color="#2563eb"/>
              </TouchableOpacity>
            </View>

            {!!pass1 && rules.map((r,i)=>(
              <Text key={i} style={{ color:r.ok(pass1)?'#28a745':'#f00', fontSize:13, marginLeft:5 }}>
                {r.ok(pass1)?'✓':'✗'} {r.label}
              </Text>
            ))}

            <View style={st.pwBox}>
              <TextInput style={st.input} placeholder="Подтвердите пароль" value={pass2}
                         onChangeText={setPass2} secureTextEntry={hide2} autoCapitalize='none'/>
              <TouchableOpacity style={st.eye} onPress={()=>setHide2(p=>!p)}>
                <MaterialCommunityIcons name={hide2?'eye-off-outline':'eye-outline'} size={20} color="#2563eb"/>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={st.btn} onPress={onRegister} disabled={load}>
              <Text style={st.btnText}>{load?'Загрузка…':'Зарегистрироваться'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{marginTop:18}} onPress={onLogin}>
              <Text style={st.link}>Войти</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const st = StyleSheet.create({
  scroll:{ flexGrow:1, justifyContent:'center', paddingVertical:24 },
  card :{ backgroundColor:'#fff', borderRadius:14, marginHorizontal:16, padding:20,
          elevation:2, shadowColor:'#000', shadowOpacity:0.04, shadowRadius:12 },
  h1   :{ fontSize:24,fontWeight:'900',textAlign:'center',marginBottom:22,color:'#222' },
  input:{ height:46, borderWidth:1, borderColor:'#e3eaff', backgroundColor:'#f9fbff',
          borderRadius:10, paddingHorizontal:16, fontSize:16, marginBottom:14, fontWeight:'600' },
  pwBox:{ position:'relative', justifyContent:'center', marginBottom:14 },
  eye  :{ position:'absolute', right:14, top:0, bottom:0,
          justifyContent:'center', alignItems:'center', zIndex:2 },
  btn  :{ marginTop:10, backgroundColor:'#2563eb', borderRadius:9, paddingVertical:13, alignItems:'center',
          shadowColor:'#2563eb', shadowOpacity:0.08, shadowOffset:{width:0, height:3}, shadowRadius:9, elevation:5 },
  btnText:{ color:'#fff', fontWeight:'900', fontSize:18 },
  link :{ color:'#2563eb', fontWeight:'700', fontSize:15.5, textAlign:'right' },
});
