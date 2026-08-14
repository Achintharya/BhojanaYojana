/**
 * Secondary Button Component
 * Outlined button for secondary actions
 */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import { textStyles } from '../../theme/typography';

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  large?: boolean;
}

export default function SecondaryButton({ 
  title, 
  onPress, 
  disabled = false,
  style,
  large = false,
}: SecondaryButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        large && styles.buttonLarge,
        disabled && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, disabled && styles.textDisabled]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'transparent',
    height: spacing.buttonHeight,
    borderRadius: spacing.radiusMedium,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    minWidth: 120,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonLarge: {
    height: spacing.buttonHeightLarge,
    paddingHorizontal: spacing.xxl,
  },
  buttonDisabled: {
    borderColor: colors.disabled,
  },
  text: {
    ...textStyles.button,
    color: colors.primary,
  },
  textDisabled: {
    color: colors.disabled,
  },
});
