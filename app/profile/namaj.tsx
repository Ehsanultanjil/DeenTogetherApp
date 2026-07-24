import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Text } from '../../components/Text';
import { TopAppBar } from '../../components/TopAppBar';
import { Icon } from '../../components/Icon';
import { OptionPickerModal } from '../../components/OptionPickerModal';
import { useColors } from '../../constants/theme';
import { usePrayerSettings } from '../../lib/hooks/usePrayerSettings';
import { useT } from '../../lib/hooks/useT';
import {
  CALC_METHOD_LABELS,
  MADHAB_LABELS,
  SAFETY_MARGIN_OPTIONS,
  type CalcMethodKey,
  type MadhabKey,
  type SafetyMarginMinutes,
} from '../../lib/prayerTimes';

const CALC_METHOD_OPTIONS = Object.entries(CALC_METHOD_LABELS).map(([key, label]) => ({ key, label }));
const MADHAB_OPTIONS = Object.entries(MADHAB_LABELS).map(([key, label]) => ({ key, label }));

const SAFETY_MARGIN_KEY: Record<
  SafetyMarginMinutes,
  'safetyMargin0' | 'safetyMargin1' | 'safetyMargin2' | 'safetyMargin3' | 'safetyMargin4' | 'safetyMargin5'
> = {
  0: 'safetyMargin0',
  1: 'safetyMargin1',
  2: 'safetyMargin2',
  3: 'safetyMargin3',
  4: 'safetyMargin4',
  5: 'safetyMargin5',
};

export default function NamajSettingsScreen() {
  const { settings, updateSettings } = usePrayerSettings();
  const { t } = useT();
  const Colors = useColors();
  const [pickerOpen, setPickerOpen] = useState<'calcMethod' | 'madhab' | 'safetyMargin' | null>(null);

  const SAFETY_MARGIN_LABELS = Object.fromEntries(
    SAFETY_MARGIN_OPTIONS.map((m) => [m, t(SAFETY_MARGIN_KEY[m])]),
  ) as Record<SafetyMarginMinutes, string>;
  const SAFETY_MARGIN_PICKER_OPTIONS = SAFETY_MARGIN_OPTIONS.map((m) => ({ key: String(m), label: SAFETY_MARGIN_LABELS[m] }));

  return (
    <View className="flex-1 bg-surface">
      <TopAppBar title={t('sectionPrayerSettings')} />
      <ScrollView className="flex-1 px-gutter" contentContainerStyle={{ paddingBottom: 32, paddingTop: 16 }}>
        <View className="gap-2">
          <Pressable
            onPress={() => setPickerOpen('calcMethod')}
            className="w-full p-4 bg-surface-container-lowest rounded-xl border border-surface-variant flex-row justify-between items-center active:opacity-70"
          >
            <View>
              <Text className="text-on-surface">{t('prayerCalcMethod')}</Text>
              <Text className="text-on-surface-variant text-[12px] mt-0.5">{CALC_METHOD_LABELS[settings.calcMethod]}</Text>
            </View>
            <Icon name="chevron_right" color={Colors.onSurfaceVariant} />
          </Pressable>

          <Pressable
            onPress={() => setPickerOpen('madhab')}
            className="w-full p-4 bg-surface-container-lowest rounded-xl border border-surface-variant flex-row justify-between items-center active:opacity-70"
          >
            <View>
              <Text className="text-on-surface">{t('madhabLabel')}</Text>
              <Text className="text-on-surface-variant text-[12px] mt-0.5">{MADHAB_LABELS[settings.madhab]}</Text>
            </View>
            <Icon name="chevron_right" color={Colors.onSurfaceVariant} />
          </Pressable>

          <Pressable
            onPress={() => setPickerOpen('safetyMargin')}
            className="w-full p-4 bg-surface-container-lowest rounded-xl border border-surface-variant active:opacity-70"
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-1 pr-2">
                <Text className="text-on-surface">{t('safetyMarginLabel')}</Text>
                <Text className="text-on-surface-variant text-[12px] mt-0.5">{t('safetyMarginRecommended')}</Text>
                <Text className="text-primary text-[12px] mt-0.5 font-semibold">
                  {SAFETY_MARGIN_LABELS[settings.safetyMarginMinutes]}
                </Text>
              </View>
              <Icon name="chevron_right" color={Colors.onSurfaceVariant} />
            </View>
            <Text className="text-on-surface-variant text-[11px] mt-2 leading-4">{t('safetyMarginDescription')}</Text>
          </Pressable>
        </View>
      </ScrollView>

      <OptionPickerModal
        visible={pickerOpen === 'calcMethod'}
        title={t('prayerCalcMethod')}
        options={CALC_METHOD_OPTIONS}
        selectedKey={settings.calcMethod}
        onSelect={(key) => updateSettings({ calcMethod: key as CalcMethodKey })}
        onClose={() => setPickerOpen(null)}
      />
      <OptionPickerModal
        visible={pickerOpen === 'madhab'}
        title={t('madhabLabel')}
        options={MADHAB_OPTIONS}
        selectedKey={settings.madhab}
        onSelect={(key) => updateSettings({ madhab: key as MadhabKey })}
        onClose={() => setPickerOpen(null)}
      />
      <OptionPickerModal
        visible={pickerOpen === 'safetyMargin'}
        title={t('safetyMarginLabel')}
        options={SAFETY_MARGIN_PICKER_OPTIONS}
        selectedKey={String(settings.safetyMarginMinutes)}
        onSelect={(key) => updateSettings({ safetyMarginMinutes: Number(key) as SafetyMarginMinutes })}
        onClose={() => setPickerOpen(null)}
      />
    </View>
  );
}
