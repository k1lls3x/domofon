// UserProfile.tsx (fixed uploadAvatar fallback)
import React, { useState } from 'react';
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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
  onLogout?: () => void;            // ← добавь сюда!
}> = ({ user, onlyMain, onAvatarChanged, onLogout }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [avatar, setAvatar] = useState<string | undefined>(user.avatarUrl);

  const [usernameEditModal, setUsernameEditModal] = useState(false);
  const [usernameInput, setUsernameInput] = useState(user.username);
  const [isSavingUsername, setIsSavingUsername] = useState(false);

  const [emailEditModal, setEmailEditModal] = useState(false);
  const [emailInput, setEmailInput] = useState(user.email);
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  const navigation = useNavigation();

  /**
   * Мгновенно показываем локальный превью (uri) + уведомляем родителя,
   * потом в фоне аплоадим снимок.
   */
  const showLocalPreview = (localUri: string) => {
    setAvatar(localUri);
    onAvatarChanged?.(localUri);
  };

  // Выход из профиля
const logout = async () => {
  await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
  if (onLogout) {
    onLogout();         // ← это вызовет функцию из MainForm
  }
};


  /**
   * Загружаем аватар и корректно читаем URL из ответа.
   * Убрали попытку «догадаться» имя файла, теперь доверяем только серверу.
   */
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

      // Берём url строго из ответа
  let rawUrl = res.data?.avatar_url || res.data?.url || res.data?.fullUrl;
     if (!rawUrl) throw new Error('Сервер не вернул ссылку на файл');
     // Если url начинается с '/', подставим API_URL
     if (rawUrl.startsWith('/')) {
       rawUrl = API_URL + rawUrl;
     }
     await Image.prefetch(rawUrl).catch(() => {});
     const finalUrl = `${rawUrl}?v=${Date.now()}`;
     setAvatar(finalUrl);
      onAvatarChanged?.(finalUrl);
    } catch (e: any) {
      Alert.alert('Ошибка', e?.response?.data?.message || e.message || 'Не удалось загрузить аватар');
      console.error(e);
    }
  };

  /** ---------- PICKERS (без изменений, но используют showLocalPreview) ---------- */
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

  // --------------- Изменение никнейма ---------------
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

  // --------------- Изменение email -----------------
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

  return (
    <View style={styles.outer}>
      <View style={styles.card}>
        <TouchableOpacity
          disabled={!!onlyMain}
          onPress={() => setModalVisible(true)}
          style={styles.avatarWrap}
          activeOpacity={0.8}
        >
          <Image
            style={styles.avatar}
            source={{
              uri:
                avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user.firstName || user.username,
                )}&background=1E69DE&color=fff&rounded=true&size=128`,
              cache: 'force-cache', // <- кешируем на стороне RN
            }}
          />
          {!onlyMain && (
            <View style={styles.editBadge}>
              <MaterialCommunityIcons name="pencil" size={16} color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.name}>{`${user.firstName || ''} ${user.lastName || ''}`}</Text>

        <View style={styles.usernameRow}>
          <Text style={styles.username}>@{usernameInput}</Text>
          {!onlyMain && (
            <TouchableOpacity onPress={() => setUsernameEditModal(true)}>
              <MaterialCommunityIcons name="pencil" size={18} color="#1E69DE" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.info}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="phone-outline" size={18} color="#B1B8C4" />
            <Text style={styles.infoValue}>{formatPhone(user.phone)}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="email-outline" size={18} color="#B1B8C4" />
            <Text style={styles.infoValue}>{emailInput}</Text>
            {!onlyMain && (
              <TouchableOpacity onPress={() => setEmailEditModal(true)}>
                <MaterialCommunityIcons name="pencil" size={18} color="#1E69DE" />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="calendar-check-outline" size={18} color="#B1B8C4" />
            <Text style={styles.infoValue}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU') : ''}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Выйти</Text>
        </TouchableOpacity>
      </View>

      {/* ---- Модалки ---- */}
      {/* Никнейм */}
      <Modal visible={usernameEditModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalBG} activeOpacity={1} onPress={() => setUsernameEditModal(false)}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Новый никнейм</Text>
            <TextInput
              value={usernameInput}
              onChangeText={setUsernameInput}
              placeholder="Введите новый ник"
              style={styles.input}
              autoCapitalize="none"
              autoFocus
              editable={!isSavingUsername}
            />
            <TouchableOpacity style={[styles.saveBtn, isSavingUsername && { opacity: 0.7 }]} onPress={onChangeUsername} disabled={isSavingUsername}>
              {isSavingUsername ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Сохранить</Text>}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Email */}
      <Modal visible={emailEditModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalBG} activeOpacity={1} onPress={() => setEmailEditModal(false)}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Новый Email</Text>
            <TextInput
              value={emailInput}
              onChangeText={setEmailInput}
              placeholder="Введите новый email"
              style={styles.input}
              autoCapitalize="none"
              autoFocus
              keyboardType="email-address"
              editable={!isSavingEmail}
            />
            <TouchableOpacity style={[styles.saveBtn, isSavingEmail && { opacity: 0.7 }]} onPress={onChangeEmail} disabled={isSavingEmail}>
              {isSavingEmail ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Сохранить</Text>}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Меню выбора */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalBG} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.modalBox}>
            <TouchableOpacity onPress={openCamera} style={styles.modalBtn}>
              <Text style={styles.modalBtnText}>Сделать снимок</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={openImageLibrary} style={styles.modalBtn}>
              <Text style={styles.modalBtnText}>Выбрать из галереи</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={openDocumentPicker} style={styles.modalBtn}>
              <Text style={styles.modalBtnText}>Выбрать из файла</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// ----- Стили (без изменений) -----
const styles = StyleSheet.create({
  outer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 32,
    backgroundColor: '#F4F7FA',
  },
  card: {
    width: '94%',
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#1E69DE',
    shadowOpacity: 0.11,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 7,
  },
  avatarWrap: {
    marginBottom: 12,
    shadowColor: '#1E69DE',
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  avatar: {
    width: 94,
    height: 94,
    borderRadius: 48,
    backgroundColor: '#eaf2ff',
    borderWidth: 2,
    borderColor: '#1E69DE',
  },
  editBadge: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    backgroundColor: '#1E69DE',
    borderRadius: 12,
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E69DE',
    marginBottom: 3,
  },
  usernameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 19 },
  username: { color: '#A4ADC1', fontWeight: '600', fontSize: 17 },
  info: { width: '100%', marginVertical: 8 },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F8FC',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 7,
  },
  infoValue: { color: '#282D3C', fontSize: 15, fontWeight: '500', flex: 1 },
  logoutBtn: {
    marginTop: 26,
    backgroundColor: '#FF4C5B',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 62,
    alignItems: 'center',
    shadowColor: '#F45C6B',
    shadowOpacity: 0.21,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  logoutText: {
    color: '#fff',
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
    backgroundColor: '#fff',
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
    color: '#1E69DE',
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
    color: '#1E69DE',
    fontWeight: '700',
  },
  input: {
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    fontSize: 16,
    color: '#1E69DE',
    backgroundColor: '#f7faff',
    width: 220,
  },
  saveBtn: {
    backgroundColor: '#1E69DE',
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
});

export default UserProfile;
