// src/components/MAIN/CustomTabBar.tsx

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../Theme.Context';

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

const CustomTabBar: React.FC<Props> = ({ active, onChange }) => {
  const { width } = useWindowDimensions();
  const tabWidth = (width - 20) / TABS.length;
  const activeIdx = TABS.findIndex(tab => tab.key === active);
  const indicatorX = useRef(new Animated.Value(activeIdx)).current;
  const [pressedIdx, setPressedIdx] = useState<number | null>(null);

  const { theme } = useTheme();

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
    <View style={[styles.wrapper, { backgroundColor: theme.tabBarBg }]}>
      <View pointerEvents="none" style={styles.border} />

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
        <BlurView intensity={50} tint={theme.mode === 'light' ? 'light' : 'dark'} style={StyleSheet.absoluteFill} />

        <LinearGradient
          colors={theme.mode === 'light'
            ? ['rgba(255,255,255,0.75)', 'rgba(255,255,255,0.35)', 'rgba(255,255,255,0.08)']
            : ['rgba(0,0,0,0.75)', 'rgba(0,0,0,0.45)', 'rgba(0,0,0,0.08)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.topHighlight}
        />

        <LinearGradient
          colors={theme.mode === 'light'
            ? ['rgba(0,0,0,0.04)', 'rgba(0,0,0,0.07)', 'rgba(0,0,0,0.12)']
            : ['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.07)', 'rgba(255,255,255,0.12)']}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0 }}
          style={styles.bottomShadow}
        />

        <View style={styles.innerVeil} />
      </Animated.View>

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
              {pressedIdx === idx && (
                <View style={styles.tabPressOverlay}>
                  <BlurView intensity={55} tint={theme.mode === 'light' ? 'light' : 'dark'} style={StyleSheet.absoluteFill} />
                  <LinearGradient
                    colors={theme.mode === 'light'
                      ? ['rgba(255,255,255,0.55)', 'rgba(255,255,255,0.25)', 'rgba(255,255,255,0.06)']
                      : ['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.06)']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                </View>
              )}
              <MaterialCommunityIcons
                name={tab.icon}
                size={26}
                color={isActive ? theme.tabBarIconActive : theme.tabBarIcon}
                style={{ zIndex: 2 }}
              />
              <Text style={[
                styles.label,
                {
                  color: isActive ? theme.tabBarIconActive : theme.tabBarIcon,
                  fontWeight: isActive ? '800' : '700',
                }
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute', left: 10, right: 10,
    bottom: Platform.OS === 'ios' ? 22 : 8,
    height: 66, borderRadius: 32, overflow: 'hidden',
    justifyContent: 'center',
    shadowOpacity: 0.08, shadowRadius: 18, shadowOffset: { width: 0, height: 4 },
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    borderWidth: 0.8,
    borderColor: 'rgba(195,220,255,0.45)',
    zIndex: 9,
  },
  gel: {
    position: 'absolute', top: 6, height: 54,
    borderRadius: 24, overflow: 'hidden',
    zIndex: 1,
    borderWidth: 0.6,
    borderColor: 'rgba(210,230,255,0.30)',
  },
  topHighlight: { ...StyleSheet.absoluteFillObject, borderRadius: 24 },
  bottomShadow: { ...StyleSheet.absoluteFillObject, borderRadius: 24 },
  innerVeil: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  container: { flexDirection: 'row', alignItems: 'center', height: 66, justifyContent: 'space-around', zIndex: 5 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', height: 58, borderRadius: 23 },
  tabPressOverlay: { ...StyleSheet.absoluteFillObject, borderRadius: 23, overflow: 'hidden' },
  label: { fontSize: 12, marginTop: 3, zIndex: 2 },
});

export default CustomTabBar;
