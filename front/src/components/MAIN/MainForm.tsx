import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Platform, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserProfile, { User } from './UserProfile';

type TabKey = 'home' | 'video' | 'history' | 'devices' | 'profile';

interface Event {
  avatar: string;
  text: string;
  time: string;
  type: string;
}

interface MainFormProps {
  onLogout: () => void;
}

const API_URL = 'http://194.84.56.147:8080';

const MainForm: React.FC<MainFormProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const handleAvatarChanged = (newAvatarUrl: string) => {
    setUser((prev) => prev ? { ...prev, avatarUrl: newAvatarUrl } : prev);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (!token) {
          onLogout();
          return;
        }
        const res = await axios.get(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data;
        setUser({
          id: data.ID,
          username: data.Username,
          email: data.Email,
          phone: data.Phone,
          firstName: data.FirstName,
          lastName: data.LastName,
          avatarUrl: data.AvatarUrl ? API_URL + data.AvatarUrl : undefined,
          createdAt: data.CreatedAt,
        });
        setEvents([
          { type: 'call', time: '09:54', text: 'Вызов с подъезда', avatar: 'https://i.pravatar.cc/40?img=12' },
          { type: 'open', time: '09:56', text: 'Открыта дверь', avatar: 'https://i.pravatar.cc/40?img=13' },
          { type: 'call', time: '11:23', text: 'Вызов с домофона', avatar: 'https://i.pravatar.cc/40?img=11' },
        ]);
      } catch (err: any) {
        onLogout();
        Alert.alert('Ошибка', 'Авторизация истекла или профиль не найден');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleOpenDoor = async () => {
    Alert.alert('Дверь открыта', 'Добро пожаловать!');
  };

  const renderTabContent = () => {
    if (loading) return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Загрузка...</Text>
      </View>
    );

    switch (activeTab) {
      case 'home':
        return (
          <ScrollView contentContainerStyle={styles.scroll}>
            {user && <UserProfile user={user} onlyMain />}
            <LinearGradient colors={['#f5fbff', '#d2e4fa']} style={styles.actionCard}>
              <Text style={styles.actionTitle}>Домофон</Text>
              <Text style={styles.actionSubtitle}>Быстро открыть дверь</Text>
              <TouchableOpacity style={styles.doorButton} onPress={handleOpenDoor}>
                <Text style={styles.doorButtonText}>Открыть дверь</Text>
              </TouchableOpacity>
            </LinearGradient>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{events.filter(ev => ev.type === 'call').length}</Text>
                <Text style={styles.statLabel}>Звонка сегодня</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{events.filter(ev => ev.type === 'open').length}</Text>
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
            <TouchableOpacity style={styles.doorButton} onPress={handleOpenDoor}>
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
            <TouchableOpacity style={styles.deviceButton} onPress={handleOpenDoor}>
              <Text style={styles.deviceButtonText}>Открыть ворота</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deviceButton} onPress={() => Alert.alert('Свет', 'Свет включён')}>
              <Text style={styles.deviceButtonText}>Включить свет</Text>
            </TouchableOpacity>
          </View>
        );
      case 'profile':
        return (
          <ScrollView contentContainerStyle={styles.scroll}>
            {user && <UserProfile user={user} onAvatarChanged={handleAvatarChanged} />}
            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
              <Text style={styles.logoutText}>Выйти</Text>
            </TouchableOpacity>
          </ScrollView>
        );
    }
  };

  const tabs = [
    { key: 'home', label: 'Главная', icon: 'home-outline' },
    { key: 'video', label: 'Видео', icon: 'video-outline' },
    { key: 'history', label: 'История', icon: 'history' },
    { key: 'devices', label: 'Устройства', icon: 'devices' },
    { key: 'profile', label: 'Профиль', icon: 'account-circle-outline' },
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
            onPress={() => setActiveTab(tab.key as TabKey)}
          >
            <MaterialCommunityIcons
              name={tab.icon as any}
              size={28}
              color={activeTab === tab.key ? '#1E69DE' : '#B0B7C2'}
            />
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
  // ... скопируй свои стили отсюда ...
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
  tabBarLabel: { fontSize: 12, color: '#B0B7C2', fontWeight: '700', marginTop: 2 },
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
  deviceButton: {
    backgroundColor: '#3DD598',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 18,
  },
  deviceButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
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

export default MainForm;
