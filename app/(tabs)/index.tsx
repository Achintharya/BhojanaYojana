/**
 * Home/Dashboard screen
 * Overview of pantry, upcoming meals, and prep tasks
 */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { PreparationTask } from '../../src/database/types';
import { getUpcomingTasks, updatePreparationTask } from '../../src/modules/preparation/preparationData';
import TomorrowPrepCard from '../../src/components/TomorrowPrepCard';
import { requestNotificationPermissions, hasNotificationPermissions } from '../../src/modules/preparation/notificationManager';
import { supportsNativeNotifications, isWeb } from '../../src/utils/platform';

export default function HomeScreen() {
  const router = useRouter();
  const [upcomingTasks, setUpcomingTasks] = useState<PreparationTask[]>([]);
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

  const handleCompleteTask = async (taskId: number) => {
    try {
      await updatePreparationTask(taskId, { is_completed: 1 });
      Alert.alert('Success', 'Task marked as completed!', [{ text: 'OK' }]);
      loadData();
    } catch (error) {
      console.error('Error completing task:', error);
      Alert.alert('Error', 'Failed to complete task');
    }
  };

  const handleEnableNotifications = async () => {
    if (!supportsNativeNotifications) {
      Alert.alert(
        'Web Platform',
        'Native notifications are not supported on Web. Preparation tasks will remain visible in the app. Use the Android app for notification reminders.',
        [{ text: 'OK' }]
      );
      return;
    }

    const granted = await requestNotificationPermissions();
    if (granted) {
      setNotificationsEnabled(true);
      Alert.alert('Success', 'Notifications enabled! You will receive meal prep reminders.', [
        { text: 'OK' },
      ]);
    } else {
      Alert.alert(
        'Permissions Denied',
        'Please enable notifications in your device settings to receive meal prep reminders.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Bhojana Yojana</Text>
        <Text style={styles.subtitle}>Your household meal planning companion</Text>

        {/* Notification Permission Banner */}
        {!notificationsEnabled && (
          <TouchableOpacity
            style={styles.notificationBanner}
            onPress={handleEnableNotifications}
            activeOpacity={0.7}
          >
            <Text style={styles.notificationBannerIcon}>🔔</Text>
            <View style={styles.notificationBannerContent}>
              <Text style={styles.notificationBannerTitle}>
                {isWeb ? 'Notifications (Web)' : 'Enable Notifications'}
              </Text>
              <Text style={styles.notificationBannerText}>
                {isWeb
                  ? 'Native notifications not supported on Web. Prep tasks remain visible. Use Android app for reminders.'
                  : 'Get reminders for meal preparation tasks'}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Tomorrow's Prep Card */}
        {loading ? (
          <View style={styles.section}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <TomorrowPrepCard
            tasks={upcomingTasks}
            onCompleteTask={handleCompleteTask}
            onTaskPress={(task) => {
              // Navigate to meal planner to see the related meal
              router.push('/mealplan');
            }}
          />
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/mealplan')}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonIcon}>📅</Text>
            <Text style={styles.actionButtonText}>Plan Your Meals</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/recipes')}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonIcon}>📖</Text>
            <Text style={styles.actionButtonText}>Browse Recipes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/grocery')}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonIcon}>🛒</Text>
            <Text style={styles.actionButtonText}>Grocery List</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    marginVertical: 4,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    paddingVertical: 24,
  },
  notificationBanner: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  notificationBannerIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  notificationBannerContent: {
    flex: 1,
  },
  notificationBannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 4,
  },
  notificationBannerText: {
    fontSize: 14,
    color: '#F57C00',
  },
  actionButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});
