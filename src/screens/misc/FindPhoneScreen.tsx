import { GlassCard } from "@/components/cards/GlassCard";
import { NeoButton } from "@/components/common/NeoButton";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants";
import type React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

export const FindPhoneScreen: React.FC = () => {
  return (
    <ScreenWrapper>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <Text style={styles.title}>Find Phone</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.heroSection}>
        <View style={styles.phoneIcon}>
          <Text style={styles.phoneEmoji}>📱</Text>
        </View>

        <GlassCard glowColor={Colors.tertiary} style={styles.comingSoonCard}>
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
          color={Colors.tertiary}
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

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
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
    backgroundColor: Colors.tertiaryGlow,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: `${Colors.tertiary}40`,
  },
  phoneEmoji: {
    fontSize: 48,
  },
  comingSoonCard: {
    alignItems: "center",
    marginBottom: Spacing.xxl,
  },
  badge: {
    backgroundColor: Colors.tertiaryGlow,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: `${Colors.tertiary}40`,
    marginBottom: Spacing.lg,
  },
  badgeText: {
    ...Typography.label,
    color: Colors.tertiary,
    fontSize: 10,
  },
  featureTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  featureDesc: {
    ...Typography.body,
    color: Colors.textTertiary,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  featureList: {
    alignSelf: "stretch",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  featureBullet: {
    color: Colors.tertiary,
    fontSize: 14,
    marginRight: Spacing.sm,
    fontWeight: "700",
  },
  featureText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontSize: 14,
  },
});
