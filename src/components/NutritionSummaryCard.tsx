/**
 * Nutrition Summary Card Component
 * Display daily nutrition totals vs targets
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NutritionComparison, roundToDecimal } from '../modules/mealPlanning/mealPlanningLogic';

interface NutritionSummaryCardProps {
  comparison: NutritionComparison;
}

export default function NutritionSummaryCard({ comparison }: NutritionSummaryCardProps) {
  const getStatusColor = (status: 'below' | 'met' | 'exceeded') => {
    switch (status) {
      case 'below':
        return '#FF9800'; // Orange
      case 'met':
        return '#4CAF50'; // Green
      case 'exceeded':
        return '#f44336'; // Red
    }
  };

  const getStatusLabel = (status: 'below' | 'met' | 'exceeded') => {
    switch (status) {
      case 'below':
        return 'Below';
      case 'met':
        return 'Met';
      case 'exceeded':
        return 'Exceeded';
    }
  };

  const renderNutrientRow = (
    label: string,
    actual: number,
    target: number,
    remaining: number,
    status: 'below' | 'met' | 'exceeded',
    unit: string
  ) => {
    const percentage = target > 0 ? (actual / target) * 100 : 0;

    return (
      <View style={styles.nutrientRow} key={label}>
        <View style={styles.nutrientHeader}>
          <Text style={styles.nutrientLabel}>{label}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
            <Text style={styles.statusText}>{getStatusLabel(status)}</Text>
          </View>
        </View>

        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: getStatusColor(status),
              },
            ]}
          />
        </View>

        <View style={styles.nutrientDetails}>
          <Text style={styles.nutrientValue}>
            {roundToDecimal(actual, 1)} / {roundToDecimal(target, 1)} {unit}
          </Text>
          <Text
            style={[
              styles.nutrientRemaining,
              { color: remaining >= 0 ? '#666' : '#f44336' },
            ]}
          >
            {remaining >= 0 ? 'Remaining: ' : 'Over by: '}
            {roundToDecimal(Math.abs(remaining), 1)} {unit}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Daily Nutrition Summary</Text>

      {renderNutrientRow(
        'Calories',
        comparison.actual.calories,
        comparison.target.calories,
        comparison.remaining.calories,
        comparison.status.calories,
        'kcal'
      )}

      {renderNutrientRow(
        'Protein',
        comparison.actual.protein,
        comparison.target.protein,
        comparison.remaining.protein,
        comparison.status.protein,
        'g'
      )}

      {renderNutrientRow(
        'Carbohydrates',
        comparison.actual.carbs,
        comparison.target.carbs,
        comparison.remaining.carbs,
        comparison.status.carbs,
        'g'
      )}

      {renderNutrientRow(
        'Fat',
        comparison.actual.fat,
        comparison.target.fat,
        comparison.remaining.fat,
        comparison.status.fat,
        'g'
      )}

      {renderNutrientRow(
        'Fiber',
        comparison.actual.fiber,
        comparison.target.fiber,
        comparison.remaining.fiber,
        comparison.status.fiber,
        'g'
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  nutrientRow: {
    marginBottom: 20,
  },
  nutrientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nutrientLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  nutrientDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutrientValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  nutrientRemaining: {
    fontSize: 14,
    color: '#666',
  },
});
