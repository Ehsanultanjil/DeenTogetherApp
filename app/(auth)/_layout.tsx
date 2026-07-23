import { Stack } from 'expo-router';

// Auth-based routing is centralized in app/_layout.tsx's RootNavigation —
// see the comment there for why. This layout just renders its screens.
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
