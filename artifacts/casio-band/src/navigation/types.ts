import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  Tabs: undefined;
  Connect: undefined;
  Settings: undefined;
  Goal: undefined;
  Location: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Graphs: undefined;
  Tips: undefined;
  Watch: undefined;
};

export type RootStackProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type TabProps<T extends keyof TabParamList> =
  BottomTabScreenProps<TabParamList, T>;
