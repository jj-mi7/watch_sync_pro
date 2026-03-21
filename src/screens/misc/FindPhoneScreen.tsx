import { GlassCard } from "@/components/cards/GlassCard";
import { NeoButton } from "@/components/common/NeoButton";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import type React from "react";
import { Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export const FindPhoneScreen: React.FC = () => {
  const { theme } = useUnistyles();

  return (
    <ScreenWrapper>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <Text style={styles.title}>Find Phone</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.heroSection}>
        <View style={styles.phoneIcon}>
          <Text style={styles.phoneEmoji}>📱</Text>
        </View>

        <GlassCard glowColor={theme.colors.tertiary} style={styles.comingSoonCard}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>COMING SOON</Text>
          </View>
          <Text style={styles.featureTitle}>Ring Your Phone</Text>
          <Text style={styles.featureDesc}>
            Tap the button on your watch to make your phone ring at maximum volume — even in silent
            mode. Never lose your phone again.
          </Text>
          <View style={styles.featureList}>
            <FeatureItem text="Ring at max volume" />
            <FeatureItem text="Flash screen" />
            <FeatureItem text="Works in silent mode" />
            <FeatureItem text="5-second pulse pattern" />
          </View>
        </GlassCard>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(500).duration(400)}>
        <NeoButton
          title="NOTIFY ME WHEN READY"
          onPress={() => {}}
          variant="outline"
          color={theme.colors.tertiary}
          size="lg"
        />
      </Animated.View>
    </ScreenWrapper>
  );
};

const FeatureItem: React.FC<{ text: string }> = ({ text }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureBullet}>▸</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create((theme) => ({
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: "800",
    letterSpacing: -1,
    color: theme.colors.textPrimary,
  },
  heroSection: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  phoneIcon: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: theme.colors.tertiaryGlow,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.xxl,
    borderWidth: 1,
    borderColor: `${theme.colors.tertiary}40`,
  },
  phoneEmoji: {
    fontSize: theme.fontSize.hero,
  },
  comingSoonCard: {
    alignItems: "center",
    marginBottom: theme.spacing.xxl,
  },
  badge: {
    backgroundColor: theme.colors.tertiaryGlow,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.round,
    borderWidth: 1,
    borderColor: `${theme.colors.tertiary}40`,
    marginBottom: theme.spacing.lg,
  },
  badgeText: {
    fontSize: theme.fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "600",
    color: theme.colors.tertiary,
  },
  featureTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  featureDesc: {
    fontSize: theme.fontSize.body,
    fontWeight: "400",
    color: theme.colors.textTertiary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  featureList: {
    alignSelf: "stretch",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  featureBullet: {
    color: theme.colors.tertiary,
    fontSize: theme.fontSize.body,
    marginRight: theme.spacing.sm,
    fontWeight: "700",
  },
  featureText: {
    fontSize: theme.fontSize.body,
    fontWeight: "400",
    color: theme.colors.textSecondary,
  },
}));
