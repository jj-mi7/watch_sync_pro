export const Colors = {
  background: '#0A0A0F',
  surface: '#12121A',
  surfaceElevated: '#1A1A26',
  surfaceCard: '#16161F',
  border: '#2A2A3D',
  borderBright: '#3D3D5C',

  primary: '#00F5FF',
  primaryDim: '#00C4CC',
  primaryGlow: 'rgba(0, 245, 255, 0.15)',
  primaryGlowStrong: 'rgba(0, 245, 255, 0.3)',

  secondary: '#7B2FBE',
  secondaryDim: '#5A1F8C',
  secondaryGlow: 'rgba(123, 47, 190, 0.2)',

  accent: '#FF2D55',
  accentGlow: 'rgba(255, 45, 85, 0.2)',

  green: '#00FF88',
  greenDim: '#00CC6E',
  greenGlow: 'rgba(0, 255, 136, 0.15)',

  orange: '#FF9500',
  orangeGlow: 'rgba(255, 149, 0, 0.15)',

  text: '#FFFFFF',
  textSecondary: '#A0A0C0',
  textMuted: '#606080',
  textInverse: '#0A0A0F',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  gradientPrimary: ['#00F5FF', '#7B2FBE'] as const,
  gradientSecondary: ['#FF2D55', '#7B2FBE'] as const,
  gradientGreen: ['#00FF88', '#00C4CC'] as const,
  gradientBg: ['#0A0A0F', '#12121A'] as const,

  chartColors: ['#00F5FF', '#7B2FBE', '#00FF88', '#FF2D55', '#FF9500'],
};

export type ColorKey = keyof typeof Colors;
