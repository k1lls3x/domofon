import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

// Тип для пользователя (пример, можешь расширить)
export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  first_name?: string;
  last_name?: string;
  created_at?: string;
}

const UserProfile: React.FC<{ user: User }> = ({ user }) => {
  return (
    <View style={styles.container}>
      <Image
        style={styles.avatar}
        source={{
          uri: `https://ui-avatars.com/api/?name=${user.first_name || user.username}&background=1E69DE&color=fff&rounded=true&size=128`,
        }}
      />
      <Text style={styles.name}>
        {user.first_name || ''} {user.last_name || ''}
      </Text>
      <Text style={styles.username}>@{user.username}</Text>
      <View style={styles.infoBlock}>
        <Text style={styles.infoLabel}>Телефон:</Text>
        <Text style={styles.infoValue}>{user.phone}</Text>
      </View>
      <View style={styles.infoBlock}>
        <Text style={styles.infoLabel}>Email:</Text>
        <Text style={styles.infoValue}>{user.email}</Text>
      </View>
      {user.created_at && (
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>Зарегистрирован:</Text>
          <Text style={styles.infoValue}>
            {new Date(user.created_at).toLocaleDateString('ru-RU')}
          </Text>
        </View>
      )}
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
});

export default UserProfile;
