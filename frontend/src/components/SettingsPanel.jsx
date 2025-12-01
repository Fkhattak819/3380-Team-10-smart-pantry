import React, { Component } from 'react';
import { getUserPreferences, saveUserPreferences } from '../services/api';

// Database format options (underscore_separated)
const dietOptions = [
  { value: 'vegan', label: 'Vegan' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'pescatarian', label: 'Pescatarian' },
  { value: 'keto', label: 'Keto' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'low_carb', label: 'Low Carb' }
];

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

class SettingsPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      maxPrepTime: 60,
      selectedDiet: '',
      minCalories: '',
      maxCalories: '',
      isAllergensOpen: false,
      selectedAllergens: allergenOptions.reduce((acc, allergen) => {
        acc[allergen.value] = false;
        return acc;
      }, {}),
      isLoading: true
    };
    this.userId = 1; // Default user ID - same as other components
  }

  componentDidMount() {
    this.loadPreferences();
  }

  loadPreferences = async () => {
    try {
      const preferences = await getUserPreferences(this.userId);
      if (preferences && Array.isArray(preferences)) {
        // Separate food types from allergens
        const foodTypes = dietOptions.map(d => d.value);
        const allergenValues = allergenOptions.map(a => a.value);
        
        const savedDiets = preferences.filter(p => foodTypes.includes(p));
        const savedAllergens = preferences.filter(p => allergenValues.includes(p));
        
        // Set selected diet (only one can be selected)
        if (savedDiets.length > 0) {
          this.setState({ selectedDiet: savedDiets[0] });
        }
        
        // Set selected allergens
        const allergenState = allergenOptions.reduce((acc, allergen) => {
          acc[allergen.value] = savedAllergens.includes(allergen.value);
          return acc;
        }, {});
        this.setState({ selectedAllergens: allergenState });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      this.setState({ isLoading: false });
    }
  };

  handlePrepTimeChange = (e) => {
    const value = parseInt(e.target.value);
    // Constrain input to be between 5 and 999 minutes
    let newTime = value;
    if (newTime < 5) newTime = 5;
    if (newTime > 999) newTime = 999;
    
    this.setState({ maxPrepTime: newTime });
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
    }));
  };

  handleDietChange = (e) => {
    this.setState({ selectedDiet: e.target.value });
  };

  handleMinCaloriesChange = (e) => {
    this.setState({ minCalories: e.target.value });
  };

  handleMaxCaloriesChange = (e) => {
    this.setState({ maxCalories: e.target.value });
  };

  handleFilterClick = async () => {
    const { onFilterChange } = this.props;
    
    // Prepare preferences to save (both food types and allergens)
    const preferencesToSave = [];
    
    // Add selected diet if any
    if (this.state.selectedDiet) {
      preferencesToSave.push(this.state.selectedDiet);
    }
    
    // Add selected allergens
    const selectedAllergenValues = Object.keys(this.state.selectedAllergens).filter(
      allergen => this.state.selectedAllergens[allergen]
    );
    preferencesToSave.push(...selectedAllergenValues);
    
    // Save to database
    try {
      await saveUserPreferences(this.userId, preferencesToSave);
    } catch (error) {
      console.error('Error saving preferences:', error);
      // Still continue with filter change even if save fails
    }
    
    // Notify parent component of filter changes
    if (onFilterChange) {
      onFilterChange({
        maxPrepTime: this.state.maxPrepTime,
        selectedDiet: this.state.selectedDiet,
        minCalories: this.state.minCalories ? parseInt(this.state.minCalories) : null,
        maxCalories: this.state.maxCalories ? parseInt(this.state.maxCalories) : null,
        selectedAllergens: selectedAllergenValues
      });
    }
  };

  handleResetFilters = async () => {
    const { onFilterChange } = this.props;
    
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
      await saveUserPreferences(this.userId, []);
    } catch (error) {
      console.error('Error clearing preferences:', error);
      // Still continue with reset even if save fails
    }
    
    // Notify parent component with default filter values
    if (onFilterChange) {
      onFilterChange({
        maxPrepTime: 60,
        selectedDiet: '',
        minCalories: null,
        maxCalories: null,
        selectedAllergens: []
      });
    }
  };

  render() {
    const { isOpen, onClose } = this.props;
    const { maxPrepTime, selectedDiet, minCalories, maxCalories, isAllergensOpen, selectedAllergens } = this.state;

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
                <div className="absolute w-72 bg-white border border-gray-300 mt-1 rounded-lg shadow-lg p-3 max-h-48 overflow-y-auto z-50">
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
                value={selectedDiet}
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
                      value={minCalories}
                      onChange={this.handleMinCaloriesChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-800"
                    />
                  </label>
                  <label className="flex-1">
                    <span className="block text-xs text-gray-500 mb-1">Max (cal):</span>
                    <input 
                      type="number"
                      placeholder="800"
                      value={maxCalories}
                      onChange={this.handleMaxCaloriesChange}
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
            
            {/* Filter Button */}
            <button 
              onClick={this.handleFilterClick}
              className="w-full bg-green-500 text-white font-medium py-2 rounded-lg hover:bg-green-600 transition-colors mb-3"
            >
              Filter
            </button>

            {/* Reset Filter Button */}
            <button 
              onClick={this.handleResetFilters}
              className="w-full bg-gray-500 text-white font-medium py-2 rounded-lg hover:bg-gray-600 transition-colors mb-auto"
            >
              Reset Filter
            </button>

            {/* Logout Button (pushed to bottom) */}
            <div className="mt-8 pt-4 border-t">
              <button 
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