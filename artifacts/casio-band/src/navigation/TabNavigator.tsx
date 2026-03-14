import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Activity, BarChart2, Zap, Watch } from 'lucide-react-native';
import type { TabParamList } from './types';
import Colors from '@/constants/colors';
import { DashboardScreen } from '@/screens/tabs/DashboardScreen';
import { GraphsScreen } from '@/screens/tabs/GraphsScreen';
import { TipsScreen } from '@/screens/tabs/TipsScreen';
import { WatchScreen } from '@/screens/tabs/WatchScreen';

const C = Colors.dark;
const Tab = createBottomTabNavigator<TabParamList>();

export function TabNavigator() {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.accent,
        tabBarInactiveTintColor: C.tabIconDefault,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: C.backgroundCard,
          borderTopWidth: 1,
          borderTopColor: C.border,
          elevation: 0,
          paddingBottom: isWeb ? 0 : insets.bottom,
          height: isWeb ? 60 : 50 + insets.bottom,
        },
        tabBarBackground: () => (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: C.backgroundCard }]} />
        ),
        tabBarLabelStyle: {
          fontWeight: '500',
          fontSize: 11,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Activity size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tab.Screen
        name="Graphs"
        component={GraphsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <BarChart2 size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tab.Screen
        name="Tips"
        component={TipsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Zap size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tab.Screen
        name="Watch"
        component={WatchScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Watch size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
