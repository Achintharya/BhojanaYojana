/**
 * What's in My Fridge? Screen
 * Shows recipes that can be made with current pantry inventory
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { Recipe, RecipeIngredient, PantryItem } from '../src/database/types';
import { getAllRecipes, getRecipeIngredients } from '../src/modules/recipes/recipeData';
import { getAllPantryItems } from '../src/modules/pantry/pantryData';
import {
  matchRecipesWithPantry,
  getAvailableRecipes,
  sortByMatchQuality,
  getMatchStatistics,
  RecipeMatch,
} from '../src/modules/recipes/recipeMatchingLogic';
import RecipeCard from '../src/components/RecipeCard';

export default function FridgeRecipesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [availableMatches, setAvailableMatches] = useState<RecipeMatch[]>([]);
  const [statistics, setStatistics] = useState({
    totalRecipes: 0,
    availableRecipes: 0,
    partialMatches: 0,
    noMatches: 0,
  });

  const loadAndMatchRecipes = async () => {
    setLoading(true);
    try {
      // Load all data
      const recipes = await getAllRecipes();
      const pantryItems = await getAllPantryItems();

      // Load ingredients for all recipes
      const recipeIngredientsMap = new Map<number, RecipeIngredient[]>();
      for (const recipe of recipes) {
        const ingredients = await getRecipeIngredients(recipe.id);
        recipeIngredientsMap.set(recipe.id, ingredients);
      }

      // Match recipes with pantry
      const matches = matchRecipesWithPantry(recipes, recipeIngredientsMap, pantryItems);

      // Get only available recipes (all ingredients present)
      const available = getAvailableRecipes(matches);
      const sortedAvailable = sortByMatchQuality(available);

      setAvailableMatches(sortedAvailable);

      // Get statistics
      const stats = getMatchStatistics(matches);
      setStatistics(stats);
    } catch (error) {
      console.error('Error matching recipes:', error);
      Alert.alert('Error', 'Failed to match recipes with pantry inventory');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAndMatchRecipes();
    }, [])
  );

  const handleRecipePress = (recipeId: number) => {
    router.push(`/recipe/${recipeId}`);
  };

  const handleRefresh = () => {
    loadAndMatchRecipes();
  };

  const handleViewPantry = () => {
    router.back();
    // Navigation will return to recipes screen, user can then navigate to pantry
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "What's in My Fridge?",
          headerStyle: { backgroundColor: '#2196F3' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <View style={styles.container}>
        {/* Info Header */}
        <View style={styles.infoHeader}>
          <Text style={styles.infoTitle}>🥬 Recipe Suggestions</Text>
          <Text style={styles.infoText}>
            Showing recipes you can make with your current pantry inventory
          </Text>
        </View>

        {/* Statistics */}
        {!loading && (
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{statistics.availableRecipes}</Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, styles.statValueMuted]}>
                {statistics.partialMatches}
              </Text>
              <Text style={styles.statLabel}>Partial</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, styles.statValueMuted]}>
                {statistics.totalRecipes}
              </Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        )}

        {/* Recipe List */}
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2196F3" />
              <Text style={styles.loadingText}>Checking your pantry...</Text>
            </View>
          ) : availableMatches.length > 0 ? (
            <>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>
                  ✨ {availableMatches.length} Recipe{availableMatches.length !== 1 ? 's' : ''} Available
                </Text>
                <Text style={styles.resultsSubtitle}>
                  All required ingredients are in your pantry
                </Text>
              </View>

              {availableMatches.map((match) => (
                <View key={match.recipe.id} style={styles.recipeWrapper}>
                  <RecipeCard
                    recipe={match.recipe}
                    onPress={() => handleRecipePress(match.recipe.id)}
                  />
                  <View style={styles.ingredientInfo}>
                    <Text style={styles.ingredientInfoIcon}>✓</Text>
                    <Text style={styles.ingredientInfoText}>
                      {match.matchedIngredients.length} ingredient
                      {match.matchedIngredients.length !== 1 ? 's' : ''} available
                      {match.optionalIngredients.length > 0 &&
                        ` (+${match.optionalIngredients.length} optional)`}
                    </Text>
                  </View>
                </View>
              ))}

              <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
                <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🍽️</Text>
              <Text style={styles.emptyTitle}>No Recipes Available</Text>
              <Text style={styles.emptyText}>
                No recipes can be made with your current pantry inventory.
              </Text>
              <Text style={styles.emptyHint}>
                {statistics.partialMatches > 0
                  ? `You have ${statistics.partialMatches} partial match${
                      statistics.partialMatches !== 1 ? 'es' : ''
                    }. Check your pantry and add missing ingredients.`
                  : 'Add ingredients to your pantry or check your grocery list.'}
              </Text>

              <View style={styles.emptyActions}>
                <TouchableOpacity style={styles.emptyButton} onPress={handleViewPantry}>
                  <Text style={styles.emptyButtonText}>View Pantry</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.emptyButton, styles.emptyButtonSecondary]}
                  onPress={handleRefresh}
                >
                  <Text style={[styles.emptyButtonText, styles.emptyButtonTextSecondary]}>
                    Refresh
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Important Notice */}
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            ℹ️ Only recipes with ALL required ingredients are shown. Optional ingredients are not required.
          </Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  infoHeader: {
    backgroundColor: '#2196F3',
    padding: 16,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#E3F2FD',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statValueMuted: {
    color: '#999',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    paddingVertical: 64,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  resultsHeader: {
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  recipeWrapper: {
    marginBottom: 12,
  },
  ingredientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginTop: -8,
  },
  ingredientInfoIcon: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 8,
  },
  ingredientInfoText: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
  },
  emptyState: {
    paddingVertical: 64,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 72,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyActions: {
    flexDirection: 'row',
    gap: 12,
  },
  emptyButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyButtonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  emptyButtonTextSecondary: {
    color: '#2196F3',
  },
  noticeBox: {
    backgroundColor: '#FFF9C4',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#FBC02D',
  },
  noticeText: {
    fontSize: 12,
    color: '#F57F17',
    textAlign: 'center',
    lineHeight: 18,
  },
});
