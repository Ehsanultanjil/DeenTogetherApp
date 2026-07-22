import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

// Android 15's forced edge-to-edge display neuters both
// `windowSoftInputMode="adjustResize"` and KeyboardAvoidingView's height
// detection (a known RN/Android-15 issue) — tracking the keyboard height
// directly from the Keyboard events sidesteps window-resize detection
// entirely, so we can just pad scrollable content by that amount.
export function useKeyboardHeight() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => setHeight(e.endCoordinates.height));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return height;
}
