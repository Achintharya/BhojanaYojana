/**
 * Notification manager for preparation task reminders
 * Handles scheduling, updating, and canceling local notifications
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { PreparationTask } from '../../database/types';

// Configure notification behavior when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions from the user
 * Returns true if granted, false otherwise
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions denied');
      return false;
    }

    // For Android, set up notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('meal-prep', {
        name: 'Meal Preparation',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
        description: 'Reminders for meal preparation tasks',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Check if notification permissions are granted
 */
export async function hasNotificationPermissions(): Promise<boolean> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking notification permissions:', error);
    return false;
  }
}

/**
 * Schedule a notification for a preparation task
 * Returns the notification identifier or null on failure
 */
export async function scheduleTaskNotification(task: PreparationTask): Promise<string | null> {
  try {
    // Check permissions first
    const hasPermission = await hasNotificationPermissions();
    if (!hasPermission) {
      console.log('Cannot schedule notification: permissions not granted');
      return null;
    }

    // Parse reminder time (format: "YYYY-MM-DD HH:MM:SS")
    const reminderDate = new Date(task.reminder_time.replace(' ', 'T'));
    const now = new Date();

    // Don't schedule if reminder time is in the past
    if (reminderDate <= now) {
      console.log('Skipping notification: reminder time is in the past');
      return null;
    }

    // Calculate trigger time (seconds from now)
    const secondsUntilTrigger = Math.floor((reminderDate.getTime() - now.getTime()) / 1000);

    // Schedule the notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🍳 Meal Prep Reminder',
        body: task.description,
        data: {
          taskId: task.id,
          taskType: task.task_type,
          mealPlanId: task.meal_plan_id,
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        ...(Platform.OS === 'android' && { channelId: 'meal-prep' }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: secondsUntilTrigger,
        repeats: false,
      },
    });

    console.log(`Notification scheduled: ${notificationId} for task ${task.id}`);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(notificationId: string): Promise<boolean> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log(`Notification cancelled: ${notificationId}`);
    return true;
  } catch (error) {
    console.error('Error canceling notification:', error);
    return false;
  }
}

/**
 * Cancel multiple notifications
 */
export async function cancelNotifications(notificationIds: string[]): Promise<void> {
  try {
    for (const id of notificationIds) {
      await cancelNotification(id);
    }
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled');
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
}

/**
 * Update a notification by canceling the old one and scheduling a new one
 */
export async function updateTaskNotification(
  oldNotificationId: string | null,
  task: PreparationTask
): Promise<string | null> {
  try {
    // Cancel old notification if it exists
    if (oldNotificationId) {
      await cancelNotification(oldNotificationId);
    }

    // Schedule new notification
    return await scheduleTaskNotification(task);
  } catch (error) {
    console.error('Error updating notification:', error);
    return null;
  }
}

/**
 * Get all scheduled notifications (useful for debugging)
 */
export async function getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

/**
 * Test notification (immediate delivery)
 * Useful for testing notification setup
 */
export async function sendTestNotification(): Promise<boolean> {
  try {
    const hasPermission = await hasNotificationPermissions();
    if (!hasPermission) {
      console.log('Cannot send test notification: permissions not granted');
      return false;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🍳 Test Notification',
        body: 'Meal prep reminders are working!',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        ...(Platform.OS === 'android' && { channelId: 'meal-prep' }),
      },
      trigger: null, // Send immediately
    });

    return true;
  } catch (error) {
    console.error('Error sending test notification:', error);
    return false;
  }
}

/**
 * Listen for notification responses (when user taps on notification)
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Listen for received notifications (when notification is received while app is open)
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}
