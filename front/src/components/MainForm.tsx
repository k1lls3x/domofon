import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient'; // или react-native-linear-gradient

const MainScreen: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'requests' | 'settings'>('profile');

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
      onLogout();
    } catch {
      Alert.alert('Ошибка', 'Не удалось выйти из аккаунта');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <Text style={styles.contentText}>Профиль пользователя</Text>;
      case 'requests':
        return <Text style={styles.contentText}>Список заявок</Text>;
      case 'settings':
        return <Text style={styles.contentText}>Настройки приложения</Text>;
    }
  };

  const tabs: { key: typeof activeTab; title: string }[] = [
    { key: 'profile', title: 'Профиль' },
    { key: 'requests', title: 'Заявки' },
    { key: 'settings', title: 'Настройки' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {renderContent()}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Выйти</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabBarContainer}>
        <View style={styles.tabBar}>
          {tabs.map(tab => {
            const isActive = tab.key === activeTab;
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tabWrapper}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.8}
              >
                {isActive ? (
                  <LinearGradient
                    colors={['#6FB1FC', '#1E69DE']}
                    start={[0, 0]}
                    end={[1, 1]}
                    style={styles.activeTab}
                  >
                    <Text style={[styles.tabText, styles.tabTextActive]}>
                      {tab.title}
                    </Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.tabItem}>
                    <Text style={styles.tabTextInactive}>{tab.title}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F7' },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100, // чтобы таб-бар не заслонял
  },
  contentText: {
    fontSize: 20,
    color: '#333',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#E43A4B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
  },

  tabBarContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: Platform.select({ ios: 32, android: 16 }),
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
      },
      android: {
        elevation: 5,
      },
    }),
  },
  tabWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  tabItem: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 16,
  },
  activeTab: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 16,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  tabTextInactive: {
    color: '#8E8E93',
  },
});

export default MainScreen;
