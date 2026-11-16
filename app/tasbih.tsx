import React, { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  Vibration,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { Text } from '../components/Text';
import { Icon } from '../components/Icon';
import { useColors } from '../constants/theme';
import { useT } from '../lib/hooks/useT';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COUNTER_SIZE = Math.min(SCREEN_WIDTH - 80, 280);
const STROKE_WIDTH = 12;
const RADIUS = (COUNTER_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const STORAGE_KEY = 'deentogether.tasbih_minimal_v2';

type TargetOption = 33 | 99 | 100 | 'unlimited';

export default function TasbihScreen() {
  const router = useRouter();
  const { t, n } = useT();
  const Colors = useColors();

  const [count, setCount] = useState(0);
  const [round, setRound] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [target, setTarget] = useState<TargetOption>(33);
  const [vibrateEnabled, setVibrateEnabled] = useState(true);

  // Reanimated button tap bounce
  const buttonScale = useSharedValue(1);

  // Load saved tasbih state
  useEffect(() => {
    async function loadSaved() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (typeof parsed.count === 'number') setCount(parsed.count);
          if (typeof parsed.round === 'number') setRound(parsed.round);
          if (typeof parsed.totalCount === 'number') setTotalCount(parsed.totalCount);
          if (parsed.target) setTarget(parsed.target);
          if (typeof parsed.vibrateEnabled === 'boolean') setVibrateEnabled(parsed.vibrateEnabled);
        }
      } catch {}
    }
    loadSaved();
  }, []);

  // Persist state updates
  const saveState = async (
    newCount: number,
    newRound: number,
    newTotal: number,
    newTarget: TargetOption,
    newVib: boolean
  ) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          count: newCount,
          round: newRound,
          totalCount: newTotal,
          target: newTarget,
          vibrateEnabled: newVib,
        })
      );
    } catch {}
  };

  const handleIncrement = () => {
    // Tactile button bounce
    buttonScale.value = withSequence(
      withTiming(0.93, { duration: 50 }),
      withSpring(1, { damping: 10, stiffness: 220 })
    );

    const numericTarget = typeof target === 'number' ? target : null;
    const nextCount = count + 1;
    const nextTotal = totalCount + 1;

    if (numericTarget && nextCount >= numericTarget) {
      // Completed a cycle/target: distinct double pulse vibration
      if (vibrateEnabled) {
        Vibration.vibrate([0, 70, 90, 70]);
      }
      const nextRound = round + 1;
      setCount(0);
      setRound(nextRound);
      setTotalCount(nextTotal);
      saveState(0, nextRound, nextTotal, target, vibrateEnabled);
    } else {
      // Single count vibration feedback
      if (vibrateEnabled) {
        Vibration.vibrate(Platform.OS === 'android' ? 50 : 35);
      }
      setCount(nextCount);
      setTotalCount(nextTotal);
      saveState(nextCount, round, nextTotal, target, vibrateEnabled);
    }
  };

  const handleReset = () => {
    if (vibrateEnabled) {
      Vibration.vibrate(Platform.OS === 'android' ? 45 : 30);
    }
    setCount(0);
    setRound(1);
    saveState(0, 1, totalCount, target, vibrateEnabled);
  };

  const handleLongPressReset = () => {
    if (vibrateEnabled) {
      Vibration.vibrate([0, 50, 70, 50]);
    }
    setCount(0);
    setRound(1);
    setTotalCount(0);
    saveState(0, 1, 0, target, vibrateEnabled);
  };

  const selectTarget = (newTarget: TargetOption) => {
    setTarget(newTarget);
    saveState(count, round, totalCount, newTarget, vibrateEnabled);
  };

  const toggleVibrate = () => {
    const next = !vibrateEnabled;
    setVibrateEnabled(next);
    if (next) Vibration.vibrate(50);
    saveState(count, round, totalCount, target, next);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  // Progress ring percentage calculation
  const progressRatio = useMemo(() => {
    if (typeof target !== 'number' || target <= 0) return 0;
    return Math.min(count / target, 1);
  }, [count, target]);

  const strokeDashoffset = CIRCUMFERENCE * (1 - progressRatio);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <View className="flex-1 bg-surface">
      {/* Top Header */}
      <View className="flex-row items-center justify-between px-container-margin pt-12 pb-3 border-b border-surface-container-high/40">
        <Pressable
          onPress={handleBack}
          className="w-10 h-10 rounded-full bg-surface-container-high items-center justify-center active:opacity-70"
          hitSlop={8}
        >
          <Icon name="arrow_back" size={20} color={Colors.onSurface} />
        </Pressable>

        <View className="items-center">
          <Text className="text-[18px] font-bold text-on-surface">{t('tasbihTitle')}</Text>
          <Text className="text-[12px] text-on-surface-variant">
            {t('tasbihRound', { round: n(round) })} • {t('tasbihTotal', { total: n(totalCount) })}
          </Text>
        </View>

        {/* Haptic / Vibration Toggle */}
        <Pressable
          onPress={toggleVibrate}
          className={`w-10 h-10 rounded-full items-center justify-center active:opacity-70 ${
            vibrateEnabled ? 'bg-primary/10' : 'bg-surface-container-high'
          }`}
          hitSlop={8}
        >
          <Icon
            name="vibration"
            size={20}
            color={vibrateEnabled ? Colors.primary : Colors.outline}
          />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{
          alignItems: 'center',
          justifyContent: 'center',
          flexGrow: 1,
          paddingVertical: 24,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Target Count Selector Chips */}
        <View className="flex-row items-center gap-2.5 mb-10">
          {([33, 99, 100, 'unlimited'] as TargetOption[]).map((val) => {
            const isSelected = target === val;
            return (
              <Pressable
                key={String(val)}
                onPress={() => selectTarget(val)}
                className={`px-4 py-2 rounded-full border ${
                  isSelected
                    ? 'bg-primary-fixed border-primary'
                    : 'bg-surface-container-high border-outline-variant/30'
                }`}
              >
                <Text
                  className={`text-[13px] font-bold ${
                    isSelected ? 'text-on-primary-fixed' : 'text-on-surface-variant'
                  }`}
                >
                  {val === 'unlimited' ? '∞' : n(val)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Main Minimal Circular Counter Button */}
        <Animated.View style={[{ marginVertical: 12 }, buttonAnimatedStyle]}>
          <Pressable
            onPress={handleIncrement}
            style={{
              width: COUNTER_SIZE,
              height: COUNTER_SIZE,
              borderRadius: COUNTER_SIZE / 2,
              backgroundColor: Colors.surfaceContainerLowest,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: Colors.primary,
              shadowOpacity: 0.16,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 8 },
              elevation: 8,
            }}
          >
            {/* SVG Circular Progress Track */}
            <Svg
              width={COUNTER_SIZE}
              height={COUNTER_SIZE}
              style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}
            >
              {/* Background Ring Track */}
              <Circle
                cx={COUNTER_SIZE / 2}
                cy={COUNTER_SIZE / 2}
                r={RADIUS}
                stroke={Colors.surfaceContainerHigh}
                strokeWidth={STROKE_WIDTH}
                fill="none"
              />
              {/* Progress Ring */}
              {typeof target === 'number' && (
                <Circle
                  cx={COUNTER_SIZE / 2}
                  cy={COUNTER_SIZE / 2}
                  r={RADIUS}
                  stroke={Colors.primary}
                  strokeWidth={STROKE_WIDTH}
                  strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                />
              )}
            </Svg>

            {/* Counter Readout */}
            <View className="items-center">
              <Text className="text-[64px] font-extrabold text-primary leading-none">
                {n(count)}
              </Text>
              <Text className="text-[14px] font-semibold text-on-surface-variant mt-2">
                {typeof target === 'number' ? `/ ${n(target)}` : t('tapToCount')}
              </Text>
            </View>
          </Pressable>
        </Animated.View>

        {/* Bottom Helper & Action Controls */}
        <View className="flex-row items-center justify-between w-full max-w-[280px] mt-12">
          {/* Reset Button (Tap: reset current count | Long-press: reset total) */}
          <Pressable
            onPress={handleReset}
            onLongPress={handleLongPressReset}
            delayLongPress={600}
            className="flex-row items-center gap-1.5 px-4 py-2.5 rounded-full bg-surface-container-high border border-outline-variant/30 active:opacity-70"
            hitSlop={12}
          >
            <Icon name="refresh" size={18} color={Colors.onSurface} />
            <Text className="text-[13px] font-bold text-on-surface">{t('tasbihReset')}</Text>
          </Pressable>

          {/* Quick Info Badge */}
          <View className="flex-row items-center gap-1.5 px-4 py-2.5 rounded-full bg-surface-container-lowest border border-outline-variant/30">
            <Icon name="touch_app" size={18} color={Colors.primary} />
            <Text className="text-[13px] font-bold text-primary">
              {t('tasbihTotal', { total: n(totalCount) })}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
