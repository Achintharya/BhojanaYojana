/**
 * Bhojana Yojana Typography System
 * Readable, accessible typography for all languages
 */

import { Platform } from 'react-native';

export const typography = {
  // Font families
  fontFamily: Platform.select({
    ios: 'Puffberry-Demo',
    android: 'Puffberry-Demo',
    default: 'Puffberry-Demo',
  }),
  
  // Fallback font families
  fallbackFontFamily: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  }),
  
  // Font sizes (increased by 25%)
  size: {
    xs: 15,
    sm: 17.5,
    base: 20,
    md: 22.5,
    lg: 25,
    xl: 30,
    xxl: 35,
    xxxl: 40,
    huge: 50,
  },
  
  // Letter spacing
  letterSpacing: {
    tight: 0,
    normal: 0.3,
    relaxed: 0.5,
    wide: 0.8,
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
    letterSpacing: typography.letterSpacing.normal,
  },
  
  // Section headers
  sectionHeader: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    lineHeight: typography.size.xl * typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.normal,
  },
  
  // Card titles
  cardTitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    lineHeight: typography.size.lg * typography.lineHeight.normal,
    letterSpacing: typography.letterSpacing.normal,
  },
  
  // Subtitle
  subtitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    lineHeight: typography.size.md * typography.lineHeight.normal,
    letterSpacing: typography.letterSpacing.normal,
  },
  
  // Title
  title: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    lineHeight: typography.size.xl * typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.normal,
  },
  
  // Body text
  body: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.base,
    fontWeight: typography.weight.regular,
    lineHeight: typography.size.base * typography.lineHeight.normal,
    letterSpacing: typography.letterSpacing.normal,
  },
  
  // Body large
  bodyLarge: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.md,
    fontWeight: typography.weight.regular,
    lineHeight: typography.size.md * typography.lineHeight.normal,
    letterSpacing: typography.letterSpacing.normal,
  },
  
  // Button text
  button: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    lineHeight: typography.size.md * typography.lineHeight.normal,
    letterSpacing: typography.letterSpacing.relaxed,
  },
  
  // Caption/small text
  caption: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.regular,
    lineHeight: typography.size.sm * typography.lineHeight.normal,
    letterSpacing: typography.letterSpacing.normal,
  },
  
  // Label text
  label: {
    fontFamily: typography.fontFamily,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    lineHeight: typography.size.sm * typography.lineHeight.normal,
    letterSpacing: typography.letterSpacing.normal,
  },
};

export default typography;
