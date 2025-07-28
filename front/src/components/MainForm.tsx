import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import UserProfile, { User } from './UserProfile';

// Для теста — имитируем получение пользователя
const mockUser: User = {
  id: 1,
  username: 'timur',
  email: 'timur@example.com',
  phone: '+79991234567',
  first_name: 'Тимур',
  last_name: 'Иванов',
  created_at: '2024-07-27T10:42:00',
};

type TabKey = 'home' | 'video' | 'history' | 'devices' | 'profile';

const MainScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setTimeout(() => setUser(mockUser), 500);
  }, []);

  // Мок-события
  const events = [
    { type: 'call', time: '09:54', text: 'Вызов с подъезда', avatar: 'https://i.pravatar.cc/40?img=12' },
    { type: 'open', time: '09:56', text: 'Открыта дверь', avatar: 'https://i.pravatar.cc/40?img=13' },
    { type: 'call', time: '11:23', text: 'Вызов с домофона', avatar: 'https://i.pravatar.cc/40?img=11' },
  ];

  // Контент для каждой вкладки
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <ScrollView contentContainerStyle={styles.scroll}>
            {user && <UserProfile user={user} />}

            <LinearGradient
              colors={['#f5fbff', '#d2e4fa']}
              style={styles.actionCard}
            >
              <Text style={styles.actionTitle}>Домофон</Text>
              <Text style={styles.actionSubtitle}>Быстро открыть дверь</Text>
              <TouchableOpacity style={styles.doorButton}>
                <Text style={styles.doorButtonText}>Открыть дверь</Text>
              </TouchableOpacity>
            </LinearGradient>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>2</Text>
                <Text style={styles.statLabel}>Звонка сегодня</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>1</Text>
                <Text style={styles.statLabel}>Открыто дверей</Text>
              </View>
            </View>

            <Text style={styles.eventsTitle}>События</Text>
            {events.map((ev, i) => (
              <View key={i} style={styles.eventCard}>
                <Image source={{ uri: ev.avatar }} style={styles.eventAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventText}>{ev.text}</Text>
                  <Text style={styles.eventTime}>{ev.time}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        );
      case 'video':
        return (
          <View style={styles.centerTab}>
            <Text style={styles.tabTitle}>Видеозвонок</Text>
            <View style={styles.videoStub}>
              <Text style={{ color: '#aab3c7' }}>Тут будет видео с камеры</Text>
            </View>
            <TouchableOpacity style={styles.doorButton}>
              <Text style={styles.doorButtonText}>Открыть дверь</Text>
            </TouchableOpacity>
          </View>
        );
      case 'history':
        return (
          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={styles.tabTitle}>История событий</Text>
            {events.map((ev, i) => (
              <View key={i} style={styles.eventCard}>
                <Image source={{ uri: ev.avatar }} style={styles.eventAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.eventText}>{ev.text}</Text>
                  <Text style={styles.eventTime}>{ev.time}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        );
      case 'devices':
        return (
          <View style={styles.centerTab}>
            <Text style={styles.tabTitle}>Устройства</Text>
            <TouchableOpacity style={styles.deviceButton}>
              <Text style={styles.deviceButtonText}>Открыть ворота</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deviceButton}>
              <Text style={styles.deviceButtonText}>Включить свет</Text>
            </TouchableOpacity>
            {/* Здесь будут ваши устройства, добавляй новые по мере разработки */}
          </View>
        );
      case 'profile':
        return (
          <ScrollView contentContainerStyle={styles.scroll}>
            {user && <UserProfile user={user} />}
            {/* Кнопка выхода и настройки можно добавить здесь */}
            <TouchableOpacity style={styles.logoutButton}>
              <Text style={styles.logoutText}>Выйти</Text>
            </TouchableOpacity>
          </ScrollView>
        );
    }
  };

  // Табы, эмодзи можно заменить на иконки
  const tabs = [
    { key: 'home', label: 'Главная', icon: '🏠' },
    { key: 'video', label: 'Видео', icon: '🎥' },
    { key: 'history', label: 'История', icon: '📜' },
    { key: 'devices', label: 'Устройства', icon: '🔌' },
    { key: 'profile', label: 'Профиль', icon: '👤' },
  ] as const;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>{renderTabContent()}</View>
      <View style={styles.tabBar}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabBarItem}
            activeOpacity={0.85}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[
              styles.tabBarIcon,
              activeTab === tab.key && { color: '#1E69DE' }
            ]}>
              {tab.icon}
            </Text>
            <Text style={[
              styles.tabBarLabel,
              activeTab === tab.key && { color: '#1E69DE' }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // ... (все твои старые стили)
  root: { flex: 1, backgroundColor: '#f7f9fb' },
  scroll: { paddingHorizontal: 14, paddingTop: 8, paddingBottom: 28 },
  actionCard: {
    backgroundColor: '#eaf2ff',
    borderRadius: 18,
    padding: 22,
    marginVertical: 18,
    alignItems: 'center',
    shadowColor: '#0d2d62',
    shadowOpacity: 0.04,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 5 },
    elevation: 1,
  },
  actionTitle: { fontSize: 20, fontWeight: '700', color: '#1E69DE', marginBottom: 2 },
  actionSubtitle: { color: '#6a7e95', fontSize: 14, marginBottom: 18 },
  doorButton: {
    backgroundColor: '#1E69DE',
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  doorButtonText: { color: '#fff', fontWeight: '700', fontSize: 17, letterSpacing: 0.5 },
  statsRow: { flexDirection: 'row', marginBottom: 16, marginTop: 10, gap: 13 },
  statCard: {
    flex: 1,
  backgroundColor: '#f7f9fb',
      borderRadius: 14,
      padding: 18,
      alignItems: 'center',
      shadowColor: '#1E69DE',
      shadowOpacity: 0.04,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 1,
    },
  statValue: { color: '#1E69DE', fontWeight: '800', fontSize: 24, marginBottom: 3 },
  statLabel: { color: '#7e8ca4', fontWeight: '600', fontSize: 13 },
  eventsTitle: { fontSize: 18, color: '#222', fontWeight: '700', marginTop: 22, marginBottom: 6, marginLeft: 2 },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 13,
    padding: 13,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  eventAvatar: { width: 38, height: 38, borderRadius: 19, marginRight: 13, backgroundColor: '#e2e4f0' },
  eventText: { fontSize: 15, color: '#282a36', fontWeight: '600' },
  eventTime: { fontSize: 13, color: '#8d98a8', marginTop: 2, fontWeight: '500' },
  // TABBAR
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 32,
    height: 66,
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: Platform.OS === 'ios' ? 22 : 8,
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    zIndex: 5,
  },
  tabBarItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabBarIcon: { fontSize: 25, marginBottom: 1, color: '#B0B7C2' },
  tabBarLabel: { fontSize: 12, color: '#B0B7C2', fontWeight: '700' },
  // VIDEO STUB
  centerTab: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7f9fb' },
  tabTitle: { fontSize: 21, fontWeight: '700', color: '#1E69DE', marginBottom: 24 },
  videoStub: {
    width: 260,
    height: 180,
    backgroundColor: '#e9e9ef',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  // DEVICES
  deviceButton: {
    backgroundColor: '#3DD598',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 18,
  },
  deviceButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  // PROFILE
  logoutButton: {
    backgroundColor: '#E43A4B',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 36,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  logoutText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});

export default MainScreen;
