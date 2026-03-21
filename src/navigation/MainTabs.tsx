import { DashboardScreen } from "@/screens/dashboard/DashboardScreen";
import { SyncScreen } from "@/screens/device/SyncScreen";
import { WatchProfileScreen } from "@/screens/device/WatchProfileScreen";
import { FindPhoneScreen } from "@/screens/misc/FindPhoneScreen";
import { SettingsScreen } from "@/screens/misc/SettingsScreen";
import { ActiveScreen } from "@/screens/tracking/ActiveScreen";
import { CaloriesScreen } from "@/screens/tracking/CaloriesScreen";
import { DistanceScreen } from "@/screens/tracking/DistanceScreen";
import { StepsScreen } from "@/screens/tracking/StepsScreen";
import { Icon } from "@/components/common/Icon";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type React from "react";
import { Text, View } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

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
    <TrackingStack.Screen name="Active" component={ActiveScreen} />
  </TrackingStack.Navigator>
);

const TabIcon: React.FC<{
  iconName: string;
  label: string;
  focused: boolean;
  color: string;
}> = ({ iconName, label, focused, color }) => (
  <View style={tabStyles.iconContainer}>
    <Icon
      name={iconName}
      size={18}
      color={color}
      style={{ opacity: focused ? 1 : 0.4 }}
    />
    <Text
      style={[
        tabStyles.label,
        { color, opacity: focused ? 1 : 0.4 },
      ]}
      numberOfLines={1}
    >
      {label}
    </Text>
    {focused && <View style={[tabStyles.indicator, { backgroundColor: color }]} />}
  </View>
);

const tabStyles = StyleSheet.create((theme) => ({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 4,
    width: moderateScale(60),
  },
  label: {
    fontSize: moderateScale(9),
    fontWeight: "600",
    letterSpacing: 0.3,
    marginTop: 2,
  },
  indicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
}));

export const MainTabs: React.FC = () => {
  const { theme } = useUnistyles();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBarBg,
          borderTopWidth: 1,
          borderTopColor: theme.colors.surfaceLight,
          height: moderateScale(60),
          paddingBottom: 4,
          paddingTop: 2,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textDisabled,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon iconName="shoe" label="Steps" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Graphs"
        component={TrackingNavigator}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon iconName="bar-chart-2" label="Graphs" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Device"
        component={DeviceNavigator}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon iconName="watch" label="Watch" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon iconName="user" label="Profile" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
