import { Component, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { children: ReactNode };
type State = { error: Error | null };

// Without this, any uncaught render error anywhere in the tree crashes the
// whole app to a blank white/black screen in production (no red box there,
// unlike dev) — the user sees a dead app with no way to recover short of
// force-closing. Deliberately styled with plain RN primitives and no
// external state/theme/translation dependencies: those are exactly the
// kinds of things that might be implicated in the crash this is meant to
// catch, so the fallback UI must not be able to fail itself.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    if (__DEV__) {
      console.error('ErrorBoundary caught:', error, info.componentStack);
    }
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            DeenTogether ran into an unexpected error. Try again, or close and reopen the app.
          </Text>
          <Pressable onPress={this.reset} style={styles.button}>
            <Text style={styles.buttonText}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#f8f9fa' },
  title: { fontSize: 18, fontWeight: '700', color: '#191c1d', marginBottom: 8, textAlign: 'center' },
  message: { fontSize: 14, color: '#414942', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  button: { backgroundColor: '#0f5238', borderRadius: 999, paddingVertical: 14, paddingHorizontal: 28 },
  buttonText: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
});
