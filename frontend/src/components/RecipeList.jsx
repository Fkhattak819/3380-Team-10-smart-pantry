import React, { Component } from 'react';
import RecipeCard from './RecipeCard';
import { RecipeService } from '../services/RecipeService.js';
import { getRecipeMatches, getPantry, getRecipeDetails } from '../services/api.js';
import RecipeModal from './RecipeModal';

// Recipe list component
class RecipeList extends Component {
  constructor(props) {
    super(props);
    this.recipeService = new RecipeService();
    
    this.state = {
      recipes: [],
      filteredRecipes: [],
      activeFilter: 'all',
      searchQuery: '',
      isLoading: true,
      filterCounts: {
        all: 0,
        ready: 0,
        almostReady: 0
      },
      selectedRecipe: null,
    };
  }

  componentDidMount() {
    // Use Promise.allSettled to handle errors gracefully
    Promise.allSettled([
      this.loadRecipes(),
      this.setupAvailableIngredients()
    ]).catch(error => {
      console.error('Error in componentDidMount:', error);
      this.setState({ isLoading: false });
    });
  }

  componentDidUpdate(prevProps) {
    // Re-apply filters when filters prop changes
    // Deep comparison of filter values to detect changes
    const filtersChanged = 
      !prevProps.filters || 
      !this.props.filters ||
      prevProps.filters.maxPrepTime !== this.props.filters.maxPrepTime ||
      prevProps.filters.selectedDiet !== this.props.filters.selectedDiet ||
      prevProps.filters.minCalories !== this.props.filters.minCalories ||
      prevProps.filters.maxCalories !== this.props.filters.maxCalories ||
      JSON.stringify(prevProps.filters.selectedAllergens || []) !== JSON.stringify(this.props.filters.selectedAllergens || []);
    
    if (filtersChanged) {
      const currentFiltered = this.getCurrentFilteredRecipes();
      this.setState({
        filteredRecipes: this.applySearchFilter(currentFiltered)
      });
    }
  }

  async loadRecipes() {
    try {
      const userId = 1; // Default user ID - you can make this dynamic later

      // Fetch recipe matches from Flask backend via helper
      const matchesData = await getRecipeMatches(userId);

      // Transform API response to match Recipe model format
      const recipesData = matchesData.map(match => ({
        id: match.RecipeID,
        title: match.Title,
        time_minutes: match.TimeMinutes,
        servings: match.Servings,
        calories_per_serving: match.CaloriesPerServing,
        imageURL: match.ImageURL || null,
        matchPercentage: match.MatchPercentage,
        totalIngredients: match.TotalIngredients,
        ingredientsUserHas: match.IngredientsUserHas,
        missingIngredients: match.MissingIngredients || [], // Array of missing ingredient names
        tags: match.Tags ? match.Tags.split(',').map(t => t.trim()) : []
      }));
      
      // Apply filters to initial recipes
      const filteredRecipes = this.applyFilters(recipesData);
      
      // Store recipes with match info
      this.setState({
        recipes: recipesData,
        filteredRecipes: this.applySearchFilter(filteredRecipes),
        filterCounts: {
          all: recipesData.length,
          ready: recipesData.filter(r => (Math.round(Number(r.matchPercentage) || 0) >= 100)).length,
          almostReady: recipesData.filter(r => {
            const mp = Math.round(Number(r.matchPercentage) || 0);
            return mp >= 75 && mp < 100;
          }).length
        },
        isLoading: false
      });
    } catch (error) {
      console.error('Error loading recipes:', error);
      this.setState({ isLoading: false });
    }
  }

  async setupAvailableIngredients() {
    try {
      const userId = 1; // Default user ID

      // Fetch pantry from Flask backend via helper
      const pantryData = await getPantry(userId);
      const ingredientNames = pantryData.map(item => item.Name.toLowerCase());
      this.recipeService.setAvailableIngredients(ingredientNames);
    } catch (error) {
      console.error('Error loading pantry data for ingredients:', error);
      const mockIngredients = [
        'egg', 'cheese', 'butter', 'salt', 'black_pepper', 'garlic', 'onion', 
        'carrot', 'olive_oil', 'soy_sauce', 'chicken_breast', 'bell_pepper',
        'broccoli', 'canned_tuna', 'mayonnaise', 'bread_slice'
      ];
      this.recipeService.setAvailableIngredients(mockIngredients);
    }
  }

  updateRecipeList() {
    // Recipes are now loaded directly from API, so this method may not be needed
    // But keeping it for compatibility
    const recipes = this.state.recipes || [];
    this.setState({
      filteredRecipes: recipes,
      isLoading: false
    });
  }

