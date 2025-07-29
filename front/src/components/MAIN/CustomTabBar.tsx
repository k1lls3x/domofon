import React, { useRef, useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform, Animated, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

// Типы вкладок
type TabKey = 'home' | 'video' | 'history' | 'devices' | 'profile';

const TABS: { key: TabKey; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { key: 'home', label: 'Главная', icon: 'home-outline' },
  { key: 'video', label: 'Видео', icon: 'video-outline' },
  { key: 'history', label: 'История', icon: 'history' },
  { key: 'devices', label: 'Устройства', icon: 'devices' },
  { key: 'profile', label: 'Профиль', icon: 'account-circle-outline' },
];

interface Props {
  active: TabKey;
  onChange: (key: TabKey) => void;
}

/**
 * Кастомная нижняя навигация c «стеклянной» pазделительной плашкой,
 * стилизованной под iOS‑style гель (как на скрине WatchOS 10).
 */
const CustomTabBar: React.FC<Props> = ({ active, onChange }) => {
  const { width } = useWindowDimensions();
  const tabWidth = (width - 20) / TABS.length;
  const activeIdx = TABS.findIndex(tab => tab.key === active);
  const indicatorX = useRef(new Animated.Value(activeIdx)).current;
  const [pressedIdx, setPressedIdx] = useState<number | null>(null);

  useEffect(() => {
    const idx = TABS.findIndex(tab => tab.key === active);
    Animated.spring(indicatorX, {
      toValue: idx,
      useNativeDriver: false,
      speed: 14,
      bounciness: 4,
    }).start();
  }, [active]);

  return (
    <View style={styles.wrapper}>
      {/* Светлая рамка навбара */}
      <View pointerEvents="none" style={styles.border} />

      {/* Гелевая плашка активного таба */}
      <Animated.View
        style={[
          styles.gel,
          {
            width: tabWidth - 12,
            left: indicatorX.interpolate({
              inputRange: [0, TABS.length - 1],
              outputRange: [6, tabWidth * (TABS.length - 1) + 6],
            }),
          },
        ]}
        pointerEvents="none"
      >
        {/* Размытие */}
        <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} />

        {/* Лёгкий верхний бликовый градиент */}
        <LinearGradient
          colors={[
            'rgba(255,255,255,0.75)',
            'rgba(255,255,255,0.35)',
            'rgba(255,255,255,0.08)',
          ]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.topHighlight}
        />

        {/* Едва заметная нижняя тень, чтобы гель парил */}
        <LinearGradient
          colors={[
            'rgba(0,0,0,0.04)',
            'rgba(0,0,0,0.07)',
            'rgba(0,0,0,0.12)',
          ]}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0 }}
          style={styles.bottomShadow}
        />

        {/* Внутренняя вуаль для глубины */}
        <View style={styles.innerVeil} />
      </Animated.View>

      {/* Кнопки вкладок */}
      <View style={styles.container}>
        {TABS.map((tab, idx) => {
          const isActive = tab.key === active;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && { zIndex: 3 }]}
              activeOpacity={0.78}
              onPress={() => onChange(tab.key)}
              onPressIn={() => setPressedIdx(idx)}
              onPressOut={() => setPressedIdx(null)}
            >
              {/* Мини‑гель при удержании */}
              {pressedIdx === idx && (
                <View style={styles.tabPressOverlay}>
                  <BlurView intensity={55} tint="light" style={StyleSheet.absoluteFill} />
                  <LinearGradient
                    colors={[
                      'rgba(255,255,255,0.55)',
                      'rgba(255,255,255,0.25)',
                      'rgba(255,255,255,0.06)',
                    ]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                </View>
              )}

              <MaterialCommunityIcons
                name={tab.icon}
                size={26}
                color={isActive ? '#1869de' : '#B0B7C2'}
                style={{ zIndex: 2 }}
              />
              <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// Стили
const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: Platform.OS === 'ios' ? 22 : 8,
    height: 66,
    borderRadius: 32,
    overflow: 'visible',
    backgroundColor: 'rgba(255,255,255,0.90)',
    justifyContent: 'center',
    shadowColor: '#b6d7fa',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 4 },
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    borderWidth: 0.8,
    borderColor: 'rgba(195,220,255,0.45)',
    zIndex: 9,
  },
  gel: {
    position: 'absolute',
    top: 6,
    height: 54,
    borderRadius: 24,
    overflow: 'hidden',
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 0.6,
    borderColor: 'rgba(210,230,255,0.30)',
  },
  topHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
  },
  bottomShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
  },
  innerVeil: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 66,
    justifyContent: 'space-around',
    zIndex: 5,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 58,
    borderRadius: 23,
    position: 'relative',
    overflow: 'visible',
  },
  tabPressOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 23,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  label: {
    color: '#B0B7C2',
    fontWeight: '700',
    fontSize: 12,
    marginTop: 3,
    zIndex: 2,
  },
  labelActive: {
    color: '#1869de',
    fontWeight: '800',
  },
});

export default CustomTabBar;
