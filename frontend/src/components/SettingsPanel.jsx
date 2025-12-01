import React, { Component } from 'react';

const dietOptions = [
  'vegetarian', 'vegan', 'keto', 'paleo', 
  'low carb', 'raw', 'no sugar'
];

const allergenOptions = [
  'Celery',
  'Gluten',
  'Crustaceans',
  'Eggs',
  'Fish',
  'Lupin',
  'Milk',
  'Molluscs',
  'Mustard',
  'Peanuts',
  'Sesame',
  'Soybeans',
  'Sulphites',
];

class SettingsPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      maxPrepTime: 30,
      selectedDiet: '',
      minCalories: '',
      maxCalories: '',
      isAllergensOpen: false,
      selectedAllergens: allergenOptions.reduce((acc, allergen) => {
        acc[allergen] = false;
        return acc;
      }, {})
    };
  }

  handlePrepTimeChange = (e) => {
    const value = parseInt(e.target.value);
    // Constrain input to be between 5 and 120 minutes and ensure it's a multiple of 5 if possible
    let newTime = value;
    if (newTime < 5) newTime = 5;
    if (newTime > 120) newTime = 120;
    
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

  handleFilterClick = () => {
    const { onFilterChange } = this.props;
    if (onFilterChange) {
      onFilterChange({
        maxPrepTime: this.state.maxPrepTime,
        selectedDiet: this.state.selectedDiet,
        minCalories: this.state.minCalories ? parseInt(this.state.minCalories) : null,
        maxCalories: this.state.maxCalories ? parseInt(this.state.maxCalories) : null,
        selectedAllergens: Object.keys(this.state.selectedAllergens).filter(
          allergen => this.state.selectedAllergens[allergen]
        )
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
                <div className="absolute w-72 bg-white border border-gray-300 mt-1 rounded-lg shadow-lg p-3 max-h-48 overflow-y-auto">
                  {allergenOptions.map(allergen => (
                    <div key={allergen} className="flex items-center space-x-2 py-1">
                      <input 
                        type="checkbox" 
                        id={allergen} 
                        checked={selectedAllergens[allergen]}
                        onChange={() => this.handleAllergenToggle(allergen)}
                        className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <label htmlFor={allergen} className="text-sm text-gray-700 cursor-pointer">
                        {allergen}
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
                  <option key={diet} value={diet}>{diet}</option>
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
                max="120"
                step="5"
                placeholder="30"
                value={maxPrepTime}
                onChange={this.handlePrepTimeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-800 mb-3" 
              />
              <input 
                type="range"
                min="5"
                max="120"
                step="5"
                value={maxPrepTime}
                onChange={this.handlePrepTimeChange}
                className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer" 
              />
            </div>
            
            {/* Filter Button (pushes the Logout Button to the bottom) */}
            <button 
              onClick={this.handleFilterClick}
              className="w-full bg-green-500 text-white font-medium py-2 rounded-lg hover:bg-green-600 transition-colors mb-auto"
            >
              Filter
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