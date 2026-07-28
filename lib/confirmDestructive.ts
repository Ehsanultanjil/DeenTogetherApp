import { Alert, Platform } from 'react-native';

// react-native-web's Alert.alert is a no-op stub (see
// node_modules/react-native-web/dist/cjs/exports/Alert/index.js) — it never
// shows anything and never calls back, so on web a destructive action gated
// behind Alert.alert silently never fires. window.confirm is the only
// blocking-confirm primitive the web platform actually has.
export function confirmDestructive(title: string, message: string, confirmLabel: string, cancelLabel: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: cancelLabel, style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}
