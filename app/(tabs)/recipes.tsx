/**
 * Recipes screen
 * Browse and search recipes with multilingual support
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Recipe } from '../../src/database/types';
import { getAllRecipes } from '../../src/modules/recipes/recipeData';
import ScreenContainer from '../../src/components/common/ScreenContainer';
import EmptyState from '../../src/components/common/EmptyState';
import RecipeCard from '../../src/components/RecipeCard';
import colors from '../../src/theme/colors';
import spacing from '../../src/theme/spacing';
import { textStyles, typography } from '../../src/theme/typography';

export default function RecipesScreen() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const loadRecipes = async () => {
    setLoading(true);
    try {
      const allRecipes = await getAllRecipes();
      setRecipes(allRecipes);
      setFilteredRecipes(allRecipes);
    } catch (error) {
      console.error('Error loading recipes:', error);
      Alert.alert('Error', 'Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRecipes();
    }, [])
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredRecipes(recipes);
    } else {
      const lowerQuery = query.toLowerCase();
      const filtered = recipes.filter((recipe) =>
        recipe.name.toLowerCase().includes(lowerQuery)
      );
      setFilteredRecipes(filtered);
    }
  };

  const handleRecipePress = (recipeId: number) => {
    router.push(`/recipe/${recipeId}`);
  };

  const handleWhatInMyFridge = () => {
    router.push('/fridge-recipes');
  };

  return (
    <View style={styles.container}>
      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor={colors.textTertiary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => handleSearch('')}
              style={styles.clearButton}
            >
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <ScreenContainer scrollable={true} style={styles.contentContainer}>
        {/* What's in my fridge card */}
        <TouchableOpacity
          style={styles.fridgeCard}
          onPress={handleWhatInMyFridge}
          activeOpacity={0.7}
        >
          <View style={styles.fridgeContent}>
            <View style={styles.fridgeLeft}>
              <View style={styles.fridgeIconContainer}>
                <Text style={styles.fridgeIcon}>🧊</Text>
              </View>
              <View style={styles.fridgeTextContainer}>
                <Text style={styles.fridgeTitle}>What's in My Fridge?</Text>
                <Text style={styles.fridgeSubtitle}>
                  Cook something with what you already have
                </Text>
              </View>
            </View>
            <Text style={styles.fridgeArrow}>→</Text>
          </View>
        </TouchableOpacity>

        {/* Recipe List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loadingText}>Loading recipes...</Text>
          </View>
        ) : filteredRecipes.length > 0 ? (
          <>
            {searchQuery.length > 0 && (
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsText}>
                  {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found
                </Text>
              </View>
            )}
            <View style={styles.recipesList}>
              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onPress={() => handleRecipePress(recipe.id)}
                />
              ))}
            </View>
          </>
        ) : recipes.length === 0 ? (
          <EmptyState
            icon="📖"
            title="No recipes yet"
            message="Your cookbook will appear here once recipes are added"
          />
        ) : (
          <EmptyState
            icon="🔍"
            title="No recipes found"
            message={`No recipes matching "${searchQuery}"`}
            actionLabel="Clear Search"
            onAction={() => handleSearch('')}
          />
        )}

        {/* Info Note */}
        {recipes.length > 0 && (
          <View style={styles.infoNote}>
            <Text style={styles.infoNoteText}>
              💡 All recipes available in English, ಕನ್ನಡ, and मराठी
            </Text>
          </View>
        )}
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchSection: {
    backgroundColor: colors.cardBackground,
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: spacing.radiusMedium,
    paddingHorizontal: spacing.base,
    minHeight: spacing.buttonHeight,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...textStyles.body,
    fontSize: typography.size.md,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  clearButton: {
    padding: spacing.sm,
  },
  clearIcon: {
    fontSize: 20,
    color: colors.textTertiary,
  },
  contentContainer: {
    flex: 1,
  },
  fridgeCard: {
    backgroundColor: colors.primary,
    borderRadius: spacing.radiusMedium,
    padding: spacing.cardPaddingLarge,
    marginBottom: spacing.sectionGap,
  },
  fridgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  fridgeTextContainer: {
    flex: 1,
  },
  fridgeTitle: {
    ...textStyles.cardTitle,
    color: colors.textOnPrimary,
    marginBottom: spacing.xs,
  },
  fridgeSubtitle: {
    ...textStyles.caption,
    color: colors.secondary,
  },
  fridgeArrow: {
    fontSize: 24,
    color: colors.accent,
    marginLeft: spacing.md,
  },
  loadingContainer: {
    paddingVertical: spacing.huge,
    alignItems: 'center',
  },
  loadingText: {
    ...textStyles.body,
    color: colors.textTertiary,
    marginTop: spacing.base,
  },
  resultsHeader: {
    marginBottom: spacing.base,
  },
  resultsText: {
    ...textStyles.body,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
  recipesList: {
    gap: spacing.cardGap,
  },
  infoNote: {
    backgroundColor: colors.secondary,
    borderRadius: spacing.radiusMedium,
    padding: spacing.base,
    marginTop: spacing.sectionGap,
    alignItems: 'center',
  },
  infoNoteText: {
    ...textStyles.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
