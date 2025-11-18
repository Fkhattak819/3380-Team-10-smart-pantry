import React, { Component } from 'react';
import RecipeCard from './RecipeCard';
import { RecipeService } from '../services/RecipeService.js';
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
      const response = await fetch('/recipes.json');
      const recipesData = await response.json();
      
      this.recipeService.loadRecipesFromJSON(recipesData);
      this.updateRecipeList();
    } catch (error) {
      console.error('Error loading recipes:', error);
      this.setState({ isLoading: false });
    }
  }

  async setupAvailableIngredients() {
    try {
      const response = await fetch('/pantry.json');
      const pantryData = await response.json();
      const ingredientNames = pantryData.map(item => item.name.toLowerCase());
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
    const recipes = this.recipeService.getAllRecipes();
    const { ready, almostReady } = this.recipeService.getRecipesByReadiness();
    
    this.setState({
      recipes,
      filteredRecipes: recipes,
      filterCounts: {
        all: recipes.length,
        ready: ready.length,
        almostReady: almostReady.length
      },
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
        filteredRecipes = this.recipeService.getRecipesByReadiness().ready;
        break;
      case 'almostReady':
        filteredRecipes = this.recipeService.getRecipesByReadiness().almostReady;
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
        return this.recipeService.getRecipesByReadiness().ready;
      case 'almostReady':
        return this.recipeService.getRecipesByReadiness().almostReady;
      default:
        return this.state.recipes;
    }
  }

  applySearchFilter(recipes, query = this.state.searchQuery) {
    if (!query.trim()) return recipes;
    return this.recipeService.searchRecipes(query);
  }

  handleViewRecipe = (recipe) => {
    this.setState({ selectedRecipe: recipe });
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
                const matchInfo = this.recipeService.getRecipeWithMatchInfo(recipe);
                return (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    matchInfo={matchInfo}
                    onViewRecipe={this.handleViewRecipe}
                    onAddMissingToCart={this.handleAddMissingToCart}
                    onAddToCart={this.props.onAddToCart}
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