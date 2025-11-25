import React, { Component } from 'react';
import RecipeCard from './RecipeCard';
import { RecipeService } from '../services/RecipeService.js';
import { apiFetch } from '../services/api.js';
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
    this.loadRecipes();
    this.setupAvailableIngredients();
  }

  async loadRecipes() {
    try {
      // Fetch recipe matches from Flask backend
      const userId = 1; // Default user ID - you can make this dynamic later
      const response = await apiFetch(`/recipes/matches?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const matchesData = await response.json();
      
      // Transform API response to match Recipe model format
      const recipesData = matchesData.map(match => ({
        id: match.RecipeID,
        title: match.Title,
        time_minutes: match.TimeMinutes,
        servings: match.Servings,
        calories_per_serving: match.CaloriesPerServing,
        matchPercentage: match.MatchPercentage,
        totalIngredients: match.TotalIngredients,
        ingredientsUserHas: match.IngredientsUserHas
      }));
      
      // Store recipes with match info
      this.setState({
        recipes: recipesData,
        filteredRecipes: recipesData,
        filterCounts: {
          all: recipesData.length,
          ready: recipesData.filter(r => r.matchPercentage >= 100).length,
          almostReady: recipesData.filter(r => r.matchPercentage >= 75 && r.matchPercentage < 100).length
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
      // Fetch pantry from Flask backend
      const userId = 1; // Default user ID
      const response = await apiFetch(`/pantry?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const pantryData = await response.json();
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
        filteredRecipes = this.state.recipes.filter(r => r.matchPercentage >= 100);
        break;
      case 'almostReady':
        filteredRecipes = this.state.recipes.filter(r => r.matchPercentage >= 75 && r.matchPercentage < 100);
        break;
      default:
        filteredRecipes = this.state.recipes;
    }

    this.setState({ 
      activeFilter: filter,
      filteredRecipes: this.applySearchFilter(filteredRecipes)
    });
  };

  handleSearchChange = (e) => {
    const query = e.target.value;
    this.setState({ 
      searchQuery: query,
      filteredRecipes: this.applySearchFilter(this.getCurrentFilteredRecipes(), query)
    });
  };

  getCurrentFilteredRecipes() {
    const { activeFilter } = this.state;
    switch (activeFilter) {
      case 'ready':
        return this.state.recipes.filter(r => r.matchPercentage >= 100);
      case 'almostReady':
        return this.state.recipes.filter(r => r.matchPercentage >= 75 && r.matchPercentage < 100);
      default:
        return this.state.recipes;
    }
  }

  applySearchFilter(recipes, query = this.state.searchQuery) {
    if (!query.trim()) return recipes;
    const lowerQuery = query.toLowerCase();
    return recipes.filter(recipe => 
      recipe.title.toLowerCase().includes(lowerQuery)
    );
  }

  handleViewRecipe = async (recipe) => {
    try {
      // Fetch full recipe details from API
      const response = await apiFetch(`/recipe/${recipe.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const recipeDetails = await response.json();
      
      // Transform API response to match Recipe model format
      const fullRecipe = {
        id: recipeDetails.RecipeID,
        title: recipeDetails.Title,
        time_minutes: recipeDetails.TimeMinutes,
        servings: recipeDetails.Servings,
        calories_per_serving: recipeDetails.CaloriesPerServing,
        ingredients: recipeDetails.ingredients.map(ing => ({
          name: ing.Name,
          qty: ing.Quantity,
          unit: ing.Unit || ''
        })),
        instructions: recipeDetails.instructions.map(inst => inst.StepText),
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
    const baseClass = "flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors";
    const isActive = this.state.activeFilter === filter;
    
    if (isActive) {
      return `${baseClass} bg-gray-800 text-white`;
    }
    return `${baseClass} text-gray-600 hover:text-gray-800 hover:bg-gray-100`;
  }

  render() {
    const { filteredRecipes, isLoading, searchQuery, filterCounts, selectedRecipe } = this.state;
    const { onAddToCart } = this.props;

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading recipes...</p>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recipe Suggestions</h2>
          <p className="text-gray-600 mb-6">Based on your pantry and preferences</p>
          
          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => this.handleFilterChange('all')}
              className={this.getFilterClass('all')}
            >
              <span>All Recipes ({filterCounts.all})</span>
            </button>
            <button
              onClick={() => this.handleFilterChange('ready')}
              className={this.getFilterClass('ready')}
            >
              <span>Ready to Cook ({filterCounts.ready})</span>
            </button>
            <button
              onClick={() => this.handleFilterChange('almostReady')}
              className={this.getFilterClass('almostReady')}
            >
              <span>Almost Ready ({filterCounts.almostReady})</span>
            </button>
          </div>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={this.handleSearchChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRecipes.length === 0 ? (
              <div className="col-span-2 text-center py-8">
                <p className="text-gray-500">No recipes found</p>
              </div>
            ) : (
              filteredRecipes.map(recipe => {
                // Create matchInfo from recipe data
                const matchInfo = {
                  matchPercentage: recipe.matchPercentage || 0,
                  totalIngredients: recipe.totalIngredients || 0,
                  availableIngredients: recipe.ingredientsUserHas || 0,
                  missingIngredients: [],
                  status: recipe.matchPercentage >= 100 ? 'ready' : 
                          recipe.matchPercentage >= 75 ? 'almost-ready' : 'needs-ingredients'
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
