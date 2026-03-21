import { BiometricsScreen } from "@/screens/onboarding/BiometricsScreen";
import type { OnboardingStackParamList } from "@/types";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type React from "react";

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export const OnboardingStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Biometrics" component={BiometricsScreen} />
    </Stack.Navigator>
  );
};
