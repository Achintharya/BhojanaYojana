/**
 * Bhojana Yojana Typography System
 * Readable, accessible typography for all languages
 */

import { Platform } from 'react-native';

export const typography = {
  // Font families
  fontFamily: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  }),
  
  // Font sizes
  size: {
    xs: 12,
    sm: 14,
    base: 16,
    md: 18,
    lg: 20,
    xl: 24,
    xxl: 28,
    xxxl: 32,
    huge: 40,
  },
  
  // Font weights
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Pre-defined text styles
export const textStyles = {
  // Screen titles
  screenTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.xxxl,
    fontWeight: typography.weight.bold,
    lineHeight: typography.size.xxxl * typography.lineHeight.tight,
  },
  
  // Section headers
  sectionHeader: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    lineHeight: typography.size.xl * typography.lineHeight.tight,
  },
  
  // Card titles
  cardTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    lineHeight: typography.size.lg * typography.lineHeight.normal,
  },
  
  // Body text
  body: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.base,
    fontWeight: typography.weight.regular,
    lineHeight: typography.size.base * typography.lineHeight.normal,
  },
  
  // Body large
  bodyLarge: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.md,
    fontWeight: typography.weight.regular,
    lineHeight: typography.size.md * typography.lineHeight.normal,
  },
  
  // Button text
  button: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    lineHeight: typography.size.md * typography.lineHeight.normal,
  },
  
  // Caption/small text
  caption: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.regular,
    lineHeight: typography.size.sm * typography.lineHeight.normal,
  },
  
  // Label text
  label: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    lineHeight: typography.size.sm * typography.lineHeight.normal,
  },
};

export default typography;
