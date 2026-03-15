import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AuthService } from '../services/AuthService';
import { useStore } from '../store/useStore';
import { Colors, Radii, Spacing, Typography } from '../theme';

interface AuthScreenProps {
  onAuth: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuth }) => {
  const { setUser } = useStore();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const user = await AuthService.signInWithGoogle();
      if (user) {
        setUser(user);
        onAuth();
      }
    } catch {
      Alert.alert('Sign-in Failed', 'Could not sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    setUser({
      id: 'guest',
      email: 'guest@casiosync.app',
      name: 'Guest User',
    });
    onAuth();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inner}>
        {/* Logo */}
        <View style={styles.logoArea}>
          <View style={styles.logoRing}>
            <Text style={styles.logoEmoji}>⌚</Text>
          </View>
          <Text style={[Typography.h1, styles.appName]}>CasioSync</Text>
          <Text style={[Typography.body, styles.tagline]}>
            Your Casio. Smarter.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {[
            { icon: '📡', text: 'Bluetooth BLE sync with your watch' },
            { icon: '📊', text: 'Steps, calories & distance tracking' },
            { icon: '🎯', text: 'Daily goal setting & progress' },
            { icon: '📈', text: 'Charts & activity history' },
          ].map((f) => (
            <View key={f.text} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={[Typography.body, styles.featureText]}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* Auth Buttons */}
        <View style={styles.authArea}>
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            disabled={loading}
            style={styles.googleBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.googleIcon}>G</Text>
            <Text style={[Typography.h4, styles.googleText]}>
              {loading ? 'Signing in...' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} activeOpacity={0.7}>
            <Text style={[Typography.body, styles.skipText]}>Continue without account →</Text>
          </TouchableOpacity>

          <Text style={[Typography.caption, styles.disclaimer]}>
            Signing in syncs your data across devices. Guest mode stores data locally only.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  logoRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  logoEmoji: {
    fontSize: 48,
  },
  appName: {
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  tagline: {
    color: Colors.textSecondary,
  },
  features: {
    gap: Spacing.md,
    marginBottom: Spacing.xxxl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surfaceCard,
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureText: {
    color: Colors.textSecondary,
    flex: 1,
  },
  authArea: {
    gap: Spacing.md,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radii.round,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    shadowColor: Colors.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4285F4',
    fontFamily: 'monospace',
  },
  googleText: {
    color: Colors.textInverse,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  skipText: {
    color: Colors.primary,
  },
  disclaimer: {
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
});
