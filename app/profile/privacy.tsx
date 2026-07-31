import { ScrollView, View } from 'react-native';
import { Text } from '../../components/Text';
import { TopAppBar } from '../../components/TopAppBar';
import { useT } from '../../lib/hooks/useT';

// DRAFT — reviewed by the team before shipping, not legal advice. Confirm
// the family-location disclosure against what Play Store's Data Safety
// form actually declares. English-only by design: legal documents in this
// app don't follow the en/bn UI translation system.
const LAST_UPDATED = '2026-07-28';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-6">
      <Text className="text-[15px] font-bold text-on-surface mb-2">{title}</Text>
      <View className="gap-2">{children}</View>
    </View>
  );
}

export default function PrivacyPolicyScreen() {
  const { t } = useT();

  return (
    <View className="flex-1 bg-surface">
      <TopAppBar title={t('privacyPolicy')} />
      <ScrollView className="flex-1 px-gutter" contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}>
        <Text className="text-[11px] text-on-surface-variant mb-6">Last updated: {LAST_UPDATED}</Text>

        <Section title="Overview">
          <Text className="text-[13px] text-on-surface-variant leading-5">
            DeenTogether ("the app") helps you track your daily prayers and Quran reading, and see that same
            status for the family members you choose to connect with. This policy explains what information the
            app collects, why, and how it's shared.
          </Text>
        </Section>

        <Section title="Information we collect">
          <Text className="text-[13px] text-on-surface-variant leading-5">
            <Text className="font-bold text-on-surface">Account information: </Text>
            your email address, and either a Google account identifier (if you sign in with Google) or a password
            (if you sign in with email), plus a display name and a preset avatar you choose in the app — we don't
            accept uploaded photos.
          </Text>
          <Text className="text-[13px] text-on-surface-variant leading-5">
            <Text className="font-bold text-on-surface">Location: </Text>
            your approximate or precise device location (or a city you select manually), used to calculate
            accurate prayer times for your area. You can switch to manual city selection at any time in Location
            settings if you'd rather not share device location.
          </Text>
          <Text className="text-[13px] text-on-surface-variant leading-5">
            <Text className="font-bold text-on-surface">Prayer and Quran activity: </Text>
            which daily prayers and Quran reading you've marked complete, and on which dates. This is the core
            data the app exists to track.
          </Text>
          <Text className="text-[13px] text-on-surface-variant leading-5">
            <Text className="font-bold text-on-surface">Family circle data: </Text>
            if you create or join a family circle, other members can see your name, avatar, daily prayer/Quran
            completion status, and your last-known location (used to show whether a prayer window has started for
            you specifically). This is by design — the app's purpose is to let family members see each other's
            prayer status — but it does mean your location is visible to people you share a family circle with,
            not just to us.
          </Text>
          <Text className="text-[13px] text-on-surface-variant leading-5">
            <Text className="font-bold text-on-surface">Device and notification data: </Text>
            a push notification token tied to your device, used only to deliver prayer-reminder notifications you
            request from other family members.
          </Text>
        </Section>

        <Section title="How we use this information">
          <Text className="text-[13px] text-on-surface-variant leading-5">
            To calculate prayer times, track your logged prayers/Quran reading, show your status to your family
            circle, and deliver prayer-time and family-reminder notifications. We do not use your data for
            advertising, and the app has no third-party analytics or ad SDKs.
          </Text>
        </Section>

        <Section title="Who your data is shared with">
          <Text className="text-[13px] text-on-surface-variant leading-5">
            <Text className="font-bold text-on-surface">Family members you connect with: </Text>
            see "Family circle data" above.
          </Text>
          <Text className="text-[13px] text-on-surface-variant leading-5">
            <Text className="font-bold text-on-surface">Service providers: </Text>
            the app's backend and database are hosted by Supabase, and push notifications are delivered via
            Expo's push notification service. Both only process data on our behalf to run the app — neither uses
            it for their own purposes.
          </Text>
          <Text className="text-[13px] text-on-surface-variant leading-5">
            We do not sell your data, and we do not share it with advertisers.
          </Text>
        </Section>

        <Section title="Your choices">
          <Text className="text-[13px] text-on-surface-variant leading-5">
            You can switch location mode from GPS to a manually-selected city at any time, turn prayer
            notifications off in Notification Settings, leave any family circle you've joined, and delete your
            account entirely from Settings — deleting your account removes your profile, prayer/Quran history,
            and family memberships from our systems.
          </Text>
        </Section>

        <Section title="Data retention">
          <Text className="text-[13px] text-on-surface-variant leading-5">
            We keep your data while your account is active. If you delete your account, your data is removed
            from our active database; some information may persist briefly in backups before being purged on our
            normal backup rotation schedule.
          </Text>
        </Section>

        <Section title="Children">
          <Text className="text-[13px] text-on-surface-variant leading-5">
            This app is not directed at children under 13, and we do not knowingly collect data from them.
          </Text>
        </Section>

        <Section title="Changes to this policy">
          <Text className="text-[13px] text-on-surface-variant leading-5">
            If this policy changes in a material way, we'll update the "Last updated" date above and, where
            appropriate, notify you in the app.
          </Text>
        </Section>

        <Section title="Contact">
          <Text className="text-[13px] text-on-surface-variant leading-5">
            Questions about this policy or your data: DeenTogether.app@gmail.com
          </Text>
        </Section>
      </ScrollView>
    </View>
  );
}
