import type { RootState } from "@/redux/store";
import { NeoTheme } from "@/theme/neoTheme";
import { NavigationContainer } from "@react-navigation/native";
import type React from "react";
import { useSelector } from "react-redux";
import { AuthStack } from "./AuthStack";
import { MainTabs } from "./MainTabs";
import { OnboardingStack } from "./OnboardingStack";

export const AppNavigator: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const onboardingComplete = useSelector((state: RootState) => state.user.onboardingComplete);

  return (
    <NavigationContainer theme={NeoTheme}>
      {!isAuthenticated ? <AuthStack /> : !onboardingComplete ? <OnboardingStack /> : <MainTabs />}
    </NavigationContainer>
  );
};
