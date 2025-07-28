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
}> = ({ user, onlyMain, onAvatarChanged }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [avatar, setAvatar] = useState(user.avatarUrl);

  const [usernameEditModal, setUsernameEditModal] = useState(false);
  const [usernameInput, setUsernameInput] = useState(user.username);
  const [isSavingUsername, setIsSavingUsername] = useState(false);

  const [emailEditModal, setEmailEditModal] = useState(false);
  const [emailInput, setEmailInput] = useState(user.email);
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  const onChangeUsername = async () => {
    const newUsername = usernameInput.trim();
    if (!newUsername) {
      Alert.alert('Ошибка', 'Введите новый никнейм!');
      return;
    }
    if (newUsername === user.username) {
      Alert.alert('Внимание', 'Никнейм не изменился');
      return;
    }
    setIsSavingUsername(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      await axios.post(`${API_URL}/users/me/username`, { username: newUsername }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      Alert.alert('Успешно', 'Никнейм изменён!');
      setUsernameEditModal(false);
    } catch (e: any) {
      if (e?.response?.status === 409) {
        Alert.alert('Ошибка', 'Такой никнейм уже занят');
      } else if (e?.response?.status === 400) {
        Alert.alert('Ошибка', 'Некорректные данные');
      } else {
        Alert.alert('Ошибка', 'Не удалось изменить никнейм');
      }
    } finally {
      setIsSavingUsername(false);
    }
  };

  const onChangeEmail = async () => {
    const newEmail = emailInput.trim();
    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      Alert.alert('Ошибка', 'Введите корректный email!');
      return;
    }
    if (newEmail === user.email) {
      Alert.alert('Внимание', 'Email не изменился');
      return;
    }
    setIsSavingEmail(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      await axios.post(`${API_URL}/users/me/email`, { email: newEmail }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      Alert.alert('Успешно', 'Email изменён!');
      setEmailEditModal(false);
    } catch (e: any) {
      if (e?.response?.status === 409) {
        Alert.alert('Ошибка', 'Такой email уже используется');
      } else if (e?.response?.status === 400) {
        Alert.alert('Ошибка', 'Некорректные данные');
      } else {
        Alert.alert('Ошибка', 'Не удалось изменить email');
      }
    } finally {
      setIsSavingEmail(false);
    }
  };

  const pickImage = async () => {
    setModalVisible(false);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!result.canceled && result.assets?.length > 0) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    setModalVisible(false);
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!result.canceled && result.assets?.length > 0) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const pickFile = async () => {
    setModalVisible(false);
    const result = await DocumentPicker.getDocumentAsync({
      type: 'image/*',
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (!result.canceled && result.assets?.length > 0) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const formData = new FormData();
      const fileName = uri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(fileName);
      const type = match ? `image/${match[1]}` : `image`;

      formData.append('file', {
        uri,
        name: fileName,
        type,
      } as any);

      const res = await axios.post(`${API_URL}/users/me/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      const url = res.data?.avatarUrl || (API_URL + '/uploads/' + fileName);
      setAvatar(url);
      onAvatarChanged?.(url);
      Alert.alert('Успешно', 'Аватар обновлен!');
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось загрузить аватар');
    }
  };

  const formatPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 11) return phone;
    return `+7 (${digits.slice(1, 4)})-${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity disabled={!!onlyMain} onPress={() => setModalVisible(true)}>
        <Image
          style={styles.avatar}
          source={{
            uri: avatar || `https://ui-avatars.com/api/?name=${user.firstName || user.username}&background=1E69DE&color=fff&rounded=true&size=128`,
          }}
        />
        {!onlyMain && (
          <View style={styles.editBadge}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>✎</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.name}>
        {user.firstName} {user.lastName}
      </Text>

      <View style={styles.usernameRow}>
        <Text style={styles.username}>@{usernameInput}</Text>
        {!onlyMain && (
          <TouchableOpacity onPress={() => setUsernameEditModal(true)} style={styles.usernameEditBtn}>
            <Text style={styles.usernameEditIcon}>✎</Text>
          </TouchableOpacity>
        )}
      </View>

      {!onlyMain && (
        <>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Телефон:</Text>
            <Text style={styles.infoValue}>{formatPhone(user.phone)}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Email:</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.infoValue}>{emailInput}</Text>
              <TouchableOpacity onPress={() => setEmailEditModal(true)} style={styles.usernameEditBtn}>
                <Text style={styles.usernameEditIcon}>✎</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Зарегистрирован:</Text>
            <Text style={styles.infoValue}>{user.createdAt && new Date(user.createdAt).toLocaleDateString('ru-RU')}</Text>
          </View>
        </>
      )}

      {/* Модалка никнейма */}
      <Modal visible={usernameEditModal} animationType="fade" transparent onRequestClose={() => setUsernameEditModal(false)}>
        <TouchableOpacity style={styles.modalBG} activeOpacity={1} onPress={() => setUsernameEditModal(false)}>
          <View style={styles.modalBox}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8, color: '#1E69DE' }}>Новый никнейм</Text>
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

      {/* Модалка email */}
      <Modal visible={emailEditModal} animationType="fade" transparent onRequestClose={() => setEmailEditModal(false)}>
        <TouchableOpacity style={styles.modalBG} activeOpacity={1} onPress={() => setEmailEditModal(false)}>
          <View style={styles.modalBox}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8, color: '#1E69DE' }}>Новый Email</Text>
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

      {/* Выбор аватара */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <TouchableOpacity style={styles.modalBG} onPress={() => setModalVisible(false)}>
          <View style={styles.modalBox}>
            <TouchableOpacity onPress={takePhoto} style={styles.modalBtn}>
              <Text style={styles.modalBtnText}>Сделать снимок</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={pickImage} style={styles.modalBtn}>
              <Text style={styles.modalBtnText}>Выбрать из галереи</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={pickFile} style={styles.modalBtn}>
              <Text style={styles.modalBtnText}>Выбрать из файла</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 18,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    marginHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 40,
    backgroundColor: '#eee',
    marginBottom: 10,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1E69DE',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    fontSize: 21,
    fontWeight: '700',
    color: '#1E69DE',
    marginBottom: 2,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  username: {
    color: '#7e8ca4',
    fontWeight: '600',
  },
  usernameEditBtn: {
    marginLeft: 8,
    padding: 4,
  },
  usernameEditIcon: {
    fontSize: 16,
    color: '#1E69DE',
    fontWeight: 'bold',
  },
  infoBlock: {
    width: '100%',
    flexDirection: 'row',
    marginTop: 7,
    justifyContent: 'space-between',
    borderBottomColor: '#f2f2f4',
    borderBottomWidth: 1,
    paddingBottom: 6,
  },
  infoLabel: {
    color: '#8592a8',
    fontSize: 15,
    fontWeight: '600',
  },
  infoValue: {
    color: '#262626',
    fontSize: 15,
    fontWeight: '500',
  },
  modalBG: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    width: 260,
    elevation: 4,
  },
  modalBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
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
  },
  saveBtn: {
    backgroundColor: '#1E69DE',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});

export default UserProfile;
