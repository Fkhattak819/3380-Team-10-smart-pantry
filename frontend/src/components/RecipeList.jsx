import React, { Component } from 'react';
import RecipeCard from './RecipeCard';
import { getRecipeMatches, getPantry, getRecipeDetails, searchRecipes } from '../services/api.js';
import RecipeModal from './RecipeModal';

// Recipe list component
class RecipeList extends Component {
  constructor(props) {
    super(props);
    this.availableIngredients = []; // Store available ingredients from pantry
    this.recipeIngredientsCache = {}; // Cache for recipe ingredients
    this.allRecipesCache = null; // Cache for all recipes when filters are active
    this._isMounted = false; // Track if component is mounted (use _ prefix to avoid conflicts)
    this.loadTimeout = null; // Track pending loads to cancel if needed
    
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
      isSearchMode: false, // Track if we're in search mode
    };
  }

  componentDidMount() {
    try {
      this._isMounted = true;
      
      // Load recipes - defer to prevent blocking UI
      setTimeout(() => {
        if (this._isMounted) {
          Promise.allSettled([
            this.loadRecipes(),
            this.setupAvailableIngredients()
          ]).catch(error => {
            console.error('Error in componentDidMount:', error);
            if (this._isMounted) {
              this.setState({ isLoading: false });
            }
          });
        }
      }, 0);
    } catch (error) {
      console.error('Error in componentDidMount:', error);
      if (this._isMounted) {
        this.setState({ isLoading: false });
      }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    // Cancel any pending loads
    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout);
      this.loadTimeout = null;
    }
  }

  componentDidUpdate(prevProps) {
    // Only process if filters prop actually exists and changed
    // Skip if filters prop doesn't exist (prevents unnecessary processing)
    if (!this.props.filters && !prevProps.filters) {
      return; // No filters, skip processing
    }
    
    // Quick reference check first - if same object reference, skip
    if (prevProps.filters === this.props.filters) {
      return; // Same object reference, no change
    }
    
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
    
    // Only process if filters actually changed
    if (!filtersChanged) {
      return;
    }
    
    // Use setTimeout to defer heavy operations and prevent blocking UI
    setTimeout(() => {
      const { filters } = this.props;
      
      // Check if all filters are reset to defaults (like on startup)
      const isResetToDefaults = filters && 
        filters.maxPrepTime === 60 &&
        !filters.selectedDiet &&
        (!filters.selectedAllergens || filters.selectedAllergens.length === 0) &&
        filters.minCalories === null &&
        filters.maxCalories === null;
      
      // Check if we have filters other than just time
      const hasDietOrAllergenFilters = filters && (
        filters.selectedDiet || 
        (filters.selectedAllergens && filters.selectedAllergens.length > 0) ||
        filters.minCalories !== null ||
        filters.maxCalories !== null
      );

      // If reset to defaults and not in search mode, do a full reload (like on startup)
      if (isResetToDefaults && !this.state.isSearchMode && !this.state.searchQuery) {
        this.loadRecipes();
      }
      // If we have diet/allergen/calorie filters and we're not in search mode, load more recipes
      else if (hasDietOrAllergenFilters && !this.state.isSearchMode && !this.state.searchQuery) {
        this.loadRecipesForFiltering();
      } else {
        this.getCurrentFilteredRecipes().then(currentFiltered => {
          // Always limit to top 10 by match percentage
          const top10Filtered = currentFiltered.slice(0, 10);
          this.setState({
            filteredRecipes: this.applySearchFilter(top10Filtered)
          });
        });
      }
    }, 0); // Defer to next event loop tick
  }

  async loadRecipesForFiltering() {
    // Load more recipes when filters are active to ensure we can show 10 filtered results
    try {
      this.setState({ isLoading: true });
      
      // Use search with empty query to get up to 50 recipes
      const searchResults = await searchRecipes('');
      
      // Transform and calculate match percentages and missing ingredients with throttling
      // Process in batches to avoid rate limiting
      const batchSize = 10;
      const delayBetweenBatches = 2000; // 2 seconds between batches
      const transformedRecipes = [];
      
      for (let i = 0; i < searchResults.length; i += batchSize) {
        const batch = searchResults.slice(i, i + batchSize);
        const batchPromises = batch.map(async (recipe) => {
          const ingredients = await this.getRecipeIngredients(recipe.RecipeID);
          const matchPercentage = await this.calculateMatchPercentage(recipe.RecipeID, ingredients);
          const missingIngredients = await this.calculateMissingIngredients(recipe.RecipeID, ingredients);
          
          return {
            id: recipe.RecipeID,
            title: recipe.Title,
            time_minutes: recipe.TimeMinutes,
            servings: recipe.Servings,
            calories_per_serving: recipe.CaloriesPerServing,
            imageURL: recipe.ImageURL || null,
            matchPercentage: matchPercentage,
            totalIngredients: ingredients.length,
            ingredientsUserHas: Math.round(matchPercentage * ingredients.length / 100),
            missingIngredients: missingIngredients,
            tags: recipe.Tags ? recipe.Tags.split(',').map(t => t.trim()) : []
          };
        });
        
        const batchResults = await Promise.all(batchPromises);
        transformedRecipes.push(...batchResults);
        
        // Wait before next batch (except for the last batch)
        if (i + batchSize < searchResults.length) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
        }
      }

      // Sort by match percentage (descending) before filtering
      transformedRecipes.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));

      // Apply filters
      const filtered = await this.applyFilters(transformedRecipes);
      
      // Always take top 10 filtered results sorted by match percentage (already sorted in applyFilters)
      const top10Filtered = filtered.slice(0, 10);

      this.setState({
        recipes: transformedRecipes,
        filteredRecipes: top10Filtered,
        filterCounts: {
          all: transformedRecipes.length,
          ready: transformedRecipes.filter(r => (Math.round(Number(r.matchPercentage) || 0) >= 100)).length,
          almostReady: transformedRecipes.filter(r => {
            const mp = Math.round(Number(r.matchPercentage) || 0);
            return mp >= 75 && mp < 100;
          }).length
        },
        isLoading: false
      });
    } catch (error) {
      console.error('Error loading recipes for filtering:', error);
      this.setState({ isLoading: false });
    }
  }

  // Cache pantry data to avoid repeated API calls
  pantryCache = null;
  pantryCacheTime = null;
  PANTRY_CACHE_DURATION = 60000; // 1 minute cache

  async getPantryData() {
    // Use cached pantry data if available and fresh
    const now = Date.now();
    if (this.pantryCache && this.pantryCacheTime && (now - this.pantryCacheTime) < this.PANTRY_CACHE_DURATION) {
      return this.pantryCache;
    }

    try {
      const userId = 1;
      const pantryData = await getPantry(userId);
      this.pantryCache = pantryData;
      this.pantryCacheTime = now;
      return pantryData;
    } catch (error) {
      console.error('Error fetching pantry:', error);
      return this.pantryCache || []; // Return cached data if available, even if stale
    }
  }

  async calculateMatchPercentage(recipeId, ingredients) {
    // Calculate match percentage based on user's pantry
    try {
      const pantryData = await this.getPantryData();
      const pantryIngredientNames = new Set(pantryData.map(item => item.Name.toLowerCase()));
      
      if (ingredients.length === 0) return 0;
      
      const matchingIngredients = ingredients.filter(ing => 
        pantryIngredientNames.has(ing.toLowerCase())
      );
      
      return Math.round((matchingIngredients.length / ingredients.length) * 100);
    } catch (error) {
      console.error('Error calculating match percentage:', error);
      return 0;
    }
  }

  async calculateMissingIngredients(recipeId, ingredients) {
    // Calculate missing ingredients by comparing recipe ingredients with user's pantry
    try {
      const pantryData = await this.getPantryData();
      const pantryIngredientNames = new Set(pantryData.map(item => item.Name.toLowerCase()));
      
      if (ingredients.length === 0) return [];
      
      const missingIngredients = ingredients.filter(ing => {
        const ingLower = ing.toLowerCase();
        return !pantryIngredientNames.has(ingLower);
      });
      
      return missingIngredients.map(name => ({ name }));
    } catch (error) {
      console.error('Error calculating missing ingredients:', error);
      return [];
    }
  }

  async loadRecipes() {
    try {
      const userId = 1; // Default user ID - you can make this dynamic later
      const { filters } = this.props;
      
      // Check if we have filters other than just time
      const hasDietOrAllergenFilters = filters && (
        filters.selectedDiet || 
        (filters.selectedAllergens && filters.selectedAllergens.length > 0) ||
        filters.minCalories !== null ||
        filters.maxCalories !== null
      );
      
      // Check if time filter is different from default
      const hasTimeFilter = filters && filters.maxPrepTime !== 60;

      // If we have diet/allergen/calorie filters, load more recipes for filtering
      // If only time filter, still use normal matches but apply time filter
      if (hasDietOrAllergenFilters) {
        await this.loadRecipesForFiltering();
        return;
      }

      // If only time filter or no filters, use normal recipe matches (top 10 by match percentage)
      const matchesData = await getRecipeMatches(userId);

      // Transform API response to match Recipe model format
      const recipesData = matchesData.map(match => {
        // Handle missing ingredients - can be array or comma-separated string
        let missingIngredients = [];
        if (match.MissingIngredients) {
          if (Array.isArray(match.MissingIngredients)) {
            missingIngredients = match.MissingIngredients.map(name => ({ name }));
          } else if (typeof match.MissingIngredients === 'string') {
            // Split comma-separated string and filter out empty strings
            missingIngredients = match.MissingIngredients
              .split(',')
              .map(name => name.trim())
              .filter(name => name.length > 0)
              .map(name => ({ name }));
          }
        }
        
        return {
          id: match.RecipeID,
          title: match.Title,
          time_minutes: match.TimeMinutes,
          servings: match.Servings,
          calories_per_serving: match.CaloriesPerServing,
          imageURL: match.ImageURL || null,
          matchPercentage: match.MatchPercentage,
          totalIngredients: match.TotalIngredients,
          ingredientsUserHas: match.IngredientsUserHas,
          missingIngredients: missingIngredients,
          tags: match.Tags ? match.Tags.split(',').map(t => t.trim()) : []
        };
      });
      
      // Sort by match percentage (descending) before filtering
      recipesData.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
      
      // Show recipes immediately, load ingredients in background (non-blocking)
      // Pre-fetch ingredients for recipes in background to enable ingredient-based filtering
      this.preloadRecipeIngredients(recipesData).catch(err => console.error('Error preloading ingredients:', err));
      
      // Apply filters to initial recipes (if only time filter, this will just filter by time)
      // Note: ingredient-based filters will work after ingredients are loaded
      let filteredRecipes = await this.applyFilters(recipesData);
      
      // Always limit to top 10 by match percentage after filtering
      filteredRecipes = filteredRecipes.slice(0, 10);
      
      // Store recipes with match info - only update if component is still mounted
      if (this._isMounted) {
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
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
      this.setState({ isLoading: false });
    }
  }

  async preloadRecipeIngredients(recipes) {
    // Pre-fetch ingredients for recipes with throttling to avoid rate limiting (40 calls/min max)
    // Process in batches of 5 with shorter delays - runs in background, non-blocking
    const recipesToLoad = recipes.slice(0, 20); // Reduced from 50 to 20 to speed up initial load
    const batchSize = 5; // Smaller batches for better responsiveness
    const delayBetweenBatches = 1500; // Reduced from 2000ms to 1500ms
    
    // Process batches with yield points to allow UI updates
    for (let i = 0; i < recipesToLoad.length; i += batchSize) {
      const batch = recipesToLoad.slice(i, i + batchSize);
      const ingredientPromises = batch.map(recipe => 
        this.getRecipeIngredients(recipe.id).catch(() => [])
      );
      
      // Don't await - let it run in background
      Promise.all(ingredientPromises).catch(() => {});
      
      // Yield to UI thread between batches
      if (i + batchSize < recipesToLoad.length) {
        await new Promise(resolve => {
          // Use requestAnimationFrame to ensure UI can update
          requestAnimationFrame(() => {
            setTimeout(resolve, delayBetweenBatches);
          });
        });
      }
    }
  }

  async setupAvailableIngredients() {
    try {
      // Use cached pantry data to avoid duplicate API calls
      const pantryData = await this.getPantryData();
      this.availableIngredients = pantryData.map(item => item.Name.toLowerCase());
    } catch (error) {
      console.error('Error loading pantry data for ingredients:', error);
      // Fallback mock ingredients if API fails
      this.availableIngredients = [
        'egg', 'cheese', 'butter', 'salt', 'black_pepper', 'garlic', 'onion', 
        'carrot', 'olive_oil', 'soy_sauce', 'chicken_breast', 'bell_pepper',
        'broccoli', 'canned_tuna', 'mayonnaise', 'bread_slice'
      ];
    }
  }


  handleFilterChange = async (filter) => {
    let filteredRecipes = [];
    
    switch (filter) {
      case 'all':
        filteredRecipes = [...this.state.recipes]; // Create copy to maintain sort
        break;
      case 'ready':
        filteredRecipes = this.state.recipes.filter(r => {
          const mp = Math.round(Number(r.matchPercentage) || 0);
          return mp >= 100;
        });
        // Sort by match percentage (descending) to maintain order
        filteredRecipes.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
        break;
      case 'almostReady':
        filteredRecipes = this.state.recipes.filter(r => {
          const mp = Math.round(Number(r.matchPercentage) || 0);
          return mp >= 75 && mp < 100;
        });
        // Sort by match percentage (descending) to maintain order
        filteredRecipes.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
        break;
      default:
        filteredRecipes = [...this.state.recipes]; // Create copy to maintain sort
    }

    // Apply advanced filters (from SettingsPanel) - time, calories, diet, allergens
    filteredRecipes = await this.applyFilters(filteredRecipes);
    
    // Always limit to top 10 by match percentage
    filteredRecipes = filteredRecipes.slice(0, 10);

    this.setState({ 
      activeFilter: filter,
      filteredRecipes: this.applySearchFilter(filteredRecipes)
    });
  };

  handleSearchChange = async (e) => {
    const query = e.target.value.trim();
    const { filters } = this.props;
    const hasFilters = filters && (
      filters.selectedDiet || 
      (filters.selectedAllergens && filters.selectedAllergens.length > 0) ||
      filters.maxPrepTime !== 60 ||
      filters.minCalories !== null ||
      filters.maxCalories !== null
    );

    if (query.length > 0) {
      // User is typing - use search API to get all matching recipes
      try {
        this.setState({ isLoading: true, isSearchMode: true });
        const searchResults = await searchRecipes(query);
        
        // Transform search results to match our recipe format with throttling
        // Process in batches to avoid rate limiting
        const batchSize = 10;
        const delayBetweenBatches = 2000; // 2 seconds between batches
        const transformedRecipes = [];
        
        for (let i = 0; i < searchResults.length; i += batchSize) {
          const batch = searchResults.slice(i, i + batchSize);
          const batchPromises = batch.map(async (recipe) => {
            // Get ingredients for match percentage calculation
            const ingredients = await this.getRecipeIngredients(recipe.RecipeID);
            
            // Calculate match percentage and missing ingredients based on pantry
            const matchPercentage = await this.calculateMatchPercentage(recipe.RecipeID, ingredients);
            const missingIngredients = await this.calculateMissingIngredients(recipe.RecipeID, ingredients);
            
            return {
              id: recipe.RecipeID,
              title: recipe.Title,
              time_minutes: recipe.TimeMinutes,
              servings: recipe.Servings,
              calories_per_serving: recipe.CaloriesPerServing,
              imageURL: recipe.ImageURL || null,
              matchPercentage: matchPercentage,
              totalIngredients: ingredients.length,
              ingredientsUserHas: Math.round(matchPercentage * ingredients.length / 100),
              missingIngredients: missingIngredients,
              tags: recipe.Tags ? recipe.Tags.split(',').map(t => t.trim()) : []
            };
          });
          
          const batchResults = await Promise.all(batchPromises);
          transformedRecipes.push(...batchResults);
          
          // Wait before next batch (except for the last batch)
          if (i + batchSize < searchResults.length) {
            await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
          }
        }

        // Sort by match percentage (descending) before filtering
        transformedRecipes.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));

        // When searching, show ALL matching recipes (don't limit to 10)
        // Apply filters if any, but still show all filtered results
        let filtered = transformedRecipes;
        if (hasFilters) {
          filtered = await this.applyFilters(transformedRecipes);
        }
        
        // Note: For search, we show all results. For non-search, we limit to top 10.

        this.setState({ 
          searchQuery: query,
          recipes: transformedRecipes,
          filteredRecipes: filtered,
          filterCounts: {
            all: transformedRecipes.length,
            ready: transformedRecipes.filter(r => (Math.round(Number(r.matchPercentage) || 0) >= 100)).length,
            almostReady: transformedRecipes.filter(r => {
              const mp = Math.round(Number(r.matchPercentage) || 0);
              return mp >= 75 && mp < 100;
            }).length
          },
          isLoading: false
        });
      } catch (error) {
        console.error('Error searching recipes:', error);
        this.setState({ isLoading: false });
      }
    } else {
      // User cleared search - reload recipes normally
      this.setState({ 
        searchQuery: '',
        isSearchMode: false,
        isLoading: true
      });
      await this.loadRecipes();
    }
  };

  async getCurrentFilteredRecipes() {
    const { activeFilter } = this.state;
    let recipes = [];
    
    switch (activeFilter) {
      case 'ready':
        recipes = this.state.recipes.filter(r => {
          const mp = Math.round(Number(r.matchPercentage) || 0);
          return mp >= 100;
        });
        // Sort by match percentage (descending) to maintain order
        recipes.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
        break;
      case 'almostReady':
        recipes = this.state.recipes.filter(r => {
          const mp = Math.round(Number(r.matchPercentage) || 0);
          return mp >= 75 && mp < 100;
        });
        // Sort by match percentage (descending) to maintain order
        recipes.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
        break;
      default:
        recipes = [...this.state.recipes]; // Create copy to maintain sort
    }

    // Apply advanced filters (from SettingsPanel) - this will also sort
    const filtered = await this.applyFilters(recipes);
    
    // Always limit to top 10 by match percentage
    return filtered.slice(0, 10);
  }

  applySearchFilter(recipes, query = this.state.searchQuery) {
    if (!query.trim()) return recipes;
    const lowerQuery = query.toLowerCase();
    return recipes.filter(recipe => 
      recipe.title.toLowerCase().includes(lowerQuery)
    );
  }

  async getRecipeIngredients(recipeId) {
    // Check cache first
    if (this.recipeIngredientsCache[recipeId]) {
      return this.recipeIngredientsCache[recipeId];
    }
    
    try {
      const recipeDetails = await getRecipeDetails(recipeId);
      const ingredients = (recipeDetails.ingredients || []).map(ing => ing.Name.toLowerCase());
      this.recipeIngredientsCache[recipeId] = ingredients;
      return ingredients;
    } catch (error) {
      console.error(`Error fetching ingredients for recipe ${recipeId}:`, error);
      return [];
    }
  }

  async applyFilters(recipes) {
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

    // Filter by diet type - check ingredients
    if (filters.selectedDiet) {
      const dietKeywords = this.getDietIngredientKeywords(filters.selectedDiet);
      const filteredPromises = filtered.map(async (recipe) => {
        const ingredients = await this.getRecipeIngredients(recipe.id);
        return this.checkDietaryRestriction(ingredients, filters.selectedDiet, dietKeywords);
      });
      const dietResults = await Promise.all(filteredPromises);
      filtered = filtered.filter((_, index) => dietResults[index]);
    }

    // Filter by allergens - check ingredients
    if (filters.selectedAllergens && filters.selectedAllergens.length > 0) {
      const allergenKeywords = this.getAllergenIngredientKeywords(filters.selectedAllergens);
      const filteredPromises = filtered.map(async (recipe) => {
        const ingredients = await this.getRecipeIngredients(recipe.id);
        return !this.containsAllergens(ingredients, allergenKeywords);
      });
      const allergenResults = await Promise.all(filteredPromises);
      filtered = filtered.filter((_, index) => allergenResults[index]);
    }

    // Sort by match percentage (descending) to prioritize recipes with higher match
    filtered.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));

    return filtered;
  }

  getDietIngredientKeywords(diet) {
    const dietLower = diet.toLowerCase();
    const keywordMap = {
      'vegan': {
        exclude: ['meat', 'chicken', 'beef', 'pork', 'fish', 'seafood', 'egg', 'eggs', 'milk', 'cheese', 'butter', 'dairy', 'honey', 'gelatin'],
        require: []
      },
      'vegetarian': {
        exclude: ['meat', 'chicken', 'beef', 'pork', 'fish', 'seafood', 'bacon', 'sausage', 'ham'],
        require: []
      },
      'pescatarian': {
        exclude: ['meat', 'chicken', 'beef', 'pork', 'bacon', 'sausage', 'ham'],
        require: []
      },
      'keto': {
        exclude: ['bread', 'pasta', 'rice', 'potato', 'potatoes', 'sugar', 'flour', 'wheat'],
        require: []
      },
      'paleo': {
        exclude: ['bread', 'pasta', 'rice', 'wheat', 'flour', 'dairy', 'milk', 'cheese', 'legume', 'bean', 'beans'],
        require: []
      },
      'low_carb': {
        exclude: ['bread', 'pasta', 'rice', 'potato', 'potatoes', 'sugar'],
        require: []
      }
    };
    return keywordMap[dietLower] || { exclude: [], require: [] };
  }

  getAllergenIngredientKeywords(allergens) {
    const allergenMap = {
      'gluten_free': ['wheat', 'flour', 'bread', 'pasta', 'gluten', 'barley', 'rye', 'oats'],
      'dairy_free': ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'yoghurt', 'dairy', 'whey', 'casein'],
      'egg_free': ['egg', 'eggs', 'mayonnaise', 'mayo'],
      'soy_free': ['soy', 'soya', 'soybean', 'tofu', 'tempeh', 'miso'],
      'nut_free': ['peanut', 'peanuts', 'almond', 'almonds', 'walnut', 'walnuts', 'cashew', 'cashews', 'hazelnut', 'pistachio'],
      'shellfish_free': ['shrimp', 'prawn', 'crab', 'lobster', 'scallop', 'mussel', 'oyster', 'shellfish', 'crustacean'],
      'pork_free': ['pork', 'bacon', 'ham', 'sausage', 'prosciutto', 'pancetta'],
      'beef_free': ['beef', 'steak', 'ground beef', 'hamburger']
    };
    
    const allKeywords = [];
    allergens.forEach(allergen => {
      const keywords = allergenMap[allergen.toLowerCase()] || [];
      allKeywords.push(...keywords);
    });
    return allKeywords;
  }

  async checkDietaryRestriction(ingredients, diet, dietKeywords) {
    const ingredientSet = new Set(ingredients);
    
    // Check for excluded ingredients
    for (const excludeKeyword of dietKeywords.exclude) {
      for (const ingredient of ingredients) {
        if (ingredient.includes(excludeKeyword.toLowerCase())) {
          return false;
        }
      }
    }
    
    // Check for required ingredients (if any)
    if (dietKeywords.require.length > 0) {
      const hasRequired = dietKeywords.require.some(req => 
        ingredients.some(ing => ing.includes(req.toLowerCase()))
      );
      if (!hasRequired) {
        return false;
      }
    }
    
    return true;
  }

  containsAllergens(ingredients, allergenKeywords) {
    const allergenSet = new Set(allergenKeywords.map(k => k.toLowerCase()));
    
    for (const ingredient of ingredients) {
      const ingLower = ingredient.toLowerCase();
      for (const allergen of allergenSet) {
        if (ingLower.includes(allergen)) {
          return true;
        }
      }
    }
    
    return false;
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

                // Ensure missingIngredients is in the correct format (array of objects with name property)
                const missingIngredients = (recipe.missingIngredients || []).map(item => {
                  if (typeof item === 'string') {
                    return { name: item };
                  }
                  return item; // Already an object with name property
                });

                const matchInfo = {
                  matchPercentage,
                  totalIngredients: recipe.totalIngredients || 0,
                  availableIngredients: recipe.ingredientsUserHas || 0,
                  missingIngredients: missingIngredients,
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