import { Platform } from 'react-native';

const BASE = Platform.select({ ios: 'System', android: 'Roboto', default: 'System' });

export const F = {
  regular: { fontFamily: BASE, fontWeight: '400' as const },
  medium: { fontFamily: BASE, fontWeight: '500' as const },
  semibold: { fontFamily: BASE, fontWeight: '600' as const },
  bold: { fontFamily: BASE, fontWeight: '700' as const },
};
