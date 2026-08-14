/**
 * Primary Button Component
 * Large, touch-friendly button with accent color
 */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import { textStyles } from '../../theme/typography';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  large?: boolean;
}

export default function PrimaryButton({ 
  title, 
  onPress, 
  disabled = false,
  loading = false,
  style,
  large = false,
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        large && styles.buttonLarge,
        disabled && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={colors.textOnAccent} />
      ) : (
        <Text style={[styles.text, disabled && styles.textDisabled]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.accent,
    height: spacing.buttonHeight,
    borderRadius: spacing.radiusMedium,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    minWidth: 120,
  },
  buttonLarge: {
    height: spacing.buttonHeightLarge,
    paddingHorizontal: spacing.xxl,
  },
  buttonDisabled: {
    backgroundColor: colors.disabled,
  },
  text: {
    ...textStyles.button,
    color: colors.textOnAccent,
  },
  textDisabled: {
    color: colors.textSecondary,
  },
});
