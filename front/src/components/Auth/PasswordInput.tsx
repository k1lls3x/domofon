import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ICON_SIZE = 20;

interface PasswordInputProps extends TextInputProps {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({ value, onChangeText, placeholder, ...props }) => {
  const [secure, setSecure] = useState(true);

  return (
    <View style={styles.inputWrap}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#b7c4e1"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secure}
        {...props}
      />
      <TouchableOpacity
        style={styles.eyeIcon}
        onPress={() => setSecure(!secure)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name={secure ? 'eye-off-outline' : 'eye-outline'}
          size={ICON_SIZE}
          color="#7e90aa"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrap: {
    position: 'relative',
    justifyContent: 'center',
    marginBottom: 15,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e3eaff',
    backgroundColor: '#f9fbff',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingRight: 38, // место под глазик
    fontSize: 16,
    fontWeight: '600',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -ICON_SIZE / 2,
    zIndex: 10,
  },
});
