import { Colors, Spacing, Typography } from "@/constants";
import { DashboardScreen } from "@/screens/dashboard/DashboardScreen";
import { SyncScreen } from "@/screens/device/SyncScreen";
import { WatchProfileScreen } from "@/screens/device/WatchProfileScreen";
import { FindPhoneScreen } from "@/screens/misc/FindPhoneScreen";
import { SettingsScreen } from "@/screens/misc/SettingsScreen";
import { CaloriesScreen } from "@/screens/tracking/CaloriesScreen";
import { DistanceScreen } from "@/screens/tracking/DistanceScreen";
import { StepsScreen } from "@/screens/tracking/StepsScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type React from "react";
import { StyleSheet, Text, View } from "react-native";

const Tab = createBottomTabNavigator();
const DeviceStack = createNativeStackNavigator();
const TrackingStack = createNativeStackNavigator();

const DeviceNavigator: React.FC = () => (
  <DeviceStack.Navigator screenOptions={{ headerShown: false }}>
    <DeviceStack.Screen name="WatchProfile" component={WatchProfileScreen} />
    <DeviceStack.Screen name="Sync" component={SyncScreen} />
    <DeviceStack.Screen name="FindPhone" component={FindPhoneScreen} />
  </DeviceStack.Navigator>
);

const TrackingNavigator: React.FC = () => (
  <TrackingStack.Navigator screenOptions={{ headerShown: false }}>
    <TrackingStack.Screen name="StepsMain" component={StepsScreen} />
    <TrackingStack.Screen name="Calories" component={CaloriesScreen} />
    <TrackingStack.Screen name="Distance" component={DistanceScreen} />
  </TrackingStack.Navigator>
);

const TabIcon: React.FC<{ icon: string; label: string; focused: boolean; color: string }> = ({
  icon,
  label,
  focused,
  color,
}) => (
  <View style={tabStyles.iconContainer}>
    <Text style={[tabStyles.icon, { opacity: focused ? 1 : 0.5 }]}>{icon}</Text>
    <Text style={[tabStyles.label, { color, opacity: focused ? 1 : 0.5 }]}>{label}</Text>
    {focused && <View style={[tabStyles.indicator, { backgroundColor: color }]} />}
  </View>
);

const tabStyles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 6,
  },
  icon: {
    fontSize: 22,
    marginBottom: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  indicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
});

export const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.tabBarBg,
          borderTopWidth: 1,
          borderTopColor: Colors.surfaceLight,
          height: 70,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textDisabled,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="🏠" label="Home" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Steps"
        component={TrackingNavigator}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="👟" label="Steps" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Device"
        component={DeviceNavigator}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="⌚" label="Watch" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon="⚙️" label="Settings" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
