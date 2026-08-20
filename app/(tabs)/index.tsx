/**
 * Home/Dashboard screen
 * Overview of pantry, upcoming meals, and prep tasks
 */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { PreparationTask, MealPlan } from '../../src/database/types';
import { getUpcomingTasks, updatePreparationTask } from '../../src/modules/preparation/preparationData';
import { getLowStockItems } from '../../src/modules/pantry/pantryData';
import { getUnpurchasedItems } from '../../src/modules/grocery/groceryData';
import { getMealPlansWithRecipes } from '../../src/modules/mealPlanning/mealPlanData';
import { requestNotificationPermissions, hasNotificationPermissions } from '../../src/modules/preparation/notificationManager';
import { supportsNativeNotifications, isWeb } from '../../src/utils/platform';
import ScreenContainer from '../../src/components/common/ScreenContainer';
import SectionHeader from '../../src/components/common/SectionHeader';
import ActionCard from '../../src/components/common/ActionCard';
import StatusCard from '../../src/components/common/StatusCard';
import colors from '../../src/theme/colors';
import spacing from '../../src/theme/spacing';
import { textStyles, typography } from '../../src/theme/typography';

export default function HomeScreen() {
  const router = useRouter();
  const [upcomingTasks, setUpcomingTasks] = useState<PreparationTask[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [groceryCount, setGroceryCount] = useState(0);
  const [todayMeals, setTodayMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load tasks due in the next 24 hours
      const tasks = await getUpcomingTasks(24);
      setUpcomingTasks(tasks);

      // Check notification permissions
      const hasPerms = await hasNotificationPermissions();
      setNotificationsEnabled(hasPerms);

      // Load low stock items count
      const lowStockItems = await getLowStockItems();
      setLowStockCount(lowStockItems.length);

      // Load grocery items count
      const unpurchasedItems = await getUnpurchasedItems();
      setGroceryCount(unpurchasedItems.length);

      // Load today's meals
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const meals = await getMealPlansWithRecipes(today, tomorrow);
      setTodayMeals(meals.filter(m => m.planned_date === today));
    } catch (error) {
      console.error('Error loading home screen data:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const getMealTypeLabel = (mealType: string) => {
    const labels: Record<string, string> = {
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
    };
    return labels[mealType] || mealType;
  };

  const getMealTypeIcon = (mealType: string) => {
    const icons: Record<string, string> = {
      breakfast: '☀️',
      lunch: '☀️',
      dinner: '🌙',
    };
    return icons[mealType] || '🍽️';
  };

  return (
    <ScreenContainer>
      {/* Web Notification Banner */}
      {isWeb && (
        <TouchableOpacity style={styles.webNotificationBanner} activeOpacity={0.9}>
          <View style={styles.notificationIcon}>
            <Text style={styles.notificationIconText}>🔔</Text>
          </View>
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>Reminders on Web</Text>
            <Text style={styles.notificationMessage}>
              Native notifications are not supported on Web. Prep tasks remain visible here. Use Android app for reminders.
            </Text>
          </View>
          <Text style={styles.notificationArrow}>›</Text>
        </TouchableOpacity>
      )}

      {/* Tomorrow's Prep */}
      <View style={styles.prepSection}>
        <SectionHeader title="Tomorrow's Prep" />
        {loading ? (
          <View style={styles.prepCard}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : upcomingTasks.length === 0 ? (
          <View style={styles.prepCard}>
            <View style={styles.prepEmpty}>
              <View style={styles.prepEmptyIcon}>
                <Text style={styles.prepEmptyIconText}>😊</Text>
              </View>
              <View style={styles.prepEmptyContent}>
                <Text style={styles.prepEmptyTitle}>No preparation tasks</Text>
                <Text style={styles.prepEmptyMessage}>Enjoy your day!</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.prepCard}>
            {upcomingTasks.slice(0, 3).map((task) => (
              <TouchableOpacity
                key={task.id}
                style={styles.prepTask}
                onPress={() => router.push('/mealplan')}
                activeOpacity={0.7}
              >
                <Text style={styles.prepTaskText}>{task.description}</Text>
                <Text style={styles.prepTaskTime}>
                  {new Date(task.reminder_time).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* What's in My Fridge */}
      <TouchableOpacity
        style={styles.fridgeCard}
        onPress={() => router.push('/fridge-recipes')}
        activeOpacity={0.7}
      >
        <View style={styles.fridgeContent}>
          <View style={styles.fridgeLeft}>
            <View style={styles.fridgeIconContainer}>
              <Text style={styles.fridgeIcon}>🧊</Text>
            </View>
            <View>
              <Text style={styles.fridgeTitle}>What's in My Fridge?</Text>
              <Text style={styles.fridgeMessage}>See recipes you can make with what you have</Text>
            </View>
          </View>
          <View style={styles.fridgeRight}>
            <Text style={styles.fridgeVegetables}>🍅🧄🫑</Text>
          </View>
        </View>
        <View style={styles.fridgeButton}>
          <Text style={styles.fridgeButtonText}>Find Recipes →</Text>
        </View>
      </TouchableOpacity>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <SectionHeader title="Quick Actions" />
        <View style={styles.actionsRow}>
          <ActionCard
            iconName="calendar"
            title="Plan Meals"
            onPress={() => router.push('/mealplan')}
            backgroundColor="#FF8A3D"
            textColor="#FFFFFF"
            iconColor="#FFFFFF"
          />
          <View style={styles.actionSpacer} />
          <ActionCard
            iconName="book"
            title="Recipes"
            onPress={() => router.push('/recipes')}
            backgroundColor="#F5E6D3"
            textColor="#3D2817"
            iconColor="#3D2817"
          />
        </View>
        <View style={styles.actionsRow}>
          <ActionCard
            iconName="cart"
            title="Grocery List"
            onPress={() => router.push('/grocery')}
            backgroundColor="#F5E6D3"
            textColor="#3D2817"
            iconColor="#3D2817"
          />
          <View style={styles.actionSpacer} />
          <ActionCard
            iconName="archive"
            title="Pantry"
            onPress={() => router.push('/pantry')}
            backgroundColor="#3D2817"
            textColor="#FFB86F"
            iconColor="#FFB86F"
          />
          <View style={styles.actionSpacer} />
          <ActionCard
            iconName="pie-chart"
            title="Nutrition"
            onPress={() => router.push('/nutrition')}
            backgroundColor="#F5E6D3"
            textColor="#3D2817"
            iconColor="#FF8A3D"
          />
        </View>
      </View>

      {/* Status Cards */}
      <View style={styles.statusSection}>
        <View style={styles.statusRow}>
          <View style={styles.statusCardWrapper}>
            <StatusCard
              icon="🏺"
              title="Pantry Status"
              count={lowStockCount}
              subtitle="Low Stock Items"
              onPress={() => router.push('/pantry')}
              accentColor={colors.accent}
            />
          </View>
          <View style={styles.statusSpacer} />
          <View style={styles.statusCardWrapper}>
            <StatusCard
              icon="🛒"
              title="Grocery List"
              count={groceryCount}
              subtitle="Items to Buy"
              onPress={() => router.push('/grocery')}
              accentColor={colors.accent}
            />
          </View>
        </View>

        <View style={styles.todayMealsCard}>
          <View style={styles.todayMealsHeader}>
            <Text style={styles.todayMealsIcon}>📅</Text>
            <Text style={styles.todayMealsTitle}>Today's Meals</Text>
          </View>
          {todayMeals.length === 0 ? (
            <Text style={styles.todayMealsEmpty}>No meals planned</Text>
          ) : (
            <View style={styles.mealsList}>
              {['breakfast', 'lunch', 'dinner'].map((mealType) => {
                const meal = todayMeals.find((m) => m.meal_type === mealType);
                return (
                  <View key={mealType} style={styles.mealRow}>
                    <Text style={styles.mealIcon}>{getMealTypeIcon(mealType)}</Text>
                    <Text style={styles.mealType}>{getMealTypeLabel(mealType)}</Text>
                    <Text style={styles.mealValue}>{meal?.name || '--'}</Text>
                  </View>
                );
              })}
            </View>
          )}
          <TouchableOpacity
            style={styles.planMealsButton}
            onPress={() => router.push('/mealplan')}
            activeOpacity={0.7}
          >
            <Text style={styles.planMealsButtonText}>Plan Meals →</Text>
          </TouchableOpacity>
        </View>
      </View>

    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  // Greeting
  greeting: {
    marginBottom: spacing.sectionGap,
  },
  greetingText: {
    ...textStyles.screenTitle,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...textStyles.bodyLarge,
    color: colors.textSecondary,
  },
  
  // Web notification banner
  webNotificationBanner: {
    backgroundColor: colors.secondary,
    borderRadius: spacing.radiusMedium,
    padding: spacing.base,
    marginBottom: spacing.sectionGap,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  notificationIconText: {
    fontSize: 24,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    ...textStyles.body,
    fontWeight: typography.weight.semibold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  notificationMessage: {
    ...textStyles.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  notificationArrow: {
    fontSize: 24,
    color: colors.textTertiary,
    marginLeft: spacing.sm,
  },
  
  // Tomorrow's Prep
  prepSection: {
    marginBottom: spacing.sectionGap,
  },
  prepCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.radiusMedium,
    padding: spacing.cardPadding,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  prepEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  prepEmptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  prepEmptyIconText: {
    fontSize: 32,
  },
  prepEmptyContent: {
    flex: 1,
  },
  prepEmptyTitle: {
    ...textStyles.cardTitle,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  prepEmptyMessage: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
  prepTask: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  prepTaskText: {
    ...textStyles.body,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.md,
  },
  prepTaskTime: {
    ...textStyles.caption,
    color: colors.accent,
    fontWeight: typography.weight.semibold,
  },
  loadingText: {
    ...textStyles.body,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  
  // Quick Actions
  quickActions: {
    marginBottom: spacing.sectionGap,
  },
  actionsRow: {
    flexDirection: 'row',
    marginBottom: spacing.cardGap,
  },
  actionSpacer: {
    width: spacing.cardGap,
  },
  
  // Status Section
  statusSection: {
    marginBottom: spacing.sectionGap,
  },
  statusRow: {
    flexDirection: 'row',
    marginBottom: spacing.cardGapLarge,
  },
  statusCardWrapper: {
    flex: 1,
  },
  statusSpacer: {
    width: spacing.cardGapLarge,
  },
  todayMealsCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.radiusMedium,
    padding: spacing.cardPaddingLarge,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  todayMealsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  todayMealsIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  todayMealsTitle: {
    ...textStyles.cardTitle,
    color: colors.primary,
  },
  todayMealsEmpty: {
    ...textStyles.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  mealsList: {
    marginBottom: spacing.base,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  mealIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  mealType: {
    ...textStyles.body,
    color: colors.textPrimary,
    width: 80,
  },
  mealValue: {
    ...textStyles.body,
    color: colors.textSecondary,
    flex: 1,
  },
  planMealsButton: {
    backgroundColor: colors.surfaceLight,
    borderRadius: spacing.radiusSmall,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  planMealsButtonText: {
    ...textStyles.body,
    color: colors.accent,
    fontWeight: typography.weight.semibold,
  },
  
  // What's in My Fridge
  fridgeCard: {
    backgroundColor: colors.primary,
    borderRadius: spacing.radiusLarge,
    padding: spacing.cardPaddingLarge,
    marginBottom: spacing.lg,
  },
  fridgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
  },
  fridgeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fridgeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  fridgeIcon: {
    fontSize: 24,
  },
  fridgeTitle: {
    ...textStyles.cardTitle,
    color: colors.textOnPrimary,
    marginBottom: spacing.xs,
  },
  fridgeMessage: {
    ...textStyles.caption,
    color: colors.secondary,
  },
  fridgeRight: {
    marginLeft: spacing.md,
  },
  fridgeVegetables: {
    fontSize: 32,
  },
  fridgeButton: {
    backgroundColor: colors.accent,
    borderRadius: spacing.radiusMedium,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  fridgeButtonText: {
    ...textStyles.button,
    color: colors.textOnAccent,
  },
});
