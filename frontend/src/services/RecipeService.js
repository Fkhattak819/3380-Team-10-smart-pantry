import { Recipe } from '../models/Recipe.js';

/**
 * RecipeService class manages recipe operations
 * Follows object-oriented design with proper encapsulation
 */
export class RecipeService {
  constructor() {
    this._recipes = new Map();
    this._availableIngredients = [];
  }

  // Getters
  get recipes() {
    return Array.from(this._recipes.values());
  }

  get availableIngredients() {
    return this._availableIngredients;
  }

  // Core business methods
  loadRecipesFromJSON(recipesData) {
    this._recipes.clear();
    recipesData.forEach(recipeData => {
      const recipe = Recipe.fromJSON(recipeData);
      this._recipes.set(recipe.id, recipe);
    });
  }

  setAvailableIngredients(ingredients) {
    this._availableIngredients = ingredients.map(ing => ing.toLowerCase());
  }

  getRecipe(id) {
    return this._recipes.get(id);
  }

  getAllRecipes() {
    return this.recipes;
  }

  // Search and filter methods
  searchRecipes(query) {
    const lowerQuery = query.toLowerCase();
    return this.recipes.filter(recipe => 
      recipe.title.toLowerCase().includes(lowerQuery) ||
      recipe.dietTags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  getRecipesByDietTag(tag) {
    return this.recipes.filter(recipe => recipe.hasDietTag(tag));
  }

  getRecipesByTimeRange(minMinutes, maxMinutes) {
    return this.recipes.filter(recipe => 
      recipe.timeMinutes >= minMinutes && recipe.timeMinutes <= maxMinutes
    );
  }

  getQuickRecipes(maxMinutes = 15) {
    return this.getRecipesByTimeRange(0, maxMinutes);
  }

  // Recipe matching with pantry
  getRecipesByReadiness() {
    const ready = [];
    const almostReady = [];
    const needsIngredients = [];

    this.recipes.forEach(recipe => {
      const status = recipe.getReadinessStatus(this._availableIngredients);
      switch (status) {
        case 'ready':
          ready.push(recipe);
          break;
        case 'almost-ready':
          almostReady.push(recipe);
          break;
        case 'needs-ingredients':
          needsIngredients.push(recipe);
          break;
      }
    });

    return { ready, almostReady, needsIngredients };
  }

  getRecommendedRecipes(limit = 4) {
    const { ready, almostReady } = this.getRecipesByReadiness();
    
    // Prioritize ready recipes, then almost ready
    const recommended = [...ready, ...almostReady];
    
    // Sort by match percentage (highest first)
    return recommended
      .map(recipe => ({
        recipe,
        matchPercentage: recipe.getMatchPercentage(this._availableIngredients)
      }))
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, limit)
      .map(item => item.recipe);
  }

  getRecipeWithMatchInfo(recipe) {
    const matchPercentage = recipe.getMatchPercentage(this._availableIngredients);
    const missingIngredients = recipe.getMissingIngredients(this._availableIngredients);
    const status = recipe.getReadinessStatus(this._availableIngredients);

    return {
      recipe,
      matchPercentage,
      missingIngredients,
      status,
      availableIngredients: recipe.ingredients.filter(ingredient => 
        recipe.isIngredientMatch(ingredient.name, this._availableIngredients)
      )
    };
  }

  // Statistics methods
  getRecipeStatistics() {
    const total = this.recipes.length;
    const { ready, almostReady, needsIngredients } = this.getRecipesByReadiness();
    
    return {
      total,
      ready: ready.length,
      almostReady: almostReady.length,
      needsIngredients: needsIngredients.length,
      percentages: {
        ready: total > 0 ? Math.round((ready.length / total) * 100) : 0,
        almostReady: total > 0 ? Math.round((almostReady.length / total) * 100) : 0,
        needsIngredients: total > 0 ? Math.round((needsIngredients.length / total) * 100) : 0
      }
    };
  }

  // Utility methods
  getTotalRecipes() {
    return this._recipes.size;
  }

  isEmpty() {
    return this._recipes.size === 0;
  }

  clearAll() {
    this._recipes.clear();
    this._availableIngredients = [];
  }
}
