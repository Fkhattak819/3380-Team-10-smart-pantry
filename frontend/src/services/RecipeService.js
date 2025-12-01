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
  get availableIngredients() {
    return this._availableIngredients;
  }

  // Core business methods
  setAvailableIngredients(ingredients) {
    this._availableIngredients = ingredients.map(ing => ing.toLowerCase());
  }
}
