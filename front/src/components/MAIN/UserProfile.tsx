import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, Alert } from 'react-native';
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

  const pickImage = async () => {
    setModalVisible(false);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
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
    if (!result.canceled && result.assets && result.assets.length > 0) {
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
    if (result.assets && result.assets.length > 0) {
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

  return (
    <View style={styles.container}>
      <TouchableOpacity
        disabled={!!onlyMain}
        onPress={() => setModalVisible(true)}>
        <Image
          style={styles.avatar}
          source={{
            uri: avatar ||
              `https://ui-avatars.com/api/?name=${user.firstName || user.username}&background=1E69DE&color=fff&rounded=true&size=128`,
          }}
        />
        {!onlyMain && (
          <View style={styles.editBadge}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>✎</Text>
          </View>
        )}
      </TouchableOpacity>
      <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
      <Text style={styles.username}>@{user.username}</Text>
      {!onlyMain && (
        <>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Телефон:</Text>
            <Text style={styles.infoValue}>{user.phone}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Зарегистрирован:</Text>
            <Text style={styles.infoValue}>{user.createdAt && new Date(user.createdAt).toLocaleDateString('ru-RU')}</Text>
          </View>
        </>
      )}

      <Modal visible={modalVisible} animationType="fade" transparent>
        <TouchableOpacity style={styles.modalBG} onPress={() => setModalVisible(false)}>
          <View style={styles.modalBox}>
            <TouchableOpacity onPress={takePhoto} style={styles.modalBtn}><Text style={styles.modalBtnText}>Сделать снимок</Text></TouchableOpacity>
            <TouchableOpacity onPress={pickImage} style={styles.modalBtn}><Text style={styles.modalBtnText}>Выбрать из галереи</Text></TouchableOpacity>
            <TouchableOpacity onPress={pickFile} style={styles.modalBtn}><Text style={styles.modalBtnText}>Выбрать из файла</Text></TouchableOpacity>
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
  username: {
    color: '#7e8ca4',
    fontWeight: '600',
    marginBottom: 14,
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
  modalBtnText: { fontSize: 17, color: '#1E69DE', fontWeight: '700' },
});

export default UserProfile;
