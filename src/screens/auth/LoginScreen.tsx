import { GlassCard } from "@/components/cards/GlassCard";
import { Input } from "@/components/common/Input";
import { NeoButton } from "@/components/common/NeoButton";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { loginFailure, loginStart, loginSuccess } from "@/redux/slices/authSlice";
import type { RootState } from "@/redux/store";
import type React from "react";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useDispatch, useSelector } from "react-redux";

export const LoginScreen: React.FC = () => {
  const { theme } = useUnistyles();
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
    } catch (e: unknown) {
      dispatch(loginFailure(e instanceof Error ? e.message : "Login failed"));
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
    } catch (e: unknown) {
      dispatch(loginFailure(e instanceof Error ? e.message : "Google sign-in failed"));
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
          <GlassCard glowColor={theme.colors.primary} style={styles.loginCard}>
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
              color={theme.colors.primary}
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
              color={theme.colors.textSecondary}
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

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: theme.spacing.huge,
  },
  brandSection: {
    alignItems: "center",
    marginBottom: theme.spacing.xxxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: theme.colors.primaryGlow,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}40`,
  },
  logoIcon: {
    fontSize: 36,
  },
  brandTitle: {
    fontSize: theme.fontSize.hero,
    fontWeight: "800",
    letterSpacing: -1,
    color: theme.colors.textPrimary,
  },
  brandSubtitle: {
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    fontWeight: "600",
    color: theme.colors.primary,
    letterSpacing: 8,
    marginTop: -4,
  },
  tagline: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.sm,
  },
  loginCard: {
    marginBottom: theme.spacing.xl,
  },
  cardTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  loginBtn: {
    marginTop: theme.spacing.sm,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: theme.spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.surfaceLight,
  },
  dividerText: {
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
    color: theme.colors.textTertiary,
    marginHorizontal: theme.spacing.lg,
  },
  footerText: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.textDisabled,
    textAlign: "center",
  },
}));
