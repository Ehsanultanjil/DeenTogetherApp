import { useState } from 'react';
import { Image, Linking, Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Text } from '../../components/Text';
import { Icon } from '../../components/Icon';
import { TopAppBar } from '../../components/TopAppBar';
import { useColors } from '../../constants/theme';
import { useT } from '../../lib/hooks/useT';

export default function AboutScreen() {
  const router = useRouter();
  const Colors = useColors();
  const { t, n } = useT();
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    await Clipboard.setStringAsync('DeenTogether.app@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenEmail = () => {
    Linking.openURL('mailto:DeenTogether.app@gmail.com').catch(() => {
      handleCopyEmail();
    });
  };

  return (
    <View className="flex-1 bg-surface">
      <TopAppBar
        title={t('aboutTitle')}
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/profile/settings'))}
      />

      <ScrollView
        className="flex-1 px-gutter"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* App Logo & Header Banner */}
        <View className="items-center mb-6">
          <View
            className="w-24 h-24 rounded-3xl overflow-hidden mb-3 border border-outline-variant shadow-sm items-center justify-center"
            style={{ backgroundColor: Colors.surfaceContainerLowest }}
          >
            <Image
              source={require('../../assets/icon.png')}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </View>

          <Text className="text-[22px] font-bold text-on-surface">DeenTogether</Text>
          <Text className="text-[14px] font-medium text-primary mt-0.5">দ্বীন টুগেদার</Text>

          {/* Version Badge */}
          <View className="mt-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 flex-row items-center gap-1.5">
            <Text className="text-[12px] font-semibold text-primary">
              {t('appVersionLabel')} {n('1.0.0')}
            </Text>
          </View>

          <Text className="text-[13px] text-on-surface-variant text-center mt-3 px-4 leading-5">
            {t('aboutTagline')}
          </Text>
        </View>

        {/* Mission Statement Card */}
        <View className="p-4 bg-surface-container-lowest rounded-2xl border border-surface-variant mb-4 shadow-sm">
          <Text className="text-[14px] text-on-surface leading-6 font-normal">
            {t('aboutMission')}
          </Text>
        </View>

        {/* Key Features Section */}
        <View className="mb-4">
          <Text className="text-[15px] font-bold text-on-surface mb-2.5 px-1">
            {t('aboutKeyFeatures')}
          </Text>

          <View className="gap-2">
            <View className="p-3.5 bg-surface-container-lowest rounded-xl border border-surface-variant flex-row items-start gap-3">
              <View className="w-9 h-9 rounded-lg bg-primary/10 items-center justify-center mt-0.5">
                <Icon name="mosque" size={20} color={Colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-[14px] font-bold text-on-surface">{t('aboutFeaturePrayers')}</Text>
                <Text className="text-[12px] text-on-surface-variant mt-0.5 leading-4">
                  {t('aboutFeaturePrayersDesc')}
                </Text>
              </View>
            </View>

            <View className="p-3.5 bg-surface-container-lowest rounded-xl border border-surface-variant flex-row items-start gap-3">
              <View className="w-9 h-9 rounded-lg bg-primary/10 items-center justify-center mt-0.5">
                <Icon name="groups" size={20} color={Colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-[14px] font-bold text-on-surface">{t('aboutFeatureFamily')}</Text>
                <Text className="text-[12px] text-on-surface-variant mt-0.5 leading-4">
                  {t('aboutFeatureFamilyDesc')}
                </Text>
              </View>
            </View>

            <View className="p-3.5 bg-surface-container-lowest rounded-xl border border-surface-variant flex-row items-start gap-3">
              <View className="w-9 h-9 rounded-lg bg-primary/10 items-center justify-center mt-0.5">
                <Icon name="menu_book" size={20} color={Colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-[14px] font-bold text-on-surface">{t('aboutFeatureQuran')}</Text>
                <Text className="text-[12px] text-on-surface-variant mt-0.5 leading-4">
                  {t('aboutFeatureQuranDesc')}
                </Text>
              </View>
            </View>

            <View className="p-3.5 bg-surface-container-lowest rounded-xl border border-surface-variant flex-row items-start gap-3">
              <View className="w-9 h-9 rounded-lg bg-primary/10 items-center justify-center mt-0.5">
                <Icon name="explore" size={20} color={Colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-[14px] font-bold text-on-surface">{t('aboutFeatureQibla')}</Text>
                <Text className="text-[12px] text-on-surface-variant mt-0.5 leading-4">
                  {t('aboutFeatureQiblaDesc')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 100% Ad-Free & Privacy First Card */}
        <View className="p-4 bg-surface-container-lowest rounded-2xl border border-surface-variant mb-4 shadow-sm">
          <View className="flex-row items-center gap-2.5 mb-2">
            <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
              <Icon name="shield_with_heart" size={18} color={Colors.primary} />
            </View>
            <Text className="text-[15px] font-bold text-on-surface">{t('aboutPrivacyTitle')}</Text>
          </View>
          <Text className="text-[13px] text-on-surface-variant leading-5 mb-3">
            {t('aboutPrivacyDesc')}
          </Text>

          <Pressable
            onPress={() => router.push('/profile/privacy')}
            className="flex-row items-center justify-between pt-2 border-t border-surface-variant active:opacity-70"
          >
            <Text className="text-[13px] font-semibold text-primary">{t('aboutReadPrivacyPolicy')}</Text>
            <Icon name="chevron_right" size={18} color={Colors.primary} />
          </Pressable>
        </View>

        {/* Leadership & Credits Card */}
        <View className="p-4 bg-surface-container-lowest rounded-2xl border border-surface-variant mb-4 shadow-sm">
          <View className="flex-row items-center gap-2.5 mb-3">
            <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
              <Icon name="volunteer_activism" size={18} color={Colors.primary} />
            </View>
            <Text className="text-[15px] font-bold text-on-surface">{t('aboutDeveloperTitle')}</Text>
          </View>

          <View className="gap-2.5">
            <View className="flex-row items-start justify-between py-1.5 border-b border-surface-variant/40">
              <Text className="text-[13px] text-on-surface-variant font-medium">{t('publishedByLabel')}</Text>
              <Text className="text-[13px] font-bold text-on-surface text-right flex-1 ml-3">{t('publisherName')}</Text>
            </View>

            <View className="flex-row items-start justify-between py-1.5 border-b border-surface-variant/40">
              <Text className="text-[13px] text-on-surface-variant font-medium">{t('createdByLabel')}</Text>
              <Text className="text-[13px] font-bold text-on-surface text-right flex-1 ml-3">{t('creatorName')}</Text>
            </View>

            <View className="flex-row items-start justify-between py-1.5 border-b border-surface-variant/40">
              <Text className="text-[13px] text-on-surface-variant font-medium">{t('productFounderLabel')}</Text>
              <Text className="text-[13px] font-bold text-on-surface text-right flex-1 ml-3">{t('creatorName')}</Text>
            </View>

            <View className="flex-row items-start justify-between py-1.5">
              <Text className="text-[13px] text-on-surface-variant font-medium">{t('leadDeveloperLabel')}</Text>
              <Text className="text-[13px] font-bold text-on-surface text-right flex-1 ml-3">{t('creatorName')}</Text>
            </View>
          </View>

          <Text className="text-[12px] text-on-surface-variant mt-3 pt-2.5 border-t border-surface-variant/40 leading-4">
            {t('aboutDeveloperDesc')}
          </Text>
        </View>

        {/* Contact & Feedback Card */}
        <View className="p-4 bg-surface-container-lowest rounded-2xl border border-surface-variant mb-6 shadow-sm">
          <View className="flex-row items-center gap-2.5 mb-2">
            <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
              <Icon name="mail" size={18} color={Colors.primary} />
            </View>
            <Text className="text-[15px] font-bold text-on-surface">{t('aboutContactTitle')}</Text>
          </View>

          <View className="flex-row items-center justify-between bg-surface p-3 rounded-xl border border-outline-variant mt-1">
            <Pressable onPress={handleOpenEmail} className="flex-1 active:opacity-70 mr-2">
              <Text className="text-[13px] font-semibold text-primary underline">
                DeenTogether.app@gmail.com
              </Text>
            </Pressable>

            <Pressable
              onPress={handleCopyEmail}
              className="p-1.5 rounded-lg bg-surface-container-high active:opacity-70 flex-row items-center gap-1"
              hitSlop={8}
            >
              <Icon name={copied ? 'check' : 'content_copy'} size={16} color={copied ? Colors.primary : Colors.onSurfaceVariant} />
              {copied ? (
                <Text className="text-[11px] font-bold text-primary">{t('aboutEmailCopied')}</Text>
              ) : null}
            </Pressable>
          </View>
        </View>

        {/* Quranic Ayah & Spiritual Closing */}
        <View className="items-center py-4 px-2">
          <Text className="text-[16px] text-primary font-bold text-center mb-1">
            رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ
          </Text>
          <Text className="text-[11px] text-on-surface-variant text-center italic">
            "হে আমাদের প্রতিপালক! আমাদের পক্ষ থেকে কবুল করে নিন। নিশ্চয় আপনি সর্বশ্রোতা, সর্বজ্ঞ।" (সূরা আল-বাক্বারাহ ২:১২৭)
          </Text>
          <Text className="text-[11px] text-on-surface-variant/70 text-center mt-3">
            DeenTogether © 2026. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

