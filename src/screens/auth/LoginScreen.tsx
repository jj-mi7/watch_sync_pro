import { GlassCard } from "@/components/cards/GlassCard";
import { Input } from "@/components/common/Input";
import { NeoButton } from "@/components/common/NeoButton";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { Colors, Spacing, Typography } from "@/constants";
import { loginFailure, loginStart, loginSuccess } from "@/redux/slices/authSlice";
import type { RootState } from "@/redux/store";
import type React from "react";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useDispatch, useSelector } from "react-redux";

export const LoginScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }
    dispatch(loginStart());
    try {
      // TODO: Plug in Firebase Auth or custom backend here
      // Simulating auth for now
      await new Promise<void>((r) => setTimeout(r, 1000));
      dispatch(
        loginSuccess({
          id: "user-001",
          email: email.trim(),
          displayName: email.split("@")[0],
        }),
      );
    } catch (e: any) {
      dispatch(loginFailure(e.message || "Login failed"));
    }
  };

  const handleGoogleLogin = async () => {
    dispatch(loginStart());
    try {
      // TODO: Integrate @react-native-google-signin/google-signin
      // Simulating Google auth for now
      await new Promise<void>((r) => setTimeout(r, 1200));
      dispatch(
        loginSuccess({
          id: "google-001",
          email: "user@gmail.com",
          displayName: "Watch User",
          photoUrl: undefined,
        }),
      );
    } catch (e: any) {
      dispatch(loginFailure(e.message || "Google sign-in failed"));
    }
  };

  return (
    <ScreenWrapper scrollable={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        {/* Logo / Brand */}
        <Animated.View entering={FadeInUp.delay(100).duration(600)} style={styles.brandSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>⌚</Text>
          </View>
          <Text style={styles.brandTitle}>WatchSync</Text>
          <Text style={styles.brandSubtitle}>PRO</Text>
          <Text style={styles.tagline}>Your wrist data. Elevated.</Text>
        </Animated.View>

        {/* Login Card */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)}>
          <GlassCard glowColor={Colors.primary} style={styles.loginCard}>
            <Text style={styles.cardTitle}>Sign In</Text>

            <Input
              label="EMAIL"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="PASSWORD"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <NeoButton
              title={isLoading ? "SIGNING IN..." : "SIGN IN"}
              onPress={handleEmailLogin}
              color={Colors.primary}
              disabled={isLoading}
              size="lg"
              style={styles.loginBtn}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <NeoButton
              title="CONTINUE WITH GOOGLE"
              onPress={handleGoogleLogin}
              variant="outline"
              color={Colors.textSecondary}
              disabled={isLoading}
              size="md"
            />
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600).duration(400)}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
        </Animated.View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: Spacing.huge,
  },
  brandSection: {
    alignItems: "center",
    marginBottom: Spacing.xxxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.primaryGlow,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: `${Colors.primary}40`,
  },
  logoIcon: {
    fontSize: 36,
  },
  brandTitle: {
    ...Typography.hero,
    color: Colors.textPrimary,
    fontSize: 36,
  },
  brandSubtitle: {
    ...Typography.label,
    color: Colors.primary,
    fontSize: 14,
    letterSpacing: 8,
    marginTop: -4,
  },
  tagline: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
  },
  loginCard: {
    marginBottom: Spacing.xl,
  },
  cardTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Spacing.xl,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  loginBtn: {
    marginTop: Spacing.sm,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.surfaceLight,
  },
  dividerText: {
    ...Typography.label,
    color: Colors.textTertiary,
    marginHorizontal: Spacing.lg,
  },
  footerText: {
    ...Typography.caption,
    color: Colors.textDisabled,
    textAlign: "center",
  },
});
