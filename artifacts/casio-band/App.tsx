import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider } from '@/lib/auth';
import { FitnessProvider } from '@/context/FitnessContext';
import { BleProvider } from '@/context/BleContext';
import { AppNavigator } from '@/navigation/AppNavigator';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#050A10" />
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <FitnessProvider>
                <BleProvider>
                  <AppNavigator />
                </BleProvider>
              </FitnessProvider>
            </AuthProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
