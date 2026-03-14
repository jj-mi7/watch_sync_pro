import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>{this.state.error?.message}</Text>
        <TouchableOpacity style={styles.btn} onPress={() => this.setState({ hasError: false })}>
          <Text style={styles.btnText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050A10', alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { color: '#E8F4F8', fontSize: 20, fontWeight: '700', marginBottom: 12 },
  message: { color: '#7899A8', fontSize: 14, textAlign: 'center', marginBottom: 24 },
  btn: { backgroundColor: '#00E5FF', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  btnText: { color: '#050A10', fontWeight: '700', fontSize: 15 },
});
