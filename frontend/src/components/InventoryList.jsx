import React, { Component } from 'react';
import { PantryService } from '../services/PantryService.js';
import { getPantry, addToPantry, removeFromPantry, searchIngredients } from '../services/api.js';

// Component that displays and manages the user's pantry inventory
// Uses PantryService to manage the list of items
class InventoryList extends Component {
  constructor(props) {
    super(props);
    // Create a PantryService instance to manage pantry items
    this.pantryService = new PantryService();
    
    this.state = {
      items: [], // List of pantry items to display
      newItem: { name: '', quantity: 1, unit: '' }, // Form state for adding new items
      searchQuery: '', // Search filter for items
      isLoading: true, // Loading state
      error: null, // Error message if something goes wrong
      ingredientSuggestions: [], // Autocomplete suggestions from API
      showSuggestions: false, // Whether to show the suggestions dropdown
      selectedIngredient: null // Currently selected ingredient from suggestions
    };
  }

  // Load pantry data when component first mounts
  componentDidMount() {
    if (this.props.userId) {
      this.loadPantryData();
    }
  }

  // Reload pantry if userId becomes available after mount
  componentDidUpdate(prevProps) {
    if (!prevProps.userId && this.props.userId) {
      this.loadPantryData();
    }
  }

  // Load pantry from API
  // Retry if database error (user might still be initializing)
  async loadPantryData(retryCount = 0) {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000;
    
    try {
      this.setState({ isLoading: true, error: null });

      const userId = this.props.userId;
      if (!userId) {
        this.setState({ isLoading: false, error: 'User not authenticated' });
        return;
      }
      
      let pantryData;
      try {
        pantryData = await getPantry(userId);
      } catch (apiError) {
        if (apiError.message && (apiError.message.includes('404') || apiError.message.includes('not found'))) {
          // New user, no pantry yet
          pantryData = [];
        } else if (retryCount < MAX_RETRIES && (apiError.message.includes('500') || apiError.message.includes('Database'))) {
          // Database error, retry
          setTimeout(() => {
            this.loadPantryData(retryCount + 1);
          }, RETRY_DELAY);
          return;
        } else {
          throw apiError;
        }
      }
      
      this.pantryService.clearAll();
      
      // Convert API data to pantry items
      if (Array.isArray(pantryData)) {
        pantryData.forEach(item => {
          try {
            this.pantryService.addItem(
              item.Name,
              item.Quantity || item.qty || 1,
              item.Unit || ''
            );
          } catch (itemError) {
            // Skip bad items
          }
        });
      } else if (pantryData === null || pantryData === undefined) {
        pantryData = [];
      } else {
        pantryData = [];
      }
      
      this.updateItemsList();
      this.setState({ isLoading: false, error: null });
    } catch (error) {
      this.setState({ 
        items: [], 
        isLoading: false, 
        error: error.message || 'Failed to load pantry data. Make sure the backend is accessible.' 
      });
    }
  }

  updateItemsList() {
    this.setState({ items: this.pantryService.items });
  }

  handleInputChange = async (field, value) => {
    if (field === 'name') {
      // Search for ingredients as user types
      this.setState(prevState => ({
        newItem: { ...prevState.newItem, [field]: value },
        selectedIngredient: null,
        unit: ''
      }));
      
      if (value && value.length >= 2) {
        try {
          const suggestions = await searchIngredients(value);
          this.setState({
            ingredientSuggestions: suggestions || [],
            showSuggestions: true
          });
        } catch (error) {
          this.setState({ ingredientSuggestions: [], showSuggestions: false });
        }
      } else {
        this.setState({ ingredientSuggestions: [], showSuggestions: false });
      }
    } else {
    this.setState(prevState => ({
      newItem: { ...prevState.newItem, [field]: value }
    }));
    }
  };

  handleSelectIngredient = (ingredient) => {
    this.setState({
      newItem: {
        ...this.state.newItem,
        name: ingredient.Name,
        unit: ingredient.DefaultUnit || ''
      },
      selectedIngredient: ingredient,
      showSuggestions: false,
      ingredientSuggestions: []
    });
  };

  handleAddItem = async (e) => {
    e.preventDefault();
    const { name, quantity, unit } = this.state.newItem;
    const userId = this.props.userId;
    
    if (!userId) {
      alert('User not authenticated');
      return;
    }
    
    // Validate input
    if (!name || !name.trim()) {
      alert('Please enter an item name');
      return;
    }
    
    // Validate that ingredient exists (must be selected from suggestions)
    if (!this.state.selectedIngredient) {
      alert('Please select an ingredient from the suggestions list');
      return;
    }
    
    try {
      const ingredientName = this.state.selectedIngredient.Name;
      
      await addToPantry(userId, ingredientName, parseFloat(quantity) || 1, unit || this.state.selectedIngredient.DefaultUnit);

      await this.loadPantryData();
      
      this.setState({
        newItem: { name: '', quantity: 1, unit: '' },
        selectedIngredient: null,
        showSuggestions: false,
        ingredientSuggestions: []
      });
    } catch (error) {
      alert('Error adding item: ' + error.message);
    }
  };

