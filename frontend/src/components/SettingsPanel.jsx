import React, { Component } from 'react';

const dietOptions = [
  'vegetarian', 'vegan', 'keto', 'paleo', 
  'low carb', 'raw', 'no sugar'
];

class SettingsPanel extends Component {
  constructor(props) {
    super(props);
    // Initialize state for the budget input/slider
    this.state = {
      maxBudget: 25 // Default placeholder value
    };
  }

  handleBudgetChange = (e) => {
    // This handler works for both number input (type='number') and slider (type='range').
    // It updates the state with the new value.
    const value = parseInt(e.target.value);
    this.setState({ maxBudget: value >= 0 ? value : 0 });
  };

  render() {
    const { isOpen, onClose } = this.props;
    const { maxBudget } = this.state; // Destructure maxBudget from state

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
            </h2>

            {/* Filter Dropdown 1: Food Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Food Type
              </label>
              <select 
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
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-800"
                    />
                  </label>
                  <label className="flex-1">
                    <span className="block text-xs text-gray-500 mb-1">Max (cal):</span>
                    <input 
                      type="number"
                      placeholder="800"
                      className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-800"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Max Budget: Input Field (Precise) and Slider (Quick) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="max-budget-input">
                Max Budget ($)
              </label>
              <input 
                id="max-budget-input"
                type="number"
                min="0"
                placeholder="50"
                value={maxBudget} // Bound to state
                onChange={this.handleBudgetChange} // Controls state
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-800 mb-3" 
              />
              <input 
                type="range"
                min="0"
                max="500" // Set a suitable max range for the slider
                step="1" // Allows for smooth dragging
                value={maxBudget} // Bound to state
                onChange={this.handleBudgetChange} // Controls state
                className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer" 
              />
            </div>
            
            {/* Filter Button (pushes the Logout Button to the bottom) */}
            <button 
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