import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { DashboardScreen } from '../screens/DashboardScreen';
import { ActivityScreen } from '../screens/ActivityScreen';
import { DeviceScreen } from '../screens/DeviceScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { useStore } from '../store/useStore';
import { Colors, Spacing, Typography } from '../theme';
import type { TabParamList } from '../types';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator();

const TAB_ICONS: Record<string, string> = {
  Dashboard: '⬡',
  Activity: '📊',
  Device: '⌚',
  Settings: '⚙',
};

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          const icon = TAB_ICONS[route.name] ?? '◉';
          return null;
        },
        tabBarLabel: route.name,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Device" component={DeviceScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const { user } = useStore();
  const [authed, setAuthed] = React.useState(!!user);

  React.useEffect(() => {
    setAuthed(!!user);
  }, [user]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <NavigationContainer theme={NAV_THEME}>
          {authed ? (
            <MainTabs />
          ) : (
            <AuthScreen onAuth={() => setAuthed(true)} />
          )}
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const NAV_THEME = {
  dark: true,
  colors: {
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.surface,
    text: Colors.text,
    border: Colors.border,
    notification: Colors.accent,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' as const },
    medium: { fontFamily: 'System', fontWeight: '500' as const },
    bold: { fontFamily: 'System', fontWeight: '700' as const },
    heavy: { fontFamily: 'System', fontWeight: '900' as const },
  },
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    paddingBottom: 4,
    height: 60,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
