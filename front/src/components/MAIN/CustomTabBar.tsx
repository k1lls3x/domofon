import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../Theme.Context';

type TabKey = 'home' | 'video' | 'history' | 'devices' | 'profile';

const TABS: { key: TabKey; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { key: 'home',    icon: 'home-outline' },
  { key: 'video',   icon: 'video-outline' },
  { key: 'history', icon: 'history' },
  { key: 'devices', icon: 'devices' },
  { key: 'profile', icon: 'account-circle-outline' },
];

const BAR_WIDTH = 340;
const BAR_HEIGHT = 64;
const BAR_RADIUS = BAR_HEIGHT / 2;
const ICON_SIZE = 26;
const VERT_PAD = 8;
const HORIZ_PAD = 8;
const PILL_GAP = 12;

export default function CustomTabBar({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (key: TabKey) => void;
}) {
  const { theme } = useTheme();

  const isDark = theme.mode === 'dark';

  const count = TABS.length;
  const tabW = (BAR_WIDTH - HORIZ_PAD * 2) / count;
  const pillW = tabW - PILL_GAP;

  const activeIdx = TABS.findIndex(t => t.key === active);
  const pillX = useRef(
    new Animated.Value(activeIdx * tabW + HORIZ_PAD + PILL_GAP / 2)
  ).current;

  useEffect(() => {
    Animated.spring(pillX, {
      toValue: activeIdx * tabW + HORIZ_PAD + PILL_GAP / 2,
      useNativeDriver: false,
      speed: 18,
      bounciness: 8,
    }).start();
  }, [activeIdx, pillX, tabW]);

  return (
    <View style={styles.root}>
      <BlurView
        style={styles.barBlur}
        tint={isDark ? 'dark' : 'light'}
        intensity={isDark ? 60 : 52}
      />
      <View
        style={[
          styles.barBack,
          {
            backgroundColor: isDark
              ? 'rgba(34, 40, 57, 0.82)'
              : 'rgba(255,255,255,0.38)',
          },
        ]}
      />
      <Animated.View
        style={[
          styles.pill,
          {
            width: pillW,
            height: BAR_HEIGHT - VERT_PAD * 2,
            borderRadius: (BAR_HEIGHT - VERT_PAD * 2) / 2,
            transform: [{ translateX: pillX }],
            top: VERT_PAD,
            left: 0,
            backgroundColor: isDark
              ? 'rgba(38,64,102,0.78)'
              : 'rgba(255,255,255,0.83)',
          },
        ]}
        pointerEvents="none"
      />

      <View style={styles.tabsRow}>
        {TABS.map((t, i) => {
          const focused = i === activeIdx;
          return (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, { width: tabW }]}
              activeOpacity={0.85}
              onPress={() => onChange(t.key)}
            >
              <MaterialCommunityIcons
                name={t.icon}
                size={ICON_SIZE}
                color={
                  focused
                    ? (isDark ? '#51B5FF' : '#1798FF')
                    : (isDark ? '#5E7899' : '#AFC9E2')
                }
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: Platform.OS === 'ios' ? 20 : 10,
    width: BAR_WIDTH,
    height: BAR_HEIGHT,
    borderRadius: BAR_RADIUS,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    justifyContent: 'center',
  },
  barBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  barBack: {
    ...StyleSheet.absoluteFillObject,
  },
  pill: {
    position: 'absolute',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    left: HORIZ_PAD,
    right: HORIZ_PAD,
    top: 0,
    bottom: 0,
  },
  tab: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
