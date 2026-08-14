/**
 * Platform detection utilities
 * Provides clean platform checks for cross-platform compatibility
 */
import { Platform } from 'react-native';

/**
 * Platform detection
 */
export const isWeb = Platform.OS === 'web';
export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';
export const isNative = isAndroid || isIOS;

/**
 * Feature support detection
 */
export const supportsNativeNotifications = isAndroid || isIOS;
export const supportsNativeSQLite = isAndroid || isIOS;

/**
 * Get platform-specific message
 */
export function getPlatformName(): string {
  if (isWeb) return 'Web';
  if (isAndroid) return 'Android';
  if (isIOS) return 'iOS';
  return 'Unknown';
}
