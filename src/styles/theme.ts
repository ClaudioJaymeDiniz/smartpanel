import { COLORS } from './colors';

export const THEME = {
  colors: COLORS,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  fonts: {
    title: {
      fontFamily: 'Jakarta-Bold',
      fontSize: 28,
      color: COLORS.textPrimary,
    },
    subtitle: {
      fontFamily: 'Jakarta-Medium',
      fontSize: 16,
      color: COLORS.textSecondary,
    },
    input: {
      fontFamily: 'Jakarta-Regular',
      fontSize: 16,
      color: COLORS.textPrimary,
    },
    button: {
      fontFamily: 'Manrope-SemiBold',
      fontSize: 16,
      color: '#FFFFFF',
    },
    body: {
      fontFamily: 'Manrope-Regular',
      fontSize: 15,
      color: COLORS.textPrimary,
    }
  }
};