  handleFilterChange = (filter) => {
    let filteredRecipes = [];
    
    switch (filter) {
      case 'all':
        filteredRecipes = this.state.recipes;
        break;
      case 'ready':
        filteredRecipes = this.state.recipes.filter(r => {
          const mp = Math.round(Number(r.matchPercentage) || 0);
          return mp >= 100;
        });
        break;
      case 'almostReady':
        filteredRecipes = this.state.recipes.filter(r => {
          const mp = Math.round(Number(r.matchPercentage) || 0);
          return mp >= 75 && mp < 100;
        });
        break;
      default:
        filteredRecipes = this.state.recipes;
    }

    // Apply advanced filters (from SettingsPanel) - time, calories, diet, allergens
    filteredRecipes = this.applyFilters(filteredRecipes);

    this.setState({ 
      activeFilter: filter,
      filteredRecipes: this.applySearchFilter(filteredRecipes)
    });
  };

  handleSearchChange = (e) => {
    const query = e.target.value;
    // getCurrentFilteredRecipes already applies filters, so we just need to apply search
    const filteredByMatchAndFilters = this.getCurrentFilteredRecipes();
    this.setState({ 
      searchQuery: query,
      filteredRecipes: this.applySearchFilter(filteredByMatchAndFilters, query)
    });
  };

  getCurrentFilteredRecipes() {
    const { activeFilter } = this.state;
    let recipes = [];
    
    switch (activeFilter) {
      case 'ready':
        recipes = this.state.recipes.filter(r => {
          const mp = Math.round(Number(r.matchPercentage) || 0);
          return mp >= 100;
        });
        break;
      case 'almostReady':
        recipes = this.state.recipes.filter(r => {
          const mp = Math.round(Number(r.matchPercentage) || 0);
          return mp >= 75 && mp < 100;
        });
        break;
      default:
        recipes = this.state.recipes;
    }

    // Apply advanced filters (from SettingsPanel)
    return this.applyFilters(recipes);
  }

  applySearchFilter(recipes, query = this.state.searchQuery) {
    if (!query.trim()) return recipes;
    const lowerQuery = query.toLowerCase();
    return recipes.filter(recipe => 
      recipe.title.toLowerCase().includes(lowerQuery)
    );
  }

  applyFilters(recipes) {
    const { filters } = this.props;
    if (!filters || !recipes || recipes.length === 0) return recipes;

    let filtered = recipes;

    // Filter by max prep time
    if (filters.maxPrepTime !== null && filters.maxPrepTime !== undefined) {
      filtered = filtered.filter(recipe => {
        const recipeTime = recipe.time_minutes || 0;
        return recipeTime <= filters.maxPrepTime;
      });
    }

    // Filter by calorie range
    if (filters.minCalories !== null && filters.minCalories !== undefined) {
      filtered = filtered.filter(recipe => 
        (recipe.calories_per_serving || 0) >= filters.minCalories
      );
    }
    if (filters.maxCalories !== null && filters.maxCalories !== undefined) {
      filtered = filtered.filter(recipe => 
        (recipe.calories_per_serving || 0) <= filters.maxCalories
      );
    }

    // Filter by diet type
    if (filters.selectedDiet) {
      const dietLower = filters.selectedDiet.toLowerCase();
      filtered = filtered.filter(recipe => {
        const recipeTags = (recipe.tags || []).map(t => t.toLowerCase());
        return recipeTags.includes(dietLower);
      });
    }

    // Filter by allergens (exclude recipes with selected allergens)
    if (filters.selectedAllergens && filters.selectedAllergens.length > 0) {
      const allergenMap = {
        'Celery': ['celery'],
        'Gluten': ['gluten', 'gluten_free'], // Recipes with gluten_free tag don't have gluten
        'Crustaceans': ['crustaceans', 'shellfish'],
        'Eggs': ['egg', 'eggs'],
        'Fish': ['fish', 'seafood'],
        'Lupin': ['lupin'],
        'Milk': ['dairy', 'milk', 'cheese'],
        'Molluscs': ['molluscs', 'shellfish'],
        'Mustard': ['mustard'],
        'Peanuts': ['peanuts', 'peanut'],
        'Sesame': ['sesame'],
        'Soybeans': ['soy', 'soybeans', 'soybean'],
        'Sulphites': ['sulphites', 'sulfites']
      };
      
      const initialCount = filtered.length;
      filtered = filtered.filter(recipe => {
        const recipeTags = (recipe.tags || []).map(t => t.toLowerCase().trim());
        
        // Check if recipe has any of the excluded allergens
        for (const allergen of filters.selectedAllergens) {
          const tagsToCheck = allergenMap[allergen] || [allergen.toLowerCase()];
          
          // Special case: if filtering for gluten, only include recipes with gluten_free tag
          if (allergen === 'Gluten') {
            const hasGlutenFree = recipeTags.includes('gluten_free') || recipeTags.includes('gluten-free');
            if (!hasGlutenFree) {
              // Recipe doesn't have gluten_free tag, so it likely contains gluten - exclude it
              return false;
            }
          } else {
            // For other allergens, check if recipe has any matching tags
            // If recipe has any tag that matches the allergen, exclude it
            for (const tagToCheck of tagsToCheck) {
              if (recipeTags.includes(tagToCheck)) {
                return false; // Exclude this recipe - it contains the allergen
              }
            }
          }
        }
        return true; // Include this recipe - it doesn't contain any excluded allergens
      });
      
      console.log(`Allergen filter: ${initialCount} recipes -> ${filtered.length} recipes (excluded: ${filters.selectedAllergens.join(', ')})`);
    }

    return filtered;
  }

