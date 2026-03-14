import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Activity, BarChart2, Zap, Watch } from "lucide-react-native";
import Colors from "@/constants/colors";

const C = Colors.dark;

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.accent,
        tabBarInactiveTintColor: C.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : C.backgroundCard,
          borderTopWidth: 1,
          borderTopColor: C.border,
          elevation: 0,
          paddingBottom: isWeb ? 0 : insets.bottom,
          ...(isWeb ? { height: 80 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: C.backgroundCard }]} />
          ),
        tabBarLabelStyle: {
          fontFamily: "SpaceGrotesk_500Medium",
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <Activity size={size} color={color} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="graphs"
        options={{
          title: "Graphs",
          tabBarIcon: ({ color, size }) => <BarChart2 size={size} color={color} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="tips"
        options={{
          title: "Tips",
          tabBarIcon: ({ color, size }) => <Zap size={size} color={color} strokeWidth={1.8} />,
        }}
      />
      <Tabs.Screen
        name="watch"
        options={{
          title: "Watch",
          tabBarIcon: ({ color, size }) => <Watch size={size} color={color} strokeWidth={1.8} />,
        }}
      />
    </Tabs>
  );
}
