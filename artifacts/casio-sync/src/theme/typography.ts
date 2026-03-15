import { Platform, StyleSheet } from 'react-native';

const fontFamily = Platform.select({
  ios: {
    regular: 'SF Pro Display',
    medium: 'SF Pro Display',
    bold: 'SF Pro Display',
    mono: 'SF Mono',
  },
  android: {
    regular: 'Roboto',
    medium: 'Roboto-Medium',
    bold: 'Roboto-Bold',
    mono: 'monospace',
  },
  default: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    mono: 'monospace',
  },
});

export const Typography = StyleSheet.create({
  h1: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    fontFamily: fontFamily?.bold,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
    fontFamily: fontFamily?.bold,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.2,
    fontFamily: fontFamily?.medium,
  },
  h4: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: fontFamily?.medium,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    fontFamily: fontFamily?.regular,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: fontFamily?.regular,
  },
  caption: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 0.3,
    fontFamily: fontFamily?.regular,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontFamily: fontFamily?.medium,
  },
  mono: {
    fontSize: 14,
    fontFamily: fontFamily?.mono,
  },
  monoLarge: {
    fontSize: 48,
    fontWeight: '700',
    fontFamily: fontFamily?.mono,
    letterSpacing: -1,
  },
});
