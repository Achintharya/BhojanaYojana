/**
 * Tab navigation layout for main app screens
 */
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import colors from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.textOnPrimary,
        headerTitleStyle: {
          fontWeight: typography.weight.bold,
          fontSize: typography.size.lg,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.primary,
          height: Platform.OS === 'android' ? 70 : 85,
          paddingBottom: Platform.OS === 'android' ? 10 : 20,
          paddingTop: 8,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: typography.size.xs,
          fontWeight: typography.weight.semibold,
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name="pantry"
        options={{
          title: 'Pantry',
          tabBarLabel: 'Pantry',
        }}
      />
      <Tabs.Screen
        name="grocery"
        options={{
          title: 'Grocery List',
          tabBarLabel: 'Grocery',
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: 'Recipes',
          tabBarLabel: 'Recipes',
        }}
      />
      <Tabs.Screen
        name="mealplan"
        options={{
          title: 'Meal Planner',
          tabBarLabel: 'Meals',
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Nutrition',
          tabBarLabel: 'Nutrition',
        }}
      />
    </Tabs>
  );
}
