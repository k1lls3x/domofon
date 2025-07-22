import React, { useRef, useEffect } from 'react';
import { Animated, TouchableOpacity, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from './Theme.Context';


export const ThemeSwitcher: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const animatedValue = useRef(new Animated.Value(theme.mode === 'light' ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: theme.mode === 'light' ? 0 : 1,
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, [theme.mode]);

  // Интерполяция цветов для плавности
  const bgColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#eee', '#18192b'],
  });
  const iconColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#111', '#fff'],
  });

  const isLight = theme.mode === 'light';

  return (
    <Animated.View style={[switcherStyles.wrap, { backgroundColor: bgColor }]}>
      <TouchableOpacity onPress={toggleTheme} activeOpacity={0.8} style={switcherStyles.touch}>
        {isLight ? (
          <MaterialCommunityIcons name="weather-sunny" size={28} color="#ffd300" />
        ) : (
          <MaterialCommunityIcons name="weather-night" size={28} color="#fff" />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const switcherStyles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 28,
    bottom: 40,
    borderRadius: 24,
    width: 62,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#111',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  touch: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
