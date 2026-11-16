import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  Vibration,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Text } from '../components/Text';
import { Icon } from '../components/Icon';
import { useColors } from '../constants/theme';
import { useT } from '../lib/hooks/useT';
import { useLocationStore } from '../store/useLocationStore';
import { useLocationName } from '../lib/hooks/useLocationName';
import { calculateDistanceToMakkah, calculateQiblaBearing } from '../lib/qibla';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COMPASS_SIZE = Math.min(SCREEN_WIDTH - 64, 300);
const RADIUS = COMPASS_SIZE / 2;

export default function QiblaScreen() {
  const router = useRouter();
  const { t, n, locale } = useT();
  const Colors = useColors();
  const coords = useLocationStore((s) => s.coords);
  const geocodedPlace = useLocationName(coords);
  const locationText = geocodedPlace?.area
    ? `${geocodedPlace.area}${geocodedPlace.district ? `, ${geocodedPlace.district}` : ''}`
    : t('defaultLocationDhaka');

  const [heading, setHeading] = useState<number | null>(null);
  const [facingVibrated, setFacingVibrated] = useState(false);
  const isMountedRef = useRef(true);

  // Fallback to Dhaka if no coords yet
  const userLat = coords?.latitude ?? 23.8103;
  const userLng = coords?.longitude ?? 90.4125;

  const qiblaBearing = useMemo(
    () => Math.round(calculateQiblaBearing(userLat, userLng)),
    [userLat, userLng]
  );

  const distanceKm = useMemo(
    () => calculateDistanceToMakkah(userLat, userLng),
    [userLat, userLng]
  );

  // Compass rotation animation
  const compassRotation = useSharedValue(0);

  useEffect(() => {
    isMountedRef.current = true;
    let sub: Location.LocationSubscription | null = null;
    let isCancelled = false;

    async function startHeading() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (isCancelled || !isMountedRef.current) return;
        if (status !== 'granted') return;

        const subscription = await Location.watchHeadingAsync((data) => {
          if (isCancelled || !isMountedRef.current) return;
          const currentHeading = data.trueHeading >= 0 ? data.trueHeading : data.magHeading;
          if (currentHeading >= 0) {
            setHeading(Math.round(currentHeading));

            // Shortest angle rotation wrapping
            let diff = -currentHeading - compassRotation.value;
            while (diff < -180) diff += 360;
            while (diff > 180) diff -= 360;
            compassRotation.value = withSpring(compassRotation.value + diff, {
              damping: 20,
              stiffness: 120,
            });
          }
        });

        if (isCancelled || !isMountedRef.current) {
          subscription.remove();
        } else {
          sub = subscription;
        }
      } catch {
        // Sensor unavailable or permission denied
      }
    }

    startHeading();

    return () => {
      isCancelled = true;
      isMountedRef.current = false;
      try {
        sub?.remove();
      } catch {}
      cancelAnimation(compassRotation);
    };
  }, []);

  // Check if device is facing Kaaba (within +/- 3 degrees)
  const isFacingKaaba = useMemo(() => {
    if (heading === null) return false;
    const diff = Math.abs((heading - qiblaBearing + 360) % 360);
    return diff <= 3 || diff >= 357;
  }, [heading, qiblaBearing]);

  // Gentle haptic feedback when aligned
  useEffect(() => {
    if (isFacingKaaba && !facingVibrated) {
      Vibration.vibrate(Platform.OS === 'android' ? 40 : 30);
      setFacingVibrated(true);
    } else if (!isFacingKaaba && facingVibrated) {
      setFacingVibrated(false);
    }
  }, [isFacingKaaba, facingVibrated]);

  const animatedDialStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${compassRotation.value}deg` }],
  }));

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const directionText = useMemo(() => {
    if (heading === null) return t('orientingCompass');
    if (heading >= 338 || heading < 23) return t('directionNorth');
    if (heading < 68) return t('directionNorthEast');
    if (heading < 113) return t('directionEast');
    if (heading < 158) return t('directionSouthEast');
    if (heading < 203) return t('directionSouth');
    if (heading < 248) return t('directionSouthWest');
    if (heading < 293) return t('directionWest');
    return t('directionNorthWest');
  }, [heading, t]);

  const formattedDistance = useMemo(() => {
    const rawLocaleString = distanceKm.toLocaleString(locale === 'bn' ? 'bn-BD' : 'en-US');
    const localizedNumber = locale === 'bn' ? n(rawLocaleString) : rawLocaleString;
    return t('distanceKmUnit', { km: localizedNumber });
  }, [distanceKm, locale, n, t]);

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
          <Text className="text-[18px] font-bold text-on-surface">{t('qiblaTitle')}</Text>
          <Text className="text-[12px] text-on-surface-variant" numberOfLines={1}>
            {locationText}
          </Text>
        </View>

        <View className="w-10" />
      </View>

      <ScrollView
        contentContainerStyle={{ alignItems: 'center', paddingVertical: 24, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Facing Indicator */}
        <View
          className={`flex-row items-center gap-2 px-4 py-2 rounded-full mb-6 ${
            isFacingKaaba
              ? 'bg-primary border border-primary-fixed shadow-md'
              : 'bg-surface-container-high border border-outline-variant/30'
          }`}
        >
          <Icon
            name={isFacingKaaba ? 'check_circle' : 'navigation'}
            size={18}
            color={isFacingKaaba ? '#ffffff' : Colors.primary}
          />
          <Text
            className={`text-[13px] font-bold ${
              isFacingKaaba ? 'text-on-primary' : 'text-on-surface'
            }`}
          >
            {isFacingKaaba ? t('qiblaFacingKaaba') : `${n(qiblaBearing)}° ${t('qiblaAngle')}`}
          </Text>
        </View>

        {/* Compass Assembly */}
        <View
          style={{
            width: COMPASS_SIZE,
            height: COMPASS_SIZE,
            alignItems: 'center',
            justifyContent: 'center',
            marginVertical: 16,
          }}
        >
          {/* Static Top Alignment Notch */}
          <View
            style={{
              position: 'absolute',
              top: -10,
              zIndex: 30,
              width: 0,
              height: 0,
              borderLeftWidth: 9,
              borderRightWidth: 9,
              borderTopWidth: 16,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderTopColor: isFacingKaaba ? Colors.primary : Colors.outline,
            }}
          />

          {/* Rotating Compass Dial */}
          <Animated.View
            style={[
              {
                width: COMPASS_SIZE,
                height: COMPASS_SIZE,
                borderRadius: RADIUS,
                backgroundColor: Colors.surfaceContainerLowest,
                shadowColor: '#000',
                shadowOpacity: 0.12,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 6 },
                elevation: 6,
                borderWidth: 3.5,
                borderColor: isFacingKaaba ? Colors.primary : Colors.outlineVariant,
                alignItems: 'center',
                justifyContent: 'center',
              },
              animatedDialStyle,
            ]}
          >
            {/* Cardinal Direction Letters */}
            <Text
              style={{
                position: 'absolute',
                top: 14,
                color: Colors.error,
                fontSize: 16,
                fontWeight: '800',
              }}
            >
              {locale === 'bn' ? 'উ' : 'N'}
            </Text>
            <Text
              style={{
                position: 'absolute',
                right: 18,
                color: Colors.onSurfaceVariant,
                fontSize: 14,
                fontWeight: '700',
              }}
            >
              {locale === 'bn' ? 'পূ' : 'E'}
            </Text>
            <Text
              style={{
                position: 'absolute',
                bottom: 14,
                color: Colors.onSurfaceVariant,
                fontSize: 14,
                fontWeight: '700',
              }}
            >
              {locale === 'bn' ? 'দ' : 'S'}
            </Text>
            <Text
              style={{
                position: 'absolute',
                left: 18,
                color: Colors.onSurfaceVariant,
                fontSize: 14,
                fontWeight: '700',
              }}
            >
              {locale === 'bn' ? 'প' : 'W'}
            </Text>

            {/* Inner Decorative Ring */}
            <View
              style={{
                position: 'absolute',
                width: COMPASS_SIZE - 72,
                height: COMPASS_SIZE - 72,
                borderRadius: (COMPASS_SIZE - 72) / 2,
                borderWidth: 1,
                borderColor: Colors.surfaceContainerHigh,
                borderStyle: 'dashed',
              }}
            />

            {/* Kaaba Direction Marker on Dial */}
            <View
              style={{
                position: 'absolute',
                width: COMPASS_SIZE,
                height: COMPASS_SIZE,
                alignItems: 'center',
                justifyContent: 'flex-start',
                transform: [{ rotate: `${qiblaBearing}deg` }],
              }}
              pointerEvents="none"
            >
              {/* Golden/Emerald Kaaba Pin Badge */}
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: Colors.primary,
                  borderWidth: 2,
                  borderColor: '#d4af37',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 8,
                  shadowColor: '#000',
                  shadowOpacity: 0.35,
                  shadowRadius: 4,
                  elevation: 6,
                }}
              >
                <Icon name="mosque" size={17} color="#ffffff" />
              </View>
            </View>

            {/* Center Pivot Circle */}
            <View
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: isFacingKaaba ? Colors.primary : Colors.outline,
                borderWidth: 2,
                borderColor: Colors.surfaceContainerLowest,
                shadowColor: '#000',
                shadowOpacity: 0.2,
                shadowRadius: 2,
                elevation: 3,
              }}
            />
          </Animated.View>
        </View>

        {/* Heading Readout */}
        <View className="items-center mt-2 mb-6">
          <Text className="text-[32px] font-bold text-on-surface">
            {heading !== null ? `${n(heading)}°` : '---'}
          </Text>
          <Text className="text-[13px] text-on-surface-variant font-medium">
            {directionText}
          </Text>
        </View>

        {/* Info Cards */}
        <View className="w-full flex-row gap-3">
          <View className="flex-1 bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/30 shadow-sm items-center">
            <Icon name="explore" size={22} color={Colors.primary} />
            <Text className="text-[12px] text-on-surface-variant mt-2">{t('qiblaAngle')}</Text>
            <Text className="text-[18px] font-bold text-on-surface mt-0.5">{n(qiblaBearing)}°</Text>
          </View>

          <View className="flex-1 bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/30 shadow-sm items-center">
            <Icon name="mosque" size={22} color={Colors.primary} />
            <Text className="text-[12px] text-on-surface-variant mt-2">{t('makkahDistance')}</Text>
            <Text className="text-[18px] font-bold text-on-surface mt-0.5">
              {formattedDistance}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
