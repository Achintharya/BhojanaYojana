/**
 * Tomorrow's Prep Card Component
 * Displays upcoming preparation tasks for the next 24 hours
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { PreparationTask } from '../database/types';
import {
  formatReminderTimeRelative,
  formatReminderTimeAbsolute,
  getTaskPriority,
} from '../modules/preparation/preparationLogic';

interface TomorrowPrepCardProps {
  tasks: PreparationTask[];
  onTaskPress?: (task: PreparationTask) => void;
  onCompleteTask?: (taskId: number) => void;
}

export default function TomorrowPrepCard({
  tasks,
  onTaskPress,
  onCompleteTask,
}: TomorrowPrepCardProps) {
  if (tasks.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>✅</Text>
          <Text style={styles.headerTitle}>Tomorrow's Prep</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>😌</Text>
          <Text style={styles.emptyText}>No preparation tasks needed</Text>
          <Text style={styles.emptySubtext}>Enjoy your day!</Text>
        </View>
      </View>
    );
  }

  // Sort tasks by reminder time (earliest first)
  const sortedTasks = [...tasks].sort((a, b) => {
    const timeA = new Date(a.reminder_time.replace(' ', 'T')).getTime();
    const timeB = new Date(b.reminder_time.replace(' ', 'T')).getTime();
    return timeA - timeB;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>📋</Text>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Tomorrow's Prep</Text>
          <Text style={styles.headerSubtitle}>
            {tasks.length} task{tasks.length > 1 ? 's' : ''} in the next 24 hours
          </Text>
        </View>
      </View>

      <ScrollView style={styles.taskList} showsVerticalScrollIndicator={false}>
        {sortedTasks.map((task) => {
          const priority = getTaskPriority(task.reminder_time);
          const isCompleted = task.is_completed === 1;

          return (
            <TouchableOpacity
              key={task.id}
              style={[
                styles.taskItem,
                isCompleted && styles.taskItemCompleted,
                priority === 'urgent' && !isCompleted && styles.taskItemUrgent,
              ]}
              onPress={() => onTaskPress?.(task)}
              activeOpacity={0.7}
            >
              <View style={styles.taskContent}>
                <View style={styles.taskHeader}>
                  <Text style={[styles.taskType, isCompleted && styles.taskTypeCompleted]}>
                    {task.task_type.toUpperCase()}
                  </Text>
                  <View
                    style={[
                      styles.priorityBadge,
                      priority === 'urgent' && styles.priorityUrgent,
                      priority === 'soon' && styles.prioritySoon,
                      priority === 'upcoming' && styles.priorityUpcoming,
                      priority === 'later' && styles.priorityLater,
                    ]}
                  >
                    <Text style={styles.priorityText}>
                      {priority === 'urgent' ? '🔥' : priority === 'soon' ? '⏰' : '📅'}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.taskDescription, isCompleted && styles.taskDescriptionCompleted]}>
                  {task.description}
                </Text>

                <View style={styles.taskFooter}>
                  <Text style={[styles.taskTime, isCompleted && styles.taskTimeCompleted]}>
                    {formatReminderTimeAbsolute(task.reminder_time)}
                  </Text>
                  <Text style={[styles.taskTimeRelative, isCompleted && styles.taskTimeCompleted]}>
                    ({formatReminderTimeRelative(task.reminder_time)})
                  </Text>
                </View>
              </View>

              {!isCompleted && onCompleteTask && (
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    onCompleteTask(task.id);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.completeButtonText}>✓</Text>
                </TouchableOpacity>
              )}

              {isCompleted && (
                <View style={styles.completedBadge}>
                  <Text style={styles.completedBadgeText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  taskList: {
    maxHeight: 300,
  },
  taskItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  taskItemCompleted: {
    backgroundColor: '#f0f0f0',
    borderLeftColor: '#9E9E9E',
    opacity: 0.7,
  },
  taskItemUrgent: {
    borderLeftColor: '#FF5722',
    backgroundColor: '#fff3e0',
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  taskType: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4CAF50',
    letterSpacing: 0.5,
  },
  taskTypeCompleted: {
    color: '#9E9E9E',
  },
  priorityBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityUrgent: {
    backgroundColor: '#FFEBEE',
  },
  prioritySoon: {
    backgroundColor: '#FFF3E0',
  },
  priorityUpcoming: {
    backgroundColor: '#E3F2FD',
  },
  priorityLater: {
    backgroundColor: '#F5F5F5',
  },
  priorityText: {
    fontSize: 12,
  },
  taskDescription: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 6,
    lineHeight: 18,
  },
  taskDescriptionCompleted: {
    color: '#9E9E9E',
    textDecorationLine: 'line-through',
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  taskTime: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginRight: 6,
  },
  taskTimeCompleted: {
    color: '#9E9E9E',
  },
  taskTimeRelative: {
    fontSize: 12,
    color: '#999',
  },
  completeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  completedBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#9E9E9E',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  completedBadgeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
