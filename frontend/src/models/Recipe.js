/**
 * Recipe class represents a single recipe
 * Follows object-oriented design principles
 */
export class Recipe {
  constructor(id, title, timeMinutes, dietTags, servings, caloriesPerServing, ingredients, instructions) {
    this._id = id;
    this._title = title;
    this._timeMinutes = timeMinutes;
    this._dietTags = dietTags || [];
    this._servings = servings;
    this._caloriesPerServing = caloriesPerServing;
    this._ingredients = ingredients || [];
    this._instructions = instructions || [];
  }

  // Getters
  get id() {
    return this._id;
  }

  get title() {
    return this._title;
  }

  get timeMinutes() {
    return this._timeMinutes;
  }

  get dietTags() {
    return this._dietTags;
  }

  get servings() {
    return this._servings;
  }

  get caloriesPerServing() {
    return this._caloriesPerServing;
  }

  get ingredients() {
    return this._ingredients;
  }

  get instructions() {
    return this._instructions;
  }

  // Business logic methods
  getTotalCalories() {
    return this._caloriesPerServing * this._servings;
  }

  getTimeFormatted() {
    if (this._timeMinutes < 60) {
      return `${this._timeMinutes} min`;
    }
    const hours = Math.floor(this._timeMinutes / 60);
    const minutes = this._timeMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  hasDietTag(tag) {
    return this._dietTags.includes(tag);
  }

  getIngredientNames() {
    return this._ingredients.map(ingredient => ingredient.name);
  }

  normalizeIngredientName(name) {
    if (!name) return '';
    
    let normalized = name.toLowerCase().trim();
    
    // Replace underscores with spaces
    normalized = normalized.replace(/_/g, ' ');
    
    // Handle common plural/singular forms
    // Remove trailing 'es' but keep 'ss' words
    if (normalized.endsWith('es') && !normalized.endsWith('ss')) {
      normalized = normalized.slice(0, -2);
    } else if (normalized.endsWith('s') && !normalized.endsWith('ss')) {
      normalized = normalized.slice(0, -1);
    }
    
    // Normalize whitespace
    normalized = normalized.replace(/\s+/g, ' ').trim();
    
    return normalized;
  }

  isIngredientMatch(ingredientName, availableNames) {
    const normalizedIngredient = this.normalizeIngredientName(ingredientName);
    const normalizedAvailable = availableNames.map(name => this.normalizeIngredientName(name));
    
    // Check exact match
    if (normalizedAvailable.includes(normalizedIngredient)) {
      return true;
    }
    
    // Check if ingredient name contains or is contained by any available name
    for (let available of normalizedAvailable) {
      if (normalizedIngredient === available || 
          normalizedIngredient.includes(available) || 
          available.includes(normalizedIngredient)) {
        return true;
      }
    }
    
    return false;
  }

  getMissingIngredients(availableIngredients) {
    const availableNames = availableIngredients.map(ing => typeof ing === 'string' ? ing : ing.name || ing);
    return this._ingredients.filter(ingredient => {
      const ingredientName = typeof ingredient === 'string' ? ingredient : ingredient.name;
      return !this.isIngredientMatch(ingredientName, availableNames);
    });
  }

  getMatchPercentage(availableIngredients) {
    const availableNames = availableIngredients.map(ing => typeof ing === 'string' ? ing : ing.name || ing);
    const matchingIngredients = this._ingredients.filter(ingredient => {
      const ingredientName = typeof ingredient === 'string' ? ingredient : ingredient.name;
      return this.isIngredientMatch(ingredientName, availableNames);
    });
    return Math.round((matchingIngredients.length / this._ingredients.length) * 100);
  }

  getReadinessStatus(availableIngredients) {
    const matchPercentage = this.getMatchPercentage(availableIngredients);
    if (matchPercentage === 100) {
      return 'ready';
    } else if (matchPercentage >= 75) {
      return 'almost-ready';
    } else {
      return 'needs-ingredients';
    }
  }

  // Utility methods
  toJSON() {
    return {
      id: this._id,
      title: this._title,
      time_minutes: this._timeMinutes,
      diet_tags: this._dietTags,
      servings: this._servings,
      calories_per_serving: this._caloriesPerServing,
      ingredients: this._ingredients,
      instructions: this._instructions
    };
  }

  toString() {
    return `${this._title} (${this.getTimeFormatted()}, ${this._servings} servings)`;
  }

  // Static factory method
  static fromJSON(jsonData) {
    return new Recipe(
      jsonData.id,
      jsonData.title,
      jsonData.time_minutes,
      jsonData.diet_tags,
      jsonData.servings,
      jsonData.calories_per_serving,
      jsonData.ingredients,
      jsonData.instructions
    );
  }
}
