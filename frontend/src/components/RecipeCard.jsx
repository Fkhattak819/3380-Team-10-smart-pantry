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
      this.setState({ notification: { message: 'All ingredients are already in your pantry.', type: 'error' } });
      return;
    }
  
    try {
      const userId = 1;
      const recipeId = recipe.id;
  
      const result = await addMissingToShoppingList(userId, recipeId);
  
      if (result && typeof result.addedCount === 'number' && result.addedCount === 0) {
        this.setState({ 
          notification: { 
            message: 'These ingredients are already in your pantry.', 
            type: 'error' 
          } 
        });
        return;
      }
  
      let addedToCartCount = 0;
  
      if (matchInfo.missingIngredients && Array.isArray(matchInfo.missingIngredients) && onAddToCart) {
        matchInfo.missingIngredients.forEach(ing => {
          const ingredientName = typeof ing === 'string' ? ing : (ing.name || ing.label || '');
          if (ingredientName) {
            const formattedName = String(ingredientName).replace(/_/g, ' ').trim();
            const wasAdded = onAddToCart(formattedName);
            if (wasAdded) {
              addedToCartCount += 1;
            }
          }
        });
      }
  
      if (addedToCartCount > 0) {
        this.setState({ 
          notification: { 
            message: `Added ${addedToCartCount} ingredient(s) to your cart.`, 
            type: 'success' 
          } 
        });
      } else {
        this.setState({ 
          notification: { 
            message: 'All of these ingredients are already in your cart.', 
            type: 'error' 
          } 
        });
      }
  
    } catch (error) {
      console.error('Error adding missing ingredients:', error);
      this.setState({ 
        notification: { 
          message: 'Failed to add missing ingredients: ' + (error.message || 'Unknown error'), 
          type: 'error' 
        } 
      });
    }
  };

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
        return 'border-emerald-300 bg-emerald-50';
      case 'almost-ready':
        return 'border-amber-200 bg-amber-50/40';
      case 'needs-ingredients':
        return 'border-rose-200 bg-rose-50/40';
      default:
        return 'border-slate-200 bg-white';
    }
  }

  getProgressBarColor(matchPercentage) {
    if (matchPercentage >= 75) return 'bg-emerald-500';
    if (matchPercentage >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  }

  renderMissingIngredients() {
    const { isMissingExpanded } = this.state;
    const { missingIngredients } = this.props.matchInfo;
    
    const missingNames = missingIngredients.map(ing => ing.name.replace(/_/g, ' '));
    const MAX_DISPLAY_MISSING = 3;

    if (missingNames.length === 0) {
      return null;
    }

    const namesToShow = isMissingExpanded
      ? missingNames
      : missingNames.slice(0, MAX_DISPLAY_MISSING);

    return (
      <>
        <div className="flex flex-wrap gap-1">
          {namesToShow.map(name => (
            <span
              key={name}
              className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs"
            >
              {name}
            </span>
          ))}
          {missingNames.length > MAX_DISPLAY_MISSING && !isMissingExpanded && (
            <button
              onClick={this.toggleMissing}
              className="text-[11px] text-sky-600 hover:underline ml-1"
            >
              +{missingNames.length - MAX_DISPLAY_MISSING} more
            </button>
          )}
        </div>
        {isMissingExpanded && missingNames.length > MAX_DISPLAY_MISSING && (
          <button
            onClick={this.toggleMissing}
            className="mt-1 text-[11px] text-sky-600 hover:underline"
          >
            Show less
          </button>
        )}
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
          className={`bg-white rounded-xl border overflow-hidden shadow-sm transition-all duration-200 ${
            isHovered ? 'shadow-md -translate-y-1' : ''
          } ${this.getStatusColorClass(status)}`}
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}
        >
          {/* IMAGE HEADER */}
          <div className="relative h-52 bg-slate-50 overflow-hidden">
            {recipe.imageURL ? (
              <img
                src={recipe.imageURL}
                alt={recipe.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const placeholder = e.target.parentElement.querySelector('.food-placeholder');
                  if (placeholder) placeholder.style.display = 'flex';
                }}
              />
            ) : null}

            <div
              className={`absolute inset-0 flex items-center justify-center food-placeholder bg-slate-100 ${
                recipe.imageURL ? 'hidden' : 'flex'
              }`}
            >
              <span className="text-4xl md:text-5xl tracking-[0.4em] text-slate-300">
                FOOD
              </span>
            </div>

            {/* Match badge */}
            <div className="absolute top-3 right-3 z-10">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur ${
                  this.getMatchColorClass(matchPercentage)
                }`}
              >
                {matchPercentage}% match
              </span>
            </div>
          </div>

          {/* BODY */}
          <div className="p-4 md:p-5">
            <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
              {recipe.title}
            </h3>

            {/* META ROW */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mb-3">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100">
                ⏱ <span className="font-medium">{formatTime(recipe.time_minutes || recipe.timeMinutes)}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100">
                🔥 <span className="font-medium">
                  {recipe.calories_per_serving || recipe.caloriesPerServing || 0} cal
                </span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100">
                👥 <span className="font-medium">
                  {recipe.servings || 0} serving{(recipe.servings || 0) === 1 ? '' : 's'}
                </span>
              </span>
            </div>

            {/* PROGRESS BAR */}
            <div className="mb-3">
              <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                <span>Ingredients available</span>
                <span className="font-medium text-slate-700">
                  {typeof availableIngredients === 'number'
                    ? availableIngredients
                    : availableIngredients.length}
                  /
                  {recipe.totalIngredients || recipe.ingredients?.length || 0}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${this.getProgressBarColor(matchPercentage)}`}
                  style={{ width: `${matchPercentage}%` }}
                ></div>
              </div>
            </div>
            
            {/* MISSING INGREDIENTS */}
            {missingIngredients.length > 0 && (
              <div className="mb-4">
                <p className="text-[11px] font-semibold text-amber-700 mb-1">
                  Missing ingredients
                </p>
                {this.renderMissingIngredients()}
              </div>
            )}

            {/* ACTIONS */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button 
                onClick={() => onViewRecipe(recipe)}
                className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors"
              >
                View recipe
              </button>

              {missingIngredients && missingIngredients.length > 0 && (
                <button 
                  onClick={this.handleAddMissingToCart}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition-colors"
                  title="Add Missing Ingredients to Shopping List"
                >
                  Add missing ingredients
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