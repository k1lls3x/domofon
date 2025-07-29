// MainForm.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserProfile, { User } from './UserProfile';
import CustomTabBar from './CustomTabBar';

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

  // ← принимает полный url аватара (или локальный превью) от UserProfile
  const handleAvatarChanged = (newAvatarUrl: string) => {
    setUser(prev => (prev ? { ...prev, avatarUrl: newAvatarUrl } : prev));
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
      } catch {
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

  // --- Главная вкладка ---
  const renderHome = () => (
    <ScrollView contentContainerStyle={styles.scroll}>
      {/* Карточка приветствия */}
      <View style={styles.card}>
        <Image
          style={styles.avatar}
          source={{
            uri:
              user?.avatarUrl ||
              `https://ui-avatars.com/api/?name=${user?.firstName || user?.username}&background=1E69DE&color=fff&rounded=true&size=128`,
            cache: 'force-cache', // ← кешируем, чтоб повторные заходы были мгновенными
          }}
        />
        <Text style={styles.greeting}>Здравствуйте,</Text>
        <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
      </View>

      {/* Карточка "Домофон" */}
      <View style={styles.card}>
        <Text style={styles.actionTitle}>Домофон</Text>
        <Text style={styles.actionSubtitle}>Быстро открыть дверь</Text>
        <TouchableOpacity activeOpacity={0.88} style={styles.doorButton} onPress={handleOpenDoor}>
          <MaterialCommunityIcons name="door" size={24} color="#fff" style={{ marginRight: 7 }} />
          <Text style={styles.doorButtonText}>Открыть дверь</Text>
        </TouchableOpacity>
      </View>

      {/* Статистика */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="phone-in-talk-outline" size={22} color="#1E69DE" style={{ marginBottom: 3 }} />
          <Text style={styles.statValue}>{events.filter(ev => ev.type === 'call').length}</Text>
          <Text style={styles.statLabel}>Звонка сегодня</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="lock-open-outline" size={22} color="#1E69DE" style={{ marginBottom: 3 }} />
          <Text style={styles.statValue}>{events.filter(ev => ev.type === 'open').length}</Text>
          <Text style={styles.statLabel}>Открыто дверей</Text>
        </View>
      </View>

      <View style={styles.sectionDivider} />

      {/* Последние события */}
      <Text style={styles.eventsSectionTitle}>Последние события</Text>
      {events.length === 0 && <Text style={{ color: '#8d98a8', marginBottom: 20 }}>Нет событий</Text>}
      {events.map((ev, i) => (
        <View key={i} style={styles.eventCard}>
          <View style={styles.eventTypeIcon}>
            <MaterialCommunityIcons
              name={ev.type === 'call' ? 'phone-in-talk-outline' : 'lock-open-outline'}
              size={22}
              color={ev.type === 'call' ? '#1E69DE' : '#28c46c'}
            />
          </View>
          <Image source={{ uri: ev.avatar }} style={styles.eventAvatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.eventText}>{ev.text}</Text>
            <Text style={styles.eventTime}>{ev.time}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  // --- Остальные табы ---
  const renderTabContent = () => {
    if (loading)
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Загрузка...</Text>
        </View>
      );

    switch (activeTab) {
      case 'home':
        return renderHome();
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
            {user &&<UserProfile
  user={user}
  onAvatarChanged={handleAvatarChanged}
  onLogout={onLogout}        // ← теперь прокидываем!
/>}
          </ScrollView>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f7f9fb' }}>
      <View style={{ flex: 1 }}>{renderTabContent()}</View>
      <CustomTabBar active={activeTab} onChange={setActiveTab} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 14,
    paddingBottom: 28,
    paddingTop: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingVertical: 22,
    paddingHorizontal: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#185acb',
    shadowOpacity: 0.10,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 40,
    backgroundColor: '#eaf2ff',
    borderWidth: 2,
    borderColor: '#d2e4fa',
    marginBottom: 10,
  },
  greeting: {
    color: '#7287a6',
    fontSize: 16,
    marginBottom: 2,
    fontWeight: '500',
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1869de',
    letterSpacing: 0.12,
    marginBottom: 2,
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E69DE',
    marginBottom: 2,
  },
  actionSubtitle: {
    color: '#7ea1ca',
    fontSize: 15,
    marginBottom: 17,
  },
  doorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E69DE',
    paddingHorizontal: 34,
    paddingVertical: 15,
    borderRadius: 13,
    marginTop: 7,
    elevation: 2,
    shadowColor: '#1E69DE',
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  doorButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.07,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 9,
    marginTop: 8,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f7f9fb',
    borderRadius: 13,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#1E69DE',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    marginHorizontal: 3,
  },
  statValue: {
    color: '#1E69DE',
    fontWeight: '900',
    fontSize: 21,
    marginBottom: 2,
  },
  statLabel: {
    color: '#7e8ca4',
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
  },
  sectionDivider: {
    height: 18,
  },
  eventsSectionTitle: {
    fontSize: 18,
    color: '#1E2330',
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 2,
    letterSpacing: 0.13,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 13,
    padding: 13,
    marginBottom: 8,
    shadowColor: '#1e69de',
    shadowOpacity: 0.03,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  eventTypeIcon: {
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 9,
    backgroundColor: '#e2e4f0',
    borderWidth: 2,
    borderColor: '#d2e4fa',
  },
  eventText: {
    fontSize: 15,
    color: '#282a36',
    fontWeight: '600',
  },
  eventTime: {
    fontSize: 13,
    color: '#8d98a8',
    marginTop: 2,
    fontWeight: '500',
  },
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
  tabBarLabel: {
    fontSize: 12,
    color: '#B0B7C2',
    fontWeight: '700',
    marginTop: 2,
  },
  centerTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f9fb',
  },
  tabTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#1E69DE',
    marginBottom: 24,
  },
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
});

export default MainForm;
