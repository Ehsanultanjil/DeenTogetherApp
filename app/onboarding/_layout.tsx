import { View } from 'react-native';
import { Stack } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';

// Which route to navigate to is decided centrally in app/_layout.tsx's
// RootNavigation — this is just a passive refusal-to-render safety net
// (no competing navigation call) for the case where history briefly lands
// back here without a session. See the (tabs) layout for the same pattern.
export default function OnboardingLayout() {
  const session = useAuthStore((s) => s.session);
  if (!session) {
    return <View className="flex-1 bg-surface" />;
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}
