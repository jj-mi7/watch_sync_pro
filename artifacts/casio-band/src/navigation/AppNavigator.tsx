import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';
import { ConnectScreen } from '@/screens/ConnectScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { GoalScreen } from '@/screens/GoalScreen';
import { LocationScreen } from '@/screens/LocationScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen
          name="Connect"
          component={ConnectScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="Goal"
          component={GoalScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="Location"
          component={LocationScreen}
          options={{ presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
