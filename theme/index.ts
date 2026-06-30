import { ms } from '../utils/responsive';
export { ms };

export const Colors = {
  primary: '#006430',
  primaryLight: '#E8F3EC',
  primaryDark: '#004d24',

  white: '#FFFFFF',
  background: '#F7F8FA',
  cardBackground: '#FFFFFF',

  textPrimary: '#1A1A1A',
  textSecondary: '#555555',
  textTertiary: '#999999',
  textDisabled: '#BBBBBB',

  border: '#E5E7EB',
  borderLight: '#F0F0F0',

  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  google: '#4285F4',
  googleBg: '#FFFFFF',

  mapBackground: '#D4E6C3',
  mapWater: '#A8C8E8',
  mapLand: '#C8DDB5',

  tabBarActive: '#006430',
  tabBarInactive: '#9CA3AF',
  tabBarBackground: '#FFFFFF',
  tabBarBorder: '#F0F0F0',

  avatarColors: ['#7C3AED', '#DB2777', '#D97706', '#059669', '#2563EB', '#DC2626'],

  badgeOrange: '#F97316',
  badgeOrangeBg: '#FFF7ED',
  badgeGreen: '#006430',
  badgeGreenBg: '#E8F3EC',
  badgeBlue: '#3B82F6',
  badgeBlueBg: '#EFF6FF',
};

export const Spacing = {
  xs:   ms(4),
  sm:   ms(8),
  md:   ms(12),
  base: ms(16),
  lg:   ms(20),
  xl:   ms(24),
  xxl:  ms(32),
  xxxl: ms(48),
};

export const FontSize = {
  xs:    ms(10),
  sm:    ms(12),
  base:  ms(14),
  md:    ms(16),
  lg:    ms(18),
  xl:    ms(20),
  xxl:   ms(24),
  xxxl:  ms(28),
  title: ms(32),
};

export const FontWeight = {
  regular:   '400' as const,
  medium:    '500' as const,
  semibold:  '600' as const,
  bold:      '700' as const,
  extrabold: '800' as const,
};

export const BorderRadius = {
  xs:   ms(4),
  sm:   ms(8),
  md:   ms(12),
  lg:   ms(16),
  xl:   ms(20),
  xxl:  ms(24),
  full: 999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
};

/** Responsive icon sizes */
export const IconSize = {
  sm:   ms(16),
  base: ms(20),
  md:   ms(22),
  lg:   ms(26),
  xl:   ms(32),
};

/** Responsive hit-target / component heights */
export const Size = {
  inputHeight:  ms(48),
  buttonHeight: ms(52),
  tabBarHeight: ms(64),
  avatarSm:     ms(32),
  avatarMd:     ms(44),
  avatarLg:     ms(72),
};
