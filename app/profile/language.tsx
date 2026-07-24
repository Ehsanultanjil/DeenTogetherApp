import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../../components/Text';
import { TopAppBar } from '../../components/TopAppBar';
import { Icon } from '../../components/Icon';
import { OptionPickerModal } from '../../components/OptionPickerModal';
import { useColors } from '../../constants/theme';
import { useT } from '../../lib/hooks/useT';
import type { Locale } from '../../store/useLocaleStore';

export default function LanguageScreen() {
  const { t, locale, setLocale } = useT();
  const Colors = useColors();
  const [pickerOpen, setPickerOpen] = useState(false);

  const LANGUAGE_OPTIONS = [
    { key: 'bn', label: t('languageBangla') },
    { key: 'en', label: t('languageEnglish') },
  ];

  return (
    <View className="flex-1 bg-surface">
      <TopAppBar title={t('languageLabel')} />
      <View className="px-gutter pt-4">
        <Pressable
          onPress={() => setPickerOpen(true)}
          className="w-full p-4 bg-surface-container-lowest rounded-xl border border-surface-variant flex-row justify-between items-center active:opacity-70"
        >
          <Text className="text-on-surface">{locale === 'bn' ? t('languageBangla') : t('languageEnglish')}</Text>
          <Icon name="chevron_right" color={Colors.onSurfaceVariant} />
        </Pressable>
      </View>

      <OptionPickerModal
        visible={pickerOpen}
        title={t('languageLabel')}
        options={LANGUAGE_OPTIONS}
        selectedKey={locale}
        onSelect={(key) => setLocale(key as Locale)}
        onClose={() => setPickerOpen(false)}
      />
    </View>
  );
}
