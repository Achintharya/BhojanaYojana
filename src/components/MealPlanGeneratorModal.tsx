/**
 * Meal Plan Generator Modal Component
 * UI for generating and previewing diet-aligned meal plans
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Recipe, NutritionTarget } from '../database/types';
import {
  generateMealPlan,
  evaluatePlanQuality,
  GeneratedMealPlan,
} from '../modules/mealPlanning/mealPlanGenerator';

interface MealPlanGeneratorModalProps {
  visible: boolean;
  onClose: () => void;
  onAcceptPlan: (plan: GeneratedMealPlan) => void;
  recipes: Recipe[];
  nutritionTarget: NutritionTarget | null;
}

export default function MealPlanGeneratorModal({
  visible,
  onClose,
  onAcceptPlan,
  recipes,
  nutritionTarget,
}: MealPlanGeneratorModalProps) {
  const [generating, setGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedMealPlan | null>(null);

  const handleGenerate = () => {
    setGenerating(true);
    
    // Use setTimeout to allow UI to update
    setTimeout(() => {
      try {
        const plan = generateMealPlan(recipes, nutritionTarget);
        
        if (plan) {
          setGeneratedPlan(plan);
        } else {
          Alert.alert(
            'Generation Failed',
            'Could not generate a meal plan. Make sure you have at least 3 recipes with complete nutrition data.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Error generating meal plan:', error);
        Alert.alert('Error', 'Failed to generate meal plan');
      } finally {
        setGenerating(false);
      }
    }, 100);
  };

  const handleAccept = () => {
    if (generatedPlan) {
      onAcceptPlan(generatedPlan);
      setGeneratedPlan(null);
      onClose();
    }
  };

  const handleRegenerate = () => {
    setGeneratedPlan(null);
    handleGenerate();
  };

  const handleCancel = () => {
    setGeneratedPlan(null);
    onClose();
  };

  const quality = generatedPlan ? evaluatePlanQuality(generatedPlan) : null;

  const targets = {
    calories: nutritionTarget?.calories_target ?? 2000,
    protein: nutritionTarget?.protein_target ?? 50,
    carbs: nutritionTarget?.carbs_target ?? 250,
    fat: nutritionTarget?.fat_target ?? 70,
    fiber: nutritionTarget?.fiber_target ?? 25,
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Generate Meal Plan</Text>
          <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Introduction */}
          {!generatedPlan && !generating && (
            <View style={styles.intro}>
              <Text style={styles.introIcon}>🍽️</Text>
              <Text style={styles.introTitle}>AI-Free Meal Planning</Text>
              <Text style={styles.introText}>
                Generate a balanced meal plan using deterministic algorithms based on your
                nutrition targets.
              </Text>

              <View style={styles.targetBox}>
                <Text style={styles.targetBoxTitle}>Your Daily Targets</Text>
                <View style={styles.targetRow}>
                  <Text style={styles.targetLabel}>Calories:</Text>
                  <Text style={styles.targetValue}>{targets.calories}</Text>
                </View>
                <View style={styles.targetRow}>
                  <Text style={styles.targetLabel}>Protein:</Text>
                  <Text style={styles.targetValue}>{targets.protein}g</Text>
                </View>
                <View style={styles.targetRow}>
                  <Text style={styles.targetLabel}>Carbs:</Text>
                  <Text style={styles.targetValue}>{targets.carbs}g</Text>
                </View>
                <View style={styles.targetRow}>
                  <Text style={styles.targetLabel}>Fat:</Text>
                  <Text style={styles.targetValue}>{targets.fat}g</Text>
                </View>
                <View style={styles.targetRow}>
                  <Text style={styles.targetLabel}>Fiber:</Text>
                  <Text style={styles.targetValue}>{targets.fiber}g</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.generateButton} onPress={handleGenerate}>
                <Text style={styles.generateButtonText}>✨ Generate Plan</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Generating */}
          {generating && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Generating your meal plan...</Text>
              <Text style={styles.loadingSubtext}>
                Finding the best combination from your recipes
              </Text>
            </View>
          )}

          {/* Generated Plan */}
          {generatedPlan && !generating && (
            <View style={styles.planContainer}>
              {/* Quality Rating */}
              {quality && (
                <View style={[styles.qualityBadge, styles[`quality${quality.rating}`]]}>
                  <Text style={styles.qualityRating}>
                    {quality.rating.toUpperCase()}
                  </Text>
                  <Text style={styles.qualityMessage}>{quality.message}</Text>
                </View>
              )}

              {/* Meals */}
              <View style={styles.mealsSection}>
                <MealCard title="🌅 Breakfast" recipe={generatedPlan.breakfast} />
                <MealCard title="☀️ Lunch" recipe={generatedPlan.lunch} />
                <MealCard title="🌙 Dinner" recipe={generatedPlan.dinner} />
              </View>

              {/* Nutrition Summary */}
              <View style={styles.nutritionSection}>
                <Text style={styles.sectionTitle}>Daily Nutrition Totals</Text>
                <View style={styles.nutritionGrid}>
                  <NutritionCompare
                    label="Calories"
                    actual={Math.round(generatedPlan.totalNutrition.calories)}
                    target={targets.calories}
                    unit=""
                  />
                  <NutritionCompare
                    label="Protein"
                    actual={Math.round(generatedPlan.totalNutrition.protein)}
                    target={targets.protein}
                    unit="g"
                  />
                  <NutritionCompare
                    label="Carbs"
                    actual={Math.round(generatedPlan.totalNutrition.carbs)}
                    target={targets.carbs}
                    unit="g"
                  />
                  <NutritionCompare
                    label="Fat"
                    actual={Math.round(generatedPlan.totalNutrition.fat)}
                    target={targets.fat}
                    unit="g"
                  />
                  <NutritionCompare
                    label="Fiber"
                    actual={Math.round(generatedPlan.totalNutrition.fiber)}
                    target={targets.fiber}
                    unit="g"
                  />
                </View>
              </View>

              {/* Warnings */}
              {generatedPlan.warnings.length > 0 && (
                <View style={styles.warningsSection}>
                  <Text style={styles.warningsTitle}>⚠️ Notices</Text>
                  {generatedPlan.warnings.map((warning, index) => (
                    <Text key={index} style={styles.warningText}>
                      • {warning}
                    </Text>
                  ))}
                </View>
              )}

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity style={styles.regenerateButton} onPress={handleRegenerate}>
                  <Text style={styles.regenerateButtonText}>🔄 Try Another</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
                  <Text style={styles.acceptButtonText}>✓ Accept Plan</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.disclaimer}>
                This plan will not overwrite your existing meals. You can review and adjust
                after accepting.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

function MealCard({ title, recipe }: { title: string; recipe: Recipe }) {
  return (
    <View style={styles.mealCard}>
      <Text style={styles.mealTitle}>{title}</Text>
      <Text style={styles.mealName}>{recipe.name}</Text>
      <Text style={styles.mealNutrition}>
        {Math.round(recipe.calories_per_serving!)} cal • {recipe.protein_grams}g protein
      </Text>
    </View>
  );
}

function NutritionCompare({
  label,
  actual,
  target,
  unit,
}: {
  label: string;
  actual: number;
  target: number;
  unit: string;
}) {
  const percentage = (actual / target) * 100;
  const isGood = percentage >= 90 && percentage <= 110;
  const isLow = percentage < 90;

  return (
    <View style={styles.nutritionCompare}>
      <Text style={styles.nutritionLabel}>{label}</Text>
      <Text style={[styles.nutritionActual, isGood && styles.nutritionGood, isLow && styles.nutritionLow]}>
        {actual}{unit}
      </Text>
      <Text style={styles.nutritionTarget}>/ {target}{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4CAF50',
    padding: 16,
    paddingTop: 48,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  intro: {
    padding: 24,
    alignItems: 'center',
  },
  introIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  introText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  targetBox: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  targetBoxTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  targetLabel: {
    fontSize: 14,
    color: '#666',
  },
  targetValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  generateButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
  },
  generateButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 64,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  planContainer: {
    padding: 16,
  },
  qualityBadge: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  qualityexcellent: {
    backgroundColor: '#C8E6C9',
  },
  qualitygood: {
    backgroundColor: '#DCEDC8',
  },
  qualityfair: {
    backgroundColor: '#FFF9C4',
  },
  qualitypoor: {
    backgroundColor: '#FFCCBC',
  },
  qualityRating: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  qualityMessage: {
    fontSize: 14,
    color: '#666',
  },
  mealsSection: {
    marginBottom: 16,
  },
  mealCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  mealTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  mealNutrition: {
    fontSize: 13,
    color: '#999',
  },
  nutritionSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  nutritionGrid: {
    gap: 12,
  },
  nutritionCompare: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  nutritionLabel: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  nutritionActual: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 4,
  },
  nutritionGood: {
    color: '#4CAF50',
  },
  nutritionLow: {
    color: '#FF9800',
  },
  nutritionTarget: {
    fontSize: 14,
    color: '#999',
  },
  warningsSection: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  warningsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F57C00',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#F57C00',
    lineHeight: 20,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  regenerateButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
  },
  regenerateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    textAlign: 'center',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  disclaimer: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});
