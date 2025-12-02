import React, { Component } from 'react';
import { getUserPreferences, saveUserPreferences } from '../services/api.js';

// Database format options - these match the database values
// Diet types only (excludes allergens which are in allergenOptions)
const dietOptions = [
  { value: 'vegan', label: 'Vegan' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'pescatarian', label: 'Pescatarian' },
  { value: 'keto', label: 'Keto' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'low_carb', label: 'Low Carb' }
];

// Allergen options (excluded from diet types)
const allergenOptions = [
  { value: 'gluten_free', label: 'Gluten Free' },
  { value: 'dairy_free', label: 'Dairy Free' },
  { value: 'egg_free', label: 'Egg Free' },
  { value: 'soy_free', label: 'Soy Free' },
  { value: 'nut_free', label: 'Nut Free' },
  { value: 'shellfish_free', label: 'Shellfish Free' },
  { value: 'pork_free', label: 'Pork Free' },
  { value: 'beef_free', label: 'Beef Free' }
];

// Format display names - convert underscores to spaces
const formatDisplayName = (name) => {
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

class SettingsPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      maxPrepTime: 300, 
      isAllergensOpen: false,
      selectedAllergens: allergenOptions.reduce((acc, allergen) => {
        acc[allergen.value] = false;
        return acc;
      }, {}),
      selectedDiet: '',
      minCalories: '',
      maxCalories: '',
      isLoading: false
    };
  }

  componentDidMount() {
    this.loadUserPreferences();
  }

  componentDidUpdate(prevProps) {
    if (this.props.userId && this.props.userId !== prevProps.userId) {
      this.loadUserPreferences();
    }
  }

  getLocalStorageKey(userId) {
    return `userPreferences_${userId}`;
  }

  async loadUserPreferences() {
    const { userId } = this.props;
    if (!userId) return;

    try {
      this.setState({ isLoading: true });
      
      // Load diet preference from database
      const preferences = await getUserPreferences(userId);
      let selectedDiet = '';
      
      // Backend returns an array of DietType strings, e.g., ["vegan", "vegetarian"]
      if (preferences && Array.isArray(preferences) && preferences.length > 0) {
        // Use first diet if multiple are stored
        selectedDiet = preferences[0] || '';
      } else if (preferences && preferences.DietType) {
        // Handle legacy format (object with DietType property)
        const diets = preferences.DietType.split(',').map(d => d.trim()).filter(d => d);
        selectedDiet = diets[0] || '';
      }
      
      // Load other preferences from localStorage (allergens, calories, prep time)
      const localStorageKey = this.getLocalStorageKey(userId);
      const savedPreferences = localStorage.getItem(localStorageKey);
      
      if (savedPreferences) {
        try {
          const parsed = JSON.parse(savedPreferences);
          const defaultAllergens = allergenOptions.reduce((acc, allergen) => {
            acc[allergen.value] = false;
            return acc;
          }, {});
          
          this.setState({
            selectedDiet: selectedDiet || parsed.selectedDiet || '',
            maxPrepTime: parsed.maxPrepTime || 60,
            minCalories: parsed.minCalories || '',
            maxCalories: parsed.maxCalories || '',
            selectedAllergens: parsed.selectedAllergens || defaultAllergens
          });
        } catch (e) {
          this.setState({ selectedDiet });
        }
      } else {
        this.setState({ selectedDiet });
      }
    } catch (error) {
      // Ignore errors loading preferences
    } finally {
      this.setState({ isLoading: false });
    }
  }

  async savePreferences() {
    const { userId } = this.props;
    if (!userId) {
      return;
    }

    try {
      const { selectedDiet } = this.state;
      const diets = selectedDiet ? [selectedDiet] : [];
      await saveUserPreferences(userId, diets);
      
      const localStorageKey = this.getLocalStorageKey(userId);
      const preferencesToSave = {
        selectedDiet: this.state.selectedDiet,
        maxPrepTime: this.state.maxPrepTime,
        minCalories: this.state.minCalories,
        maxCalories: this.state.maxCalories,
        selectedAllergens: this.state.selectedAllergens
      };
      localStorage.setItem(localStorageKey, JSON.stringify(preferencesToSave));
    } catch (error) {
      alert('Failed to save preferences. Please try again.');
    }
  }

  handleLogoutClick = () => {
    const { onLogout, onClose } = this.props;
    try {
      if (onLogout) onLogout();
    } catch (e) {
      // Ignore errors
    }
    if (onClose) onClose();
  }

  handlePrepTimeChange = (e) => {
    const value = parseInt(e.target.value);
    let newTime = value;
    if (newTime < 5) newTime = 5;
    if (newTime > 999) newTime = 999;
    
    this.setState({ maxPrepTime: newTime }, () => {
      this.savePreferences();
    });
  };

  handleDietChange = (e) => {
    this.setState({ selectedDiet: e.target.value }, () => {
      // Auto-save when diet changes
      this.savePreferences();
    });
  };

  handleCalorieChange = (field, value) => {
    this.setState({ [field]: value }, () => {
      // Auto-save when calories change
      this.savePreferences();
    });
  };
  
  toggleAllergensDropdown = () => {
    this.setState(prevState => ({ isAllergensOpen: !prevState.isAllergensOpen }));
  };
  
  handleAllergenToggle = (allergen) => {
    this.setState(prevState => ({
      selectedAllergens: {
        ...prevState.selectedAllergens,
        [allergen]: !prevState.selectedAllergens[allergen]
      }
    }), () => {
      // Auto-save when allergens change
      this.savePreferences();
    });
  };

  handleFilterClick = async () => {
    // Save preferences when filter button is clicked
    await this.savePreferences();
    
    // Notify parent component about filter changes (if needed)
    if (this.props.onFilterChange) {
      const { maxPrepTime, selectedDiet, minCalories, maxCalories, selectedAllergens } = this.state;
      const selectedAllergenList = Object.keys(selectedAllergens).filter(key => selectedAllergens[key]);
      
      this.props.onFilterChange({
        maxPrepTime,
        selectedDiet,
        minCalories: minCalories ? parseInt(minCalories) : null,
        maxCalories: maxCalories ? parseInt(maxCalories) : null,
        selectedAllergens: selectedAllergenList
      });
    }
  };

  handleResetFilters = async () => {
    const { onFilterChange, userId } = this.props;
    
    // Reset all state to default values
    const defaultAllergens = allergenOptions.reduce((acc, allergen) => {
      acc[allergen.value] = false;
      return acc;
    }, {});
    
    this.setState({
      maxPrepTime: 60,
      selectedDiet: '',
      minCalories: '',
      maxCalories: '',
      selectedAllergens: defaultAllergens
    });
    
    // Clear preferences from database
    try {
      if (userId) {
        await saveUserPreferences(userId, []);
        // Also clear localStorage
        const localStorageKey = this.getLocalStorageKey(userId);
        localStorage.removeItem(localStorageKey);
      }
    } catch (error) {
      // Still continue with reset even if save fails
    }
    
    if (onFilterChange) {
      onFilterChange({
        maxPrepTime: 60,
        selectedDiet: '',
        minCalories: null,
        maxCalories: null,
        selectedAllergens: []
      });
    }
    
    window.location.reload();
  };

  render() {
    const { isOpen, onClose } = this.props;
    const { maxPrepTime, isAllergensOpen, selectedAllergens } = this.state;

    const panelClass = `fixed top-0 right-0 w-80 h-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out 
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}`;

    const overlayClass = `fixed inset-0 bg-black bg-opacity-30 z-40 ${isOpen ? 'block' : 'hidden'}`;

    return (
      <>
        <div className={overlayClass} onClick={onClose} />

        <div className={panelClass}>
          <div className="p-6 h-full flex flex-col">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
              Recipe Filters
            </h2 >

            {/* Allergen Filter Dropdown with Checkboxes */}
            <div className="mb-6 z-10">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exclude Allergens
              </label>
              <div 
                className="p-2 border border-gray-300 rounded-lg cursor-pointer bg-white flex justify-between items-center hover:border-green-500"
                onClick={this.toggleAllergensDropdown}
              >
                <span>Select Allergens to Exclude</span>
                <span className="text-gray-500">{isAllergensOpen ? '▲' : '▼'}</span>
              </div>
              
              {isAllergensOpen && (
                <div className="absolute w-72 bg-white border border-gray-300 mt-1 rounded-lg shadow-lg p-3 max-h-48 overflow-y-auto">
                  {allergenOptions.map(allergen => (
                    <div key={allergen.value} className="flex items-center space-x-2 py-1">
                      <input 
                        type="checkbox" 
                        id={allergen.value} 
                        checked={selectedAllergens[allergen.value] || false}
                        onChange={() => this.handleAllergenToggle(allergen.value)}
                        className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <label htmlFor={allergen.value} className="text-sm text-gray-700 cursor-pointer">
                        {allergen.label}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Filter Dropdown 1: Food Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Food Type
              </label>
              <select 
                value={this.state.selectedDiet}
                onChange={this.handleDietChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              >
                <option value="">-- Select Diet --</option>
                {dietOptions.map(diet => (
                  <option key={diet.value} value={diet.value}>{diet.label}</option>
                ))}
              </select>
            </div>

            {/* Filter Dropdown 2: Calorie Range Input Fields */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Calorie Range
              </label>
              <div className="space-y-4 p-2 bg-gray-50 border rounded-lg">
                
                {/* Min/Max Input Fields */}
                <div className="flex justify-between items-center space-x-3 text-sm text-gray-600">
                  <label className="flex-1">
                    <span className="block text-xs text-gray-500 mb-1">Min (cal):</span>
                    <input 
                      type="number"
                      placeholder="300"
                      value={this.state.minCalories}
                      onChange={(e) => this.handleCalorieChange('minCalories', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-800"
                    />
                  </label>
                  <label className="flex-1">
                    <span className="block text-xs text-gray-500 mb-1">Max (cal):</span>
                    <input 
                      type="number"
                      placeholder="800"
                      value={this.state.maxCalories}
                      onChange={(e) => this.handleCalorieChange('maxCalories', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-800"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Max Prep Time: Input Field (Precise) and Slider (Quick) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="max-prep-time-input">
                Max Prep Time (min)
              </label>
              <input 
                id="max-prep-time-input"
                type="number"
                min="5"
                max="999"
                step="5"
                placeholder="60"
                value={maxPrepTime}
                onChange={this.handlePrepTimeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-800 mb-3" 
              />
              <input 
                type="range"
                min="5"
                max="999"
                step="5"
                value={maxPrepTime}
                onChange={this.handlePrepTimeChange}
                className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer" 
              />
            </div>
            
            {/* Filter Button (pushes the Logout Button to the bottom) */}
            <div className="mb-2">
              <button 
                onClick={this.handleFilterClick}
                className="w-full bg-green-500 text-white font-medium py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                {this.state.isLoading ? 'Saving...' : 'Filter'}
              </button>
            </div>
            
            {/* Reset Filter Button */}
            <button 
              onClick={this.handleResetFilters}
              className="w-full bg-gray-400 text-white font-medium py-2 rounded-lg hover:bg-gray-500 transition-colors mb-auto"
            >
              Reset Filter
            </button>

            {/* Logout Button (pushed to bottom) */}
            <div className="mt-8 pt-4 border-t">
              <button 
                onClick={this.handleLogoutClick}
                className="w-full bg-red-500 text-white font-medium py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>

          </div>
        </div>
      </>
    );
  }
}

export default SettingsPanel;