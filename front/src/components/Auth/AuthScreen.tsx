import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { LoginForm } from '../LoginForm';
import { RegisterForm } from '../RegisterForm';
import { styles } from './AuthScreen.styles';

export const AuthScreen = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f7f8fa' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'login' && styles.activeTab]}
              onPress={() => setActiveTab('login')}
            >
              <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>Вход</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'register' && styles.activeTab]}
              onPress={() => setActiveTab('register')}
            >
              <Text style={[styles.tabText, activeTab === 'register' && styles.activeTabText]}>Регистрация</Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};
