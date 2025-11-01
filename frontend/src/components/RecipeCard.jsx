import React, { Component } from 'react';

// Recipe card component
class RecipeCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isHovered: false,
      isMissingExpanded: false,
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
    
    const missingNames = missingIngredients.map(ing => ing.name);
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
    const { isHovered } = this.state;

    if (!recipe || !matchInfo) {
      return null;
    }

    const { matchPercentage, missingIngredients, availableIngredients, status } = matchInfo;

    return (
      <div 
        className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 ${
          isHovered ? 'shadow-lg transform scale-105' : ''
        } ${this.getStatusColorClass(status)}`}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <div className="relative h-48 bg-white">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl opacity-50">FOOD</span>
          </div>
          <div className="absolute top-2 right-2">
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
              <span>{recipe.getTimeFormatted()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>CAL</span>
              <span>{recipe.caloriesPerServing} cal</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>PEOPLE</span>
              <span>{recipe.servings}</span>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Ingredients Available</span>
              <span>{availableIngredients.length}/{recipe.ingredients.length}</span>
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
            <button className="text-gray-600 hover:text-gray-800 transition-colors">
              <span className="text-lg">CART</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default RecipeCard;