  handleRemoveItem = async (item) => {
    const userId = this.props.userId;
    if (!userId) {
      alert('User not authenticated');
      return;
    }
    const ingredientName = item.name.toLowerCase().replace(/\s+/g, '_');
    
    try {
      await removeFromPantry(userId, ingredientName);

      await this.loadPantryData();
    } catch (error) {
      alert('Error removing item: ' + error.message);
    }
  };

  handleSearchChange = (e) => {
    const query = e.target.value;
    this.setState({ searchQuery: query });
  };

  getFilteredItems() {
    let items = this.state.items;

    if (this.state.searchQuery) {
      items = this.pantryService.searchItems(this.state.searchQuery);
    }

    return items;
  }

  formatDisplayName(name) {
    return name.replace(/_/g, ' ');
  }  

  render() {
    const { isLoading, error } = this.state;
    
    if (isLoading) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Pantry Inventory</h2>
          <div className="text-center py-8">
            <p className="text-gray-500">Loading pantry items...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Pantry Inventory</h2>
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">Error: {error}</p>
            <button 
              onClick={() => this.loadPantryData()} 
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    const filteredItems = this.getFilteredItems();

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Pantry Inventory</h2>
        
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search items..."
            value={this.state.searchQuery}
            onChange={this.handleSearchChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"          
          />
        </div>

        <form onSubmit={this.handleAddItem} className="mb-6">
          <h3 className="text-lg font-medium mb-3">Add New Item</h3>
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
            <input
              type="text"
                placeholder="Item name (type to search)"
              value={this.state.newItem.name}
              onChange={(e) => this.handleInputChange('name', e.target.value)}
                onBlur={() => setTimeout(() => this.setState({ showSuggestions: false }), 200)}
                onFocus={() => {
                  if (this.state.newItem.name && this.state.ingredientSuggestions.length > 0) {
                    this.setState({ showSuggestions: true });
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  this.state.selectedIngredient ? 'border-green-500' : 'border-gray-300'
                }`}
              required
            />
              {this.state.showSuggestions && this.state.ingredientSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {this.state.ingredientSuggestions.map((ingredient, index) => (
                    <div
                      key={index}
                      onClick={() => this.handleSelectIngredient(ingredient)}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                    >
                      <div className="font-medium">{this.formatDisplayName(ingredient.Name)}</div>
                      <div className="text-sm text-gray-500">Unit: {ingredient.DefaultUnit || 'N/A'}</div>
                    </div>
                  ))}
                </div>
              )}
              {this.state.newItem.name && !this.state.selectedIngredient && this.state.ingredientSuggestions.length === 0 && this.state.newItem.name.length >= 2 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-red-300 rounded-md shadow-lg p-3">
                  <p className="text-red-600 text-sm">No matching ingredient found. Please select from suggestions.</p>
                </div>
              )}
            </div>
            <input
              type="number"
              placeholder="Quantity"
              value={this.state.newItem.quantity}
              onChange={(e) => this.handleInputChange('quantity', parseInt(e.target.value) || 1)}
              className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              min="1"
            />
            <select
              value={this.state.newItem.unit}
              onChange={(e) => this.handleInputChange('unit', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              disabled={!this.state.selectedIngredient}
              required
            >
              <option value="">Unit</option>
              {this.state.selectedIngredient && (
                <option value={this.state.selectedIngredient.DefaultUnit}>
                  {this.state.selectedIngredient.DefaultUnit}
                </option>
              )}
            </select>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={!this.state.selectedIngredient}
            >
              Add Item
            </button>
          </div>
          {!this.state.selectedIngredient && this.state.newItem.name && (
            <p className="text-sm text-red-500 mt-2">Please select an ingredient from the suggestions above</p>
          )}
        </form>

        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No items found</p>
          ) : (
            filteredItems.map(item => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-4 border border-gray-300 rounded-lg bg-white"
              >
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">{this.formatDisplayName(item.name)}</h4>
                  <p className="text-sm text-gray-600">
                    Quantity: {item.quantity} {item.unit || ''}
                  </p>
                </div>
                <button
                  onClick={() => this.handleRemoveItem(item)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }
}

export default InventoryList;
