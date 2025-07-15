import React, { useState } from 'react';
import {
  View, TextInput, TouchableOpacity, Text, StyleSheet, Alert,
  ScrollView, KeyboardAvoidingView, Platform,
  TouchableWithoutFeedback, Keyboard,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  onRegister: () => void;
  onForgot:   () => void;
}

export const LoginForm: React.FC<Props> = ({ onRegister, onForgot }) => {
  const [login, setLogin]     = useState('');
  const [pass , setPass ]     = useState('');
  const [hide , setHide ]     = useState(true);
  const [loading, setLoad]    = useState(false);

  const API = 'http://a7b7aa3ee7.vps.myjino.ru:49217';

  const onLogin = async () => {
  if (!login || !pass) {
    Alert.alert('Ошибка', 'Заполни все поля');
    return;
  }
  setLoad(true);
  try {
    const r = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: login, password: pass }),
    });

    let d;
    try {
      d = await r.json();
    } catch {
      d = null; // если тело не JSON, просто null
    }

    if (!r.ok) {
      Alert.alert('Ошибка', d && d.message ? d.message : 'Неверный логин или пароль');
      setLoad(false);
      return;
    }

    Alert.alert('Успех', 'Вы вошли!');
  } catch (e) {
    Alert.alert('Ошибка', 'Сеть или сервер недоступны');
  }
  setLoad(false);
};


  return (
    <KeyboardAvoidingView
      style={{ flex:1 }}
      behavior={Platform.OS==='ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS==='ios'?60:0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView keyboardShouldPersistTaps='handled' contentContainerStyle={st.scroll}>
          <View>
            <Text style={st.title}>Вход</Text>

            <TextInput
              style={st.input}
              placeholder="Логин или телефон"
              placeholderTextColor="#b7c4e1"
              value={login}
              onChangeText={setLogin}
              autoCapitalize='none'
              autoCorrect={false}
            />

            <View style={st.pwBox}>
              <TextInput
                style={st.input}
                placeholder="Пароль"
                placeholderTextColor="#b7c4e1"
                value={pass}
                onChangeText={setPass}
                secureTextEntry={hide}
                autoCapitalize='none'
                autoCorrect={false}
              />
              <TouchableOpacity style={st.eyeIcon} onPress={()=>setHide(p=>!p)} activeOpacity={0.7}>
                <MaterialCommunityIcons
                  name={hide ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#2563eb"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={st.button} onPress={onLogin} disabled={loading}>
              <Text style={st.btnText}>{loading ? 'Загрузка…' : 'Войти'}</Text>
            </TouchableOpacity>

            <View style={st.links}>
              <TouchableOpacity onPress={onForgot}><Text style={st.link}>Забыли пароль?</Text></TouchableOpacity>
              <TouchableOpacity onPress={onRegister}><Text style={st.link}>Регистрация</Text></TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const st = StyleSheet.create({
  scroll:{ flexGrow:1, justifyContent:'center', paddingVertical:24 },

  title:{ fontSize:24,fontWeight:'900',textAlign:'center',marginBottom:22,color:'#222' },

  input:{
    height:46,borderWidth:1,borderColor:'#e3eaff',backgroundColor:'#f9fbff',
    borderRadius:10,paddingHorizontal:16,fontSize:16,marginBottom:15,fontWeight:'600',
  },

  pwBox:{ position:'relative',justifyContent:'center',marginBottom:15 },

  eyeIcon: {
  position: 'absolute',
  right: 14,
  top: 0,
  bottom: 0,
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 2,
},


  button:{ marginTop:10,backgroundColor:'#2563eb',borderRadius:9,paddingVertical:13,alignItems:'center',
           shadowColor:'#2563eb',shadowOpacity:0.08,shadowOffset:{width:0,height:3},shadowRadius:9,elevation:5 },
  btnText:{ color:'#fff',fontWeight:'900',fontSize:18 },

  links:{ flexDirection:'row',justifyContent:'space-between',marginTop:20 },
  link :{ color:'#2563eb',fontWeight:'700',fontSize:15.5 },
});
