import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, Typography } from '../theme';

interface NeoHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export const NeoHeader: React.FC<NeoHeaderProps> = ({ title, subtitle, right }) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.indicator} />
        <View style={styles.textWrap}>
          <Text style={[Typography.h2, styles.title]}>{title}</Text>
          {subtitle && (
            <Text style={[Typography.bodySmall, styles.subtitle]}>{subtitle}</Text>
          )}
        </View>
      </View>
      {right && <View>{right}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  indicator: {
    width: 3,
    height: 28,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  textWrap: {},
  title: {
    color: Colors.text,
  },
  subtitle: {
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
