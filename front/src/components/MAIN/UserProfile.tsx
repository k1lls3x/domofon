import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
  ActivityIndicator,
  Animated,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../Theme.Context';

export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  createdAt?: string;
}

const API_URL = 'http://194.84.56.147:8080';

const UserProfile: React.FC<{
  user: User;
  onlyMain?: boolean;
  onAvatarChanged?: (url: string) => void;
  onLogout?: () => void;
}> = ({ user, onlyMain, onAvatarChanged, onLogout }) => {
  const { theme, toggleTheme } = useTheme();

  const [modalVisible, setModalVisible] = useState(false);
  const [avatar, setAvatar] = useState<string | undefined>(user.avatarUrl);

  const [usernameEditModal, setUsernameEditModal] = useState(false);
  const [usernameInput, setUsernameInput] = useState(user.username);
  const [isSavingUsername, setIsSavingUsername] = useState(false);

  const [emailEditModal, setEmailEditModal] = useState(false);
  const [emailInput, setEmailInput] = useState(user.email);
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  // Анимация тумблера
  const [dark, setDark] = useState(theme.mode === 'dark');
  const anim = useState(new Animated.Value(theme.mode === 'dark' ? 1 : 0))[0];

  useEffect(() => {
    setDark(theme.mode === 'dark');
    Animated.timing(anim, {
      toValue: theme.mode === 'dark' ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [theme.mode]);

  useEffect(() => {
    setAvatar(user.avatarUrl);
  }, [user.avatarUrl]);

  // Локальный превью для аватарки
  const showLocalPreview = (localUri: string) => {
    setAvatar(localUri);
    onAvatarChanged?.(localUri);
  };

  // Выход
  const logout = async () => {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
    if (onLogout) onLogout();
  };

  // Загрузка аватарки
  const uploadAvatar = async (uri: string) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const formData = new FormData();
      const fileName = uri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(fileName);
      const ext = match ? match[1].toLowerCase() : 'jpg';
      const type = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

      formData.append('avatar', { uri, name: fileName, type } as any);

      const res = await axios.post(`${API_URL}/users/me/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      let rawUrl = res.data?.avatar_url || res.data?.url || res.data?.fullUrl;
      if (!rawUrl) throw new Error('Сервер не вернул ссылку на файл');
      if (rawUrl.startsWith('/')) {
        rawUrl = API_URL + rawUrl;
      }
      const finalUrl = `${rawUrl}?v=${Date.now()}`;
      setAvatar(finalUrl);
      onAvatarChanged?.(finalUrl);
    } catch (e: any) {
      Alert.alert('Ошибка', e?.response?.data?.message || e.message || 'Не удалось загрузить аватар');
    }
  };

  // PICKERS
  const openImageLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Нет доступа', 'Разрешите доступ к фото');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.9,
    });
    if (!result.canceled && result.assets.length > 0) {
      const localUri = result.assets[0].uri;
      showLocalPreview(localUri);
      uploadAvatar(localUri);
    }
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Нет доступа', 'Разрешите доступ к камере');
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.9,
    });
    if (!result.canceled && result.assets.length > 0) {
      const localUri = result.assets[0].uri;
      showLocalPreview(localUri);
      uploadAvatar(localUri);
    }
  };

  const openDocumentPicker = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'image/*', copyToCacheDirectory: true });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const localUri = result.assets[0].uri;
      showLocalPreview(localUri);
      uploadAvatar(localUri);
    }
  };

  // Логика изменений никнейма/email
  const onChangeUsername = async () => {
    const newUsername = usernameInput.trim();
    if (!newUsername) return Alert.alert('Ошибка', 'Введите новый никнейм');
    if (newUsername === user.username) return Alert.alert('Внимание', 'Никнейм не изменился');

    setIsSavingUsername(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      await axios.post(
        `${API_URL}/users/me/username`,
        { username: newUsername },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      Alert.alert('Успешно', 'Никнейм изменён');
      setUsernameEditModal(false);
    } catch {
      Alert.alert('Ошибка', 'Не удалось изменить никнейм');
    } finally {
      setIsSavingUsername(false);
    }
  };

  const onChangeEmail = async () => {
    const newEmail = emailInput.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return Alert.alert('Ошибка', 'Введите корректный email');
    }
    if (newEmail === user.email) return Alert.alert('Внимание', 'Email не изменился');

    setIsSavingEmail(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      await axios.post(
        `${API_URL}/users/me/email`,
        { email: newEmail },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      Alert.alert('Успешно', 'Email изменён');
      setEmailEditModal(false);
    } catch {
      Alert.alert('Ошибка', 'Не удалось изменить email');
    } finally {
      setIsSavingEmail(false);
    }
  };

  const formatPhone = (phone: string) => {
    const d = phone.replace(/\D/g, '');
    if (d.length !== 11) return phone;
    return `+7 (${d.slice(1, 4)})-${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9)}`;
  };

  // ...остальной код выше

// ==== Кастомный тумблер ====
const renderThemeToggle = () => {
  const trackColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ffe98c', '#222a39'],
  });
  const thumbPos = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 32], // ширина - круг = 56-22 = 34; чуть отступа с краю
  });
  const thumbColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ffd700', '#284269'],
  });

  return (
    <View style={styles.themeSwitchRow}>
      <Text
        style={[
          styles.themeSwitchLabel,
          { color: theme.mode === 'light' ? '#1869DE' : '#fff' }
        ]}
      >
        Сменить тему:
      </Text>
      <TouchableOpacity
        style={styles.themeToggleBtn}
        activeOpacity={0.88}
        onPress={toggleTheme}
        accessibilityRole="switch"
        accessibilityState={{ checked: dark }}
      >
        <MaterialCommunityIcons name="white-balance-sunny" size={20} color={dark ? "#bbb" : "#FFD93A"} />
        <Animated.View style={[
          styles.themeToggleTrack,
          { backgroundColor: trackColor }
        ]}>
          <Animated.View
            style={[
              styles.themeToggleThumb,
              {
                left: thumbPos,
                backgroundColor: thumbColor,
                shadowColor: dark ? "#1e69de" : "#ffd700",
              },
            ]}
          />
        </Animated.View>
        <MaterialCommunityIcons name="moon-waning-crescent" size={20} color={dark ? "#9ecfff" : "#aaa"} />
      </TouchableOpacity>
    </View>
  );
};

  return (
    <View style={[styles.outer, { backgroundColor: theme.background }]}>
      <View style={[styles.card, { backgroundColor: theme.cardBg, shadowColor: theme.shadow }]}>
        <TouchableOpacity
          disabled={!!onlyMain}
          onPress={() => setModalVisible(true)}
          style={styles.avatarWrap}
          activeOpacity={0.8}
        >
          <Image
            style={[styles.avatar, { borderColor: theme.icon, backgroundColor: theme.inputBg }]}
            source={{
              uri:
                avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user.firstName || user.username,
                )}&background=1E69DE&color=fff&rounded=true&size=128`,
              cache: 'force-cache',
            }}
          />
          {!onlyMain && (
            <View style={[styles.editBadge, { backgroundColor: theme.icon, borderColor: theme.cardBg }]}>
              <MaterialCommunityIcons name="pencil" size={16} color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        <Text style={[styles.name, { color: theme.icon }]}>{`${user.firstName || ''} ${user.lastName || ''}`}</Text>

        <View style={styles.usernameRow}>
          <Text style={[styles.username, { color: theme.subtext }]}>@{usernameInput}</Text>
          {!onlyMain && (
            <TouchableOpacity onPress={() => setUsernameEditModal(true)}>
              <MaterialCommunityIcons name="pencil" size={18} color={theme.icon} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.info}>
          <View style={[styles.infoItem, { backgroundColor: theme.inputBg }]}>
            <MaterialCommunityIcons name="phone-outline" size={18} color={theme.icon} />
            <Text style={[styles.infoValue, { color: theme.text }]}>{formatPhone(user.phone)}</Text>
          </View>
          <View style={[styles.infoItem, { backgroundColor: theme.inputBg }]}>
            <MaterialCommunityIcons name="email-outline" size={18} color={theme.icon} />
            <Text style={[styles.infoValue, { color: theme.text }]}>{emailInput}</Text>
            {!onlyMain && (
              <TouchableOpacity onPress={() => setEmailEditModal(true)}>
                <MaterialCommunityIcons name="pencil" size={18} color={theme.icon} />
              </TouchableOpacity>
            )}
          </View>
          <View style={[styles.infoItem, { backgroundColor: theme.inputBg }]}>
            <MaterialCommunityIcons name="calendar-check-outline" size={18} color={theme.icon} />
            <Text style={[styles.infoValue, { color: theme.text }]}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU') : ''}</Text>
          </View>
        </View>

        {/* ---- Только кастомный тумблер ---- */}
        {renderThemeToggle()}

        {/* Кнопка выхода */}
        {!onlyMain && (
          <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: theme.error }]} onPress={logout}>
            <Text style={[styles.logoutText, { color: theme.buttonText }]}>Выйти</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ---- Модалки ---- */}
      <Modal visible={usernameEditModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalBG} activeOpacity={1} onPress={() => setUsernameEditModal(false)}>
          <View style={[styles.modalBox, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.modalTitle, { color: theme.icon }]}>Новый никнейм</Text>
            <TextInput
              value={usernameInput}
              onChangeText={setUsernameInput}
              placeholder="Введите новый ник"
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBg,
                  color: theme.inputText,
                  borderColor: theme.inputBorder,
                }
              ]}
              placeholderTextColor={theme.subtext}
              autoCapitalize="none"
              autoFocus
              editable={!isSavingUsername}
            />
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.button }, isSavingUsername && { opacity: 0.7 }]} onPress={onChangeUsername} disabled={isSavingUsername}>
              {isSavingUsername ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Сохранить</Text>}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={emailEditModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalBG} activeOpacity={1} onPress={() => setEmailEditModal(false)}>
          <View style={[styles.modalBox, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.modalTitle, { color: theme.icon }]}>Новый Email</Text>
            <TextInput
              value={emailInput}
              onChangeText={setEmailInput}
              placeholder="Введите новый email"
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBg,
                  color: theme.inputText,
                  borderColor: theme.inputBorder,
                }
              ]}
              placeholderTextColor={theme.subtext}
              autoCapitalize="none"
              autoFocus
              keyboardType="email-address"
              editable={!isSavingEmail}
            />
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.button }, isSavingEmail && { opacity: 0.7 }]} onPress={onChangeEmail} disabled={isSavingEmail}>
              {isSavingEmail ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Сохранить</Text>}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Меню выбора */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalBG} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={[styles.modalBox, { backgroundColor: theme.cardBg }]}>
            <TouchableOpacity onPress={openCamera} style={styles.modalBtn}>
              <Text style={[styles.modalBtnText, { color: theme.icon }]}>Сделать снимок</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={openImageLibrary} style={styles.modalBtn}>
              <Text style={[styles.modalBtnText, { color: theme.icon }]}>Выбрать из галереи</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={openDocumentPicker} style={styles.modalBtn}>
              <Text style={[styles.modalBtnText, { color: theme.icon }]}>Выбрать из файла</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 32,
  },
  card: {
    width: '94%',
    borderRadius: 22,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowOpacity: 0.11,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 7,
  },
  avatarWrap: {
    marginBottom: 12,
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  avatar: {
    width: 94,
    height: 94,
    borderRadius: 48,
    borderWidth: 2,
  },
  editBadge: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    borderRadius: 12,
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 3,
  },
  usernameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 19 },
  username: { fontWeight: '600', fontSize: 17 },
  info: { width: '100%', marginVertical: 8 },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 7,
  },
  infoValue: { fontSize: 15, fontWeight: '500', flex: 1 },
  logoutBtn: {
    marginTop: 26,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 62,
    alignItems: 'center',
    shadowOpacity: 0.21,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  logoutText: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  modalBG: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    borderRadius: 17,
    padding: 18,
    width: 280,
    elevation: 5,
    alignItems: 'center',
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 19,
    marginBottom: 10,
  },
  modalBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    width: 220,
  },
  modalBtnText: {
    fontSize: 17,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    fontSize: 16,
    width: 220,
  },
  saveBtn: {
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 36,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  // --- Кастомный тумблер ---
  themeSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 4,
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  themeSwitchLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  themeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
  },
  themeToggleTrack: {
    width: 56,
    height: 28,
    borderRadius: 14,
    marginHorizontal: 7,
    backgroundColor: '#ffe98c',
    justifyContent: 'center',
  },
  themeToggleThumb: {
    position: 'absolute',
    top: 3,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ffd700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.20,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default UserProfile;
