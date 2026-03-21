import type { RootState } from "@/redux/store";
import { NeoTheme } from "@/theme/neoTheme";
import { NavigationContainer } from "@react-navigation/native";
import type React from "react";
import { useSelector } from "react-redux";
import { AuthStack } from "./AuthStack";
import { MainTabs } from "./MainTabs";

export const AppNavigator: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <NavigationContainer theme={NeoTheme}>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};
