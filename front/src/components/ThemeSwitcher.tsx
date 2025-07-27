// ThemeSwitcher.tsx

import React, { useRef, useEffect } from 'react';
import {
  Animated,
  TouchableOpacity,
  StyleSheet,
  Platform,
  SafeAreaView,
  ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from './Theme.Context';

export const ThemeSwitcher: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const animatedValue = useRef(
    new Animated.Value(theme.mode === 'light' ? 0 : 1)
  ).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: theme.mode === 'light' ? 0 : 1,
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, [theme.mode]);

  const bgColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FFFFFF', '#1E1E2A'],
  });

  const isLight = theme.mode === 'light';

  return (
    <SafeAreaView pointerEvents="box-none" style={styles.safeArea}>
      <Animated.View style={[styles.wrap, { backgroundColor: bgColor }]}>
        <TouchableOpacity
          onPress={toggleTheme}
          activeOpacity={0.8}
          style={styles.touch}
        >
          {isLight ? (
            <MaterialCommunityIcons
              name="weather-sunny"
              size={28}
              color="#FFD300"
            />
          ) : (
            <MaterialCommunityIcons
              name="weather-night"
              size={28}
              color="#FFFFFF"
            />
          )}
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,                     // растягиваем на весь экран
    justifyContent: 'flex-end',  // прижимаем контент к низу
    alignItems: 'flex-end',      // по горизонтали — вправо
    paddingHorizontal: 16,
    right : 32,
    bottom: 62,
    paddingBottom: Platform.select({ ios: 32, android: 16 }),
  },
  wrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    // Тень для iOS
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    // Тень для Android
    elevation: 6,
  },
  touch: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
