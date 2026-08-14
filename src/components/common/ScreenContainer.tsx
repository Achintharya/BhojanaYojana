/**
 * Screen Container Component
 * Provides consistent background and safe area handling
 */
import React from 'react';
import { View, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export default function ScreenContainer({ 
  children, 
  scrollable = true,
  style,
  contentStyle,
}: ScreenContainerProps) {
  if (scrollable) {
    return (
      <SafeAreaView style={[styles.container, style]} edges={['bottom']}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={[styles.content, contentStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, style]} edges={['bottom']}>
      <View style={[styles.content, contentStyle]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.screenPadding,
  },
});