  handleViewRecipe = async (recipe) => {
    try {
      // Fetch full recipe details from API via helper
      const recipeDetails = await getRecipeDetails(recipe.id);
      
      // Transform API response to match Recipe model format
      const fullRecipe = {
        id: recipeDetails.RecipeID,
        title: recipeDetails.Title,
        time_minutes: recipeDetails.TimeMinutes,
        servings: recipeDetails.Servings,
        calories_per_serving: recipeDetails.CaloriesPerServing,
        ingredients: (recipeDetails.ingredients || []).map(ing => ({
          name: ing.Name,
          qty: ing.Quantity,
          unit: ing.Unit || ''
        })),
        instructions: (recipeDetails.instructions || []).map(inst => inst.StepText),
        dietTags: recipeDetails.tags || []
      };
      
      this.setState({ selectedRecipe: fullRecipe });
    } catch (error) {
      console.error('Error loading recipe details:', error);
      // Fallback to basic recipe data if API fails
      this.setState({ selectedRecipe: recipe });
    }
  };
  
  handleCloseModal = () => {
    this.setState({ selectedRecipe: null });
  };

  getFilterClass(filter) {
    const baseClass = "px-4 py-2 rounded-full text-sm font-medium transition-all";
    const isActive = this.state.activeFilter === filter;
    
    if (isActive) {
      return `${baseClass} bg-slate-900 text-white shadow-sm`;
    }
    return `${baseClass} text-slate-600 hover:text-slate-900 hover:bg-slate-100`;
  }

  render() {
    const { filteredRecipes, isLoading, searchQuery, filterCounts, selectedRecipe } = this.state;
    const { onAddToCart } = this.props;

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="mt-4 text-slate-600 text-sm">Loading recipes...</p>
          </div>
        </div>
      );
    }

    return (
      <>
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-slate-900">Recipe Suggestions</h2>
            <p className="text-sm text-slate-500 mt-1">
              Based on your pantry and preferences
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => this.handleFilterChange('all')}
              className={this.getFilterClass('all')}
            >
              All Recipes ({filterCounts.all})
            </button>
            <button
              onClick={() => this.handleFilterChange('ready')}
              className={this.getFilterClass('ready')}
            >
              Ready to Cook ({filterCounts.ready})
            </button>
            <button
              onClick={() => this.handleFilterChange('almostReady')}
              className={this.getFilterClass('almostReady')}
            >
              Almost Ready ({filterCounts.almostReady})
            </button>
          </div>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={this.handleSearchChange}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRecipes.length === 0 ? (
              <div className="col-span-1 md:col-span-2 text-center py-12">
                <p className="text-slate-500 text-sm">No recipes found. Try adjusting your filters.</p>
              </div>
            ) : (
              filteredRecipes.map(recipe => {
                const rawMatch = Number(recipe.matchPercentage) || 0;
                const matchPercentage = Math.round(rawMatch);

                const matchInfo = {
                  matchPercentage,
                  totalIngredients: recipe.totalIngredients || 0,
                  availableIngredients: recipe.ingredientsUserHas || 0,
                  missingIngredients: (recipe.missingIngredients || []).map(name => ({ name })),
                  status: matchPercentage >= 100
                    ? 'ready'
                    : matchPercentage >= 75
                      ? 'almost-ready'
                      : 'needs-ingredients'
                };
                
                return (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    matchInfo={matchInfo}
                    onViewRecipe={this.handleViewRecipe}
                    onAddToCart={onAddToCart}
                  />
                );
              })
            )}
          </div>
        </div>

        <RecipeModal 
          recipe={selectedRecipe}
          onClose={this.handleCloseModal}
        />
      </>
    );
  }
}

export default RecipeList;