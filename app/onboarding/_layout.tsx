import { Stack } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';

// Auth routing is owned centrally by app/_layout.tsx's RootNavigation, which
// redirects to login on logout from the root navigator. This guard stays
// passive (render null, never navigate) so it can't compete with or loop
// against that root redirect. See the (tabs) layout for the full reasoning
// (the "/" route is ambiguous, so an in-group redirect loops).
export default function OnboardingLayout() {
  const session = useAuthStore((s) => s.session);
  if (!session) {
    return null;
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}
