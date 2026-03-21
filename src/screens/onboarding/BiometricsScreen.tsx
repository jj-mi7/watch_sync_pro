import { GlassCard } from "@/components/cards/GlassCard";
import { Input } from "@/components/common/Input";
import { NeoButton } from "@/components/common/NeoButton";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { completeOnboarding, setBiometrics } from "@/redux/slices/userSlice";
import type { Gender } from "@/redux/slices/userSlice";
import { ms } from "@/utils/scaling";
import type React from "react";
import { useState } from "react";
import { Alert, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useDispatch } from "react-redux";

export const BiometricsScreen: React.FC = () => {
  const { theme } = useUnistyles();
  const dispatch = useDispatch();

  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender>(null);

  const handleContinue = () => {
    const h = Number.parseFloat(height);
    const w = Number.parseFloat(weight);
    const a = Number.parseInt(age, 10);

    if (!h || !w || !a || !gender) {
      Alert.alert("Missing Info", "Please fill in all fields to continue.");
      return;
    }

    if (h < 50 || h > 300 || w < 20 || w > 300 || a < 10 || a > 120) {
      Alert.alert("Invalid Input", "Please enter realistic values for your biometrics.");
      return;
    }

    // Save to Redux
    dispatch(
      setBiometrics({
        heightCm: h,
        weightKg: w,
        age: a,
        gender,
      }),
    );

    // Complete onboarding (will trigger navigation to MainTabs)
    dispatch(completeOnboarding());
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Personalize Your Experience</Text>
        <Text style={styles.subtitle}>
          We use your biometrics to accurately calculate your stride length, calorie burn, and
          health metrics.
        </Text>

        <GlassCard style={styles.card}>
          <View style={styles.row}>
            <View style={styles.inputWrapper}>
              <Input
                placeholder="Age"
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
                maxLength={3}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Input
                placeholder="Height (cm)"
                keyboardType="numeric"
                value={height}
                onChangeText={setHeight}
                maxLength={3}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.inputWrapper}>
              <Input
                placeholder="Weight (kg)"
                keyboardType="decimal-pad"
                value={weight}
                onChangeText={setWeight}
                maxLength={5}
              />
            </View>
          </View>

          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderRow}>
            {(["male", "female", "other"] as Gender[]).map((g) => (
              <NeoButton
                key={g}
                title={g === "male" ? "Male" : g === "female" ? "Female" : "Other"}
                size="sm"
                variant={gender === g ? "filled" : "outline"}
                onPress={() => setGender(g)}
                style={styles.genderBtn}
              />
            ))}
          </View>
        </GlassCard>

        <NeoButton
          title="Continue"
          variant="filled"
          onPress={handleContinue}
          style={styles.continueBtn}
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    justifyContent: "center",
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: theme.spacing.xxl,
    lineHeight: ms(22),
  },
  card: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  row: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  inputWrapper: {
    flex: 1,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: "bold",
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  genderRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "space-between",
  },
  genderBtn: {
    flex: 1,
    paddingHorizontal: 0,
  },
  continueBtn: {
    marginTop: theme.spacing.xl,
  },
}));
