import { useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { Text } from './Text';
import { TextInput } from './TextInput';
import { Icon } from './Icon';
import { useColors } from '../constants/theme';
import { useT } from '../lib/hooks/useT';
import { useLocationPreferenceStore } from '../store/useLocationPreferenceStore';
import { BANGLADESH_DISTRICTS } from '../lib/bangladeshDistricts';
import { BottomSheetModal } from './BottomSheetModal';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function LocationPicker({ visible, onClose }: Props) {
  const { t, locale } = useT();
  const Colors = useColors();
  const preference = useLocationPreferenceStore((s) => s.preference);
  const setPreference = useLocationPreferenceStore((s) => s.setPreference);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return BANGLADESH_DISTRICTS;
    return BANGLADESH_DISTRICTS.filter(
      (d) => d.nameEn.toLowerCase().includes(q) || d.nameBn.includes(query.trim())
    );
  }, [query]);

  return (
    <BottomSheetModal visible={visible} onClose={onClose} title={t('locationTitle')} sheetStyle={{ maxHeight: '80%' }}>
      <Pressable
        onPress={() => {
          setPreference({ mode: 'gps' });
          onClose();
        }}
        className="flex-row items-center justify-between px-6 py-4 border-b border-surface-container-low active:opacity-70"
      >
        <View className="flex-row items-center gap-3">
          <Icon name="my_location" color={Colors.primary} />
          <Text className="text-on-surface text-[15px] font-semibold">{t('useGpsLocation')}</Text>
        </View>
        {preference.mode === 'gps' ? <Icon name="check" color={Colors.primary} /> : null}
      </Pressable>

      <View className="px-6 pt-4 pb-2">
        <Text className="text-[13px] font-bold text-on-surface-variant">{t('orSelectCity')}</Text>
      </View>
      <View className="px-6 pb-2">
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('searchCityPlaceholder')}
          className="h-11 px-4 rounded-xl border border-outline-variant bg-surface text-on-surface"
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(d) => d.id}
        ListEmptyComponent={
          <Text className="text-center text-on-surface-variant text-[13px] py-6">{t('noDistrictsFound')}</Text>
        }
        renderItem={({ item }) => {
          const selected = preference.mode === 'manual' && preference.districtId === item.id;
          return (
            <Pressable
              onPress={() => {
                setPreference({ mode: 'manual', districtId: item.id });
                onClose();
              }}
              className="flex-row items-center justify-between px-6 py-3 border-b border-surface-container-low active:opacity-70"
            >
              <Text className="text-on-surface text-[15px]">{locale === 'bn' ? item.nameBn : item.nameEn}</Text>
              {selected ? <Icon name="check" color={Colors.primary} /> : null}
            </Pressable>
          );
        }}
      />
    </BottomSheetModal>
  );
}
