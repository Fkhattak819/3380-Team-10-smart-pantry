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

  getMissingIngredients(availableIngredients) {
    const availableNames = availableIngredients.map(ing => ing.toLowerCase());
    return this._ingredients.filter(ingredient => 
      !availableNames.includes(ingredient.name.toLowerCase())
    );
  }

  getMatchPercentage(availableIngredients) {
    const availableNames = availableIngredients.map(ing => ing.toLowerCase());
    const matchingIngredients = this._ingredients.filter(ingredient => 
      availableNames.includes(ingredient.name.toLowerCase())
    );
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
