/**
 * Recipe Detail Screen
 * Shows full recipe information with multilingual support
 */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { Recipe, RecipeContent, RecipeIngredient, Language } from '../../src/database/types';
import {
  getRecipeById,
  getRecipeContent,
  getRecipeIngredients,
} from '../../src/modules/recipes/recipeData';
import { getPantryItemById } from '../../src/modules/pantry/pantryData';
import RecipeDetailView from '../../src/components/RecipeDetailView';

export default function RecipeDetailScreen() {
  const params = useLocalSearchParams();
  const recipeId = typeof params.id === 'string' ? parseInt(params.id, 10) : 0;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [content, setContent] = useState<RecipeContent | null>(null);
  const [ingredients, setIngredients] = useState<
    Array<RecipeIngredient & { pantry_item_name: string }>
  >([]);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [loading, setLoading] = useState(true);

  const loadRecipeData = async () => {
    if (!recipeId) {
      Alert.alert('Error', 'Invalid recipe ID');
      return;
    }

    setLoading(true);
    try {
      // Load recipe
      const recipeData = await getRecipeById(recipeId);
      if (!recipeData) {
        Alert.alert('Error', 'Recipe not found');
        return;
      }
      setRecipe(recipeData);

      // Load content for selected language with fallback to English
      await loadContent(recipeId, selectedLanguage);

      // Load ingredients with pantry item names
      const recipeIngredients = await getRecipeIngredients(recipeId);
      const ingredientsWithNames = await Promise.all(
        recipeIngredients.map(async (ingredient) => {
          const pantryItem = await getPantryItemById(ingredient.pantry_item_id);
          return {
            ...ingredient,
            pantry_item_name: pantryItem?.name ?? 'Unknown',
          };
        })
      );
      setIngredients(ingredientsWithNames);
    } catch (error) {
      console.error('Error loading recipe:', error);
      Alert.alert('Error', 'Failed to load recipe details');
    } finally {
      setLoading(false);
    }
  };

  const loadContent = async (recipeId: number, language: Language) => {
    try {
      // Try to load content in selected language
      let recipeContent = await getRecipeContent(recipeId, language);

      // Fallback to English if selected language not available
      if (!recipeContent && language !== 'en') {
        recipeContent = await getRecipeContent(recipeId, 'en');
      }

      setContent(recipeContent);
    } catch (error) {
      console.error('Error loading recipe content:', error);
      setContent(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRecipeData();
    }, [recipeId])
  );

  const handleLanguageChange = async (language: Language) => {
    setSelectedLanguage(language);
    if (recipe) {
      await loadContent(recipe.id, language);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading recipe...</Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.errorContainer}>
        <Stack.Screen options={{ title: 'Error' }} />
        <Text style={styles.errorText}>Recipe not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: recipe.name,
          headerStyle: { backgroundColor: '#4CAF50' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <RecipeDetailView
        recipe={recipe}
        content={content}
        ingredients={ingredients}
        selectedLanguage={selectedLanguage}
        onChangeLanguage={handleLanguageChange}
      />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: '#f44336',
    textAlign: 'center',
  },
});
