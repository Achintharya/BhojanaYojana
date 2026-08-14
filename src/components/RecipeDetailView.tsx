/**
 * Recipe Detail View Component
 * Displays full recipe information including ingredients and instructions
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Recipe, RecipeContent, RecipeIngredient, PantryItem, Language } from '../database/types';

interface RecipeDetailViewProps {
  recipe: Recipe;
  content: RecipeContent | null;
  ingredients: Array<RecipeIngredient & { pantry_item_name: string }>;
  selectedLanguage: Language;
  onChangeLanguage: (language: Language) => void;
}

export default function RecipeDetailView({
  recipe,
  content,
  ingredients,
  selectedLanguage,
  onChangeLanguage,
}: RecipeDetailViewProps) {
  const hasCompleteNutrition = 
    recipe.calories_per_serving !== null &&
    recipe.protein_grams !== null &&
    recipe.carbs_grams !== null &&
    recipe.fat_grams !== null &&
    recipe.fiber_grams !== null;

  const totalTime = 
    (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);

  const handleOpenVideo = async () => {
    if (content?.video_url) {
      try {
        await Linking.openURL(content.video_url);
      } catch (error) {
        console.error('Error opening video URL:', error);
      }
    }
  };

  const languageLabels: Record<Language, string> = {
    en: 'English',
    kn: 'ಕನ್ನಡ',
    mr: 'मराठी',
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.recipeName}>{recipe.name}</Text>
      </View>

      {/* Language Selector */}
      <View style={styles.languageSelector}>
        <Text style={styles.sectionLabel}>Language:</Text>
        <View style={styles.languageButtons}>
          {(['en', 'kn', 'mr'] as Language[]).map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[
                styles.languageButton,
                selectedLanguage === lang && styles.languageButtonActive,
              ]}
              onPress={() => onChangeLanguage(lang)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.languageButtonText,
                  selectedLanguage === lang && styles.languageButtonTextActive,
                ]}
              >
                {languageLabels[lang]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Basic Info */}
      <View style={styles.section}>
        <View style={styles.infoGrid}>
          {recipe.prep_time_minutes !== null && (
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Prep Time</Text>
              <Text style={styles.infoValue}>{recipe.prep_time_minutes} min</Text>
            </View>
          )}
          {recipe.cook_time_minutes !== null && (
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Cook Time</Text>
              <Text style={styles.infoValue}>{recipe.cook_time_minutes} min</Text>
            </View>
          )}
          {totalTime > 0 && (
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Total Time</Text>
              <Text style={styles.infoValue}>{totalTime} min</Text>
            </View>
          )}
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Servings</Text>
            <Text style={styles.infoValue}>{recipe.servings}</Text>
          </View>
        </View>
      </View>

      {/* Nutrition Information */}
      {hasCompleteNutrition && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrition (per serving)</Text>
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionBox}>
              <Text style={styles.nutritionValue}>{Math.round(recipe.calories_per_serving!)}</Text>
              <Text style={styles.nutritionLabel}>Calories</Text>
            </View>
            <View style={styles.nutritionBox}>
              <Text style={styles.nutritionValue}>{recipe.protein_grams}g</Text>
              <Text style={styles.nutritionLabel}>Protein</Text>
            </View>
            <View style={styles.nutritionBox}>
              <Text style={styles.nutritionValue}>{recipe.carbs_grams}g</Text>
              <Text style={styles.nutritionLabel}>Carbs</Text>
            </View>
            <View style={styles.nutritionBox}>
              <Text style={styles.nutritionValue}>{recipe.fat_grams}g</Text>
              <Text style={styles.nutritionLabel}>Fat</Text>
            </View>
            <View style={styles.nutritionBox}>
              <Text style={styles.nutritionValue}>{recipe.fiber_grams}g</Text>
              <Text style={styles.nutritionLabel}>Fiber</Text>
            </View>
          </View>
        </View>
      )}

      {!hasCompleteNutrition && (
        <View style={styles.section}>
          <View style={styles.warningBox}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningText}>
              Nutrition information incomplete for this recipe
            </Text>
          </View>
        </View>
      )}

      {/* Ingredients */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ingredients</Text>
        {ingredients.length > 0 ? (
          <View style={styles.ingredientsList}>
            {ingredients.map((ingredient, index) => (
              <View key={ingredient.id} style={styles.ingredientItem}>
                <Text style={styles.ingredientBullet}>•</Text>
                <Text style={styles.ingredientText}>
                  {ingredient.pantry_item_name}
                  <Text style={styles.ingredientQuantity}>
                    {' '}({ingredient.quantity} {ingredient.unit})
                  </Text>
                  {ingredient.is_optional === 1 && (
                    <Text style={styles.ingredientOptional}> (optional)</Text>
                  )}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No ingredients listed</Text>
        )}
      </View>

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Instructions</Text>
        {content ? (
          <>
            {selectedLanguage !== 'en' && (
              <View style={styles.fallbackNotice}>
                <Text style={styles.fallbackText}>
                  Showing {languageLabels[content.language]} content
                  {content.language !== selectedLanguage && ' (fallback to English)'}
                </Text>
              </View>
            )}
            <Text style={styles.instructionsText}>{content.instructions}</Text>
            {content.notes && (
              <View style={styles.notesBox}>
                <Text style={styles.notesLabel}>Note:</Text>
                <Text style={styles.notesText}>{content.notes}</Text>
              </View>
            )}
          </>
        ) : (
          <Text style={styles.emptyText}>No instructions available</Text>
        )}
      </View>

      {/* Video */}
      {content?.video_url && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Video Tutorial</Text>
          <TouchableOpacity
            style={styles.videoButton}
            onPress={handleOpenVideo}
            activeOpacity={0.7}
          >
            <Text style={styles.videoIcon}>📹</Text>
            <Text style={styles.videoButtonText}>Watch Video</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
  },
  recipeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  languageSelector: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  languageButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
    backgroundColor: '#fff',
  },
  languageButtonActive: {
    backgroundColor: '#4CAF50',
  },
  languageButtonText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  languageButtonTextActive: {
    color: '#fff',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoBox: {
    flex: 1,
    minWidth: 80,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  nutritionBox: {
    flex: 1,
    minWidth: 70,
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 11,
    color: '#666',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
  },
  warningIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#F57C00',
  },
  ingredientsList: {
    gap: 8,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  ingredientBullet: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 8,
    marginTop: 2,
  },
  ingredientText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  ingredientQuantity: {
    color: '#666',
    fontWeight: '600',
  },
  ingredientOptional: {
    color: '#999',
    fontStyle: 'italic',
  },
  fallbackNotice: {
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  fallbackText: {
    fontSize: 12,
    color: '#1976D2',
    fontStyle: 'italic',
  },
  instructionsText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
  },
  notesBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFF9C4',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FBC02D',
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F57F17',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  videoIcon: {
    fontSize: 24,
  },
  videoButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
