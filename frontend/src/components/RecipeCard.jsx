import React, { Component } from 'react';
import { addMissingToShoppingList } from '../services/api.js';
import Notification from './Notification.jsx';

// Helper function to format time
function formatTime(timeMinutes) {
  if (!timeMinutes) return 'N/A';
  if (timeMinutes < 60) {
    return `${timeMinutes} min`;
  }
  const hours = Math.floor(timeMinutes / 60);
  const minutes = timeMinutes % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

// Recipe card component
class RecipeCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isHovered: false,
      isMissingExpanded: false,
      notification: null,
    };
  }

  handleMouseEnter = () => {
    this.setState({ isHovered: true });
  };

  handleMouseLeave = () => {
    this.setState({ isHovered: false });
  };

  toggleMissing = (e) => {
    e.stopPropagation();
    this.setState(prevState => ({ 
      isMissingExpanded: !prevState.isMissingExpanded 
    }));
  };

  handleAddMissingToCart = async (e) => {
    e.stopPropagation();
    const { recipe, matchInfo, onAddToCart } = this.props;
    
    if (!recipe || !recipe.id) {
      this.setState({ notification: { message: 'Recipe information is missing', type: 'error' } });
      return;
    }

    if (!matchInfo || !Array.isArray(matchInfo.missingIngredients) || matchInfo.missingIngredients.length === 0) {
      this.setState({ notification: { message: 'No missing ingredients to add', type: 'error' } });
      return;
    }

    try {
      const userId = 1; // Default user ID - you can make this dynamic later
      const recipeId = recipe.id;
      
      // First, add ingredients to local cart state using matchInfo (which we already have)
      if (matchInfo.missingIngredients && Array.isArray(matchInfo.missingIngredients) && onAddToCart) {
        matchInfo.missingIngredients.forEach(ing => {
          const ingredientName = typeof ing === 'string' ? ing : (ing.name || ing.label || '');
          if (ingredientName) {
            // Format ingredient name: replace underscores with spaces and trim
            const formattedName = String(ingredientName).replace(/_/g, ' ').trim();
            onAddToCart(formattedName);
          }
        });
      }

      // Then, add to database shopping list via API
      const result = await addMissingToShoppingList(userId, recipeId);
      
      if (result && result.addedCount !== undefined) {
        const message = result.addedCount > 0 
          ? `Successfully added ${result.addedCount} missing ingredient(s) to your shopping list!`
          : 'All ingredients are already in your shopping list.';
        
        this.setState({ notification: { message, type: 'success' } });
      } else {
        this.setState({ notification: { message: 'Missing ingredients added to shopping list!', type: 'success' } });
      }
    } catch (error) {
      console.error('Error adding missing ingredients:', error);
      this.setState({ notification: { message: 'Failed to add missing ingredients: ' + (error.message || 'Unknown error'), type: 'error' } });
    }
  }

  handleNotificationClose = () => {
    this.setState({ notification: null });
  }

  getMatchColorClass(matchPercentage) {
    if (matchPercentage >= 75) return 'bg-green-100 text-green-800';
    if (matchPercentage >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  }

  getStatusColorClass(status) {
    switch (status) {
      case 'ready':
        return 'border-green-300 bg-green-50';
      case 'almost-ready':
        return 'border-green-300 bg-green-50';
      case 'needs-ingredients':
        return 'border-red-300 bg-red-50';
      default:
        return 'border-gray-300 bg-white';
    }
  }

  getProgressBarColor(matchPercentage) {
    if (matchPercentage >= 75) return 'bg-green-500';
    if (matchPercentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  renderMissingIngredients() {
    const { isMissingExpanded } = this.state;
    const { missingIngredients } = this.props.matchInfo;
    
    const missingNames = missingIngredients.map(ing => ing.name.replace(/_/g, ' '));
    const MAX_DISPLAY_MISSING = 2;

    if (missingNames.length === 0) {
      return null;
    }

    if (missingNames.length <= MAX_DISPLAY_MISSING || isMissingExpanded) {
      let content = missingNames.join(', ');
      
      if (missingNames.length > MAX_DISPLAY_MISSING) {
        content = (
          <>
            {content}
            <button onClick={this.toggleMissing} className="ml-1 text-blue-500 hover:underline text-xs focus:outline-none">
              (show less)
            </button>
          </>
        );
      }
      return content;
    }

    const truncatedList = missingNames.slice(0, MAX_DISPLAY_MISSING).join(', ');
    return (
      <>
        {truncatedList}
        <button onClick={this.toggleMissing} className="ml-1 text-blue-500 hover:underline text-xs focus:outline-none">
          (...)
        </button>
      </>
    );
  }

  render() {
    const { recipe, matchInfo, onViewRecipe } = this.props;
    const { isHovered, notification } = this.state;

    if (!recipe || !matchInfo) {
      return null;
    }

    const { matchPercentage, missingIngredients, availableIngredients, status } = matchInfo;

    return (
      <>
        {notification && (
          <Notification 
            message={notification.message} 
            type={notification.type}
            onClose={this.handleNotificationClose}
          />
        )}
        <div 
          className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 ${
            isHovered ? 'shadow-lg transform scale-105' : ''
          } ${this.getStatusColorClass(status)}`}
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
        >
        <div className="relative h-48 bg-white overflow-hidden">
          {/* Show image if available, otherwise show placeholder */}
          {recipe.imageURL ? (
            <img 
              src={recipe.imageURL} 
              alt={recipe.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Hide image and show placeholder if image fails to load
                e.target.style.display = 'none';
                const placeholder = e.target.parentElement.querySelector('.food-placeholder');
                if (placeholder) placeholder.style.display = 'flex';
              }}
            />
          ) : null}
          {/* Placeholder shown when no image URL or image fails to load */}
          <div 
            className={`absolute inset-0 flex items-center justify-center food-placeholder bg-gray-50 ${recipe.imageURL ? 'hidden' : 'flex'}`}
          >
            <span className="text-6xl opacity-50">FOOD</span>
          </div>
          <div className="absolute top-2 right-2 z-10">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${this.getMatchColorClass(matchPercentage)}`}>
              {matchPercentage}% Match
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
            {recipe.title}
          </h3>

          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center space-x-1">
              <span>TIME</span>
              <span>{formatTime(recipe.time_minutes || recipe.timeMinutes)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>CAL</span>
              <span>{recipe.calories_per_serving || recipe.caloriesPerServing || 0} cal</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>PEOPLE</span>
              <span>{recipe.servings || 0}</span>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Ingredients Available</span>
              <span>{typeof availableIngredients === 'number' ? availableIngredients : availableIngredients.length}/{recipe.totalIngredients || recipe.ingredients?.length || 0}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${this.getProgressBarColor(matchPercentage)}`}
                style={{ width: `${matchPercentage}%` }}
              ></div>
            </div>
          </div>
          
          {missingIngredients.length > 0 && (
            <div className="mb-3">
              <p className="text-sm text-green-600 font-medium mb-1">Missing:</p>
              <p className="text-xs text-green-600">
                {this.renderMissingIngredients()}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button 
              onClick={() => onViewRecipe(recipe)}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
            >
              View Recipe
            </button>
            {/* ADD MISSING INGREDIENTS BUTTON - Only show if there are missing ingredients */}
            {missingIngredients && missingIngredients.length > 0 && (
              <button 
                onClick={this.handleAddMissingToCart}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
                title="Add Missing Ingredients to Shopping List"
              >
                Add Missing Ingredients
              </button>
            )}
          </div>
        </div>
      </div>
      </>
    );
  }
}

export default RecipeCard;