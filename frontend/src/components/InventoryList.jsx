import React, { Component } from 'react';
import { PantryService } from '../services/PantryService.js';
import { getPantry, addToPantry, removeFromPantry, searchIngredients } from '../services/api.js';

// Inventory list component
class InventoryList extends Component {
  constructor(props) {
    super(props);
    this.pantryService = new PantryService();
    
    this.state = {
      items: [],
      newItem: { name: '', quantity: 1, unit: '' },
      searchQuery: '',
      isLoading: true,
      error: null,
      ingredientSuggestions: [],
      showSuggestions: false,
      selectedIngredient: null
    };
  }

  componentDidMount() {
    this.loadPantryData();
  }

  async loadPantryData() {
    try {
      this.setState({ isLoading: true, error: null });
      console.log('Loading pantry data...');

      const userId = 1; // Default user ID - you can make this dynamic later
      const pantryData = await getPantry(userId);
      console.log('Received pantry data:', pantryData);
      
      this.pantryService.clearAll();
      
      // Transform API response to match PantryItem format
      if (Array.isArray(pantryData)) {
        pantryData.forEach(item => {
          try {
            // Add item with unit
            this.pantryService.addItem(
              item.Name,
              item.Quantity || item.qty || 1,
              item.Unit || ''
            );
          } catch (itemError) {
            console.error('Error processing item:', item, itemError);
          }
        });
      } else {
        console.warn('Pantry data is not an array:', pantryData);
      }
      
      this.updateItemsList();
      this.setState({ isLoading: false });
      console.log('Pantry data loaded successfully');
    } catch (error) {
      console.error('Error loading pantry data:', error);
      console.error('Error stack:', error.stack);
      this.setState({ 
        items: [], 
        isLoading: false, 
        error: error.message || 'Failed to load pantry data. Make sure backend is running on port 5001.' 
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
          console.error('Error searching ingredients:', error);
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
    const userId = 1; // Default user ID - make dynamic later
    
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
      // Use the exact ingredient name from database (case-sensitive)
      const ingredientName = this.state.selectedIngredient.Name;
      
      console.log('Adding to pantry via API:', {
        userId,
        ingredientName,
        quantity: parseFloat(quantity) || 1,
        unit: unit || this.state.selectedIngredient.DefaultUnit
      });

      // Call Flask API to add item with unit
      await addToPantry(userId, ingredientName, parseFloat(quantity) || 1, unit || this.state.selectedIngredient.DefaultUnit);
      
      // Reload pantry data from API
      await this.loadPantryData();
      
      this.setState({
        newItem: { name: '', quantity: 1, unit: '' },
        selectedIngredient: null,
        showSuggestions: false,
        ingredientSuggestions: []
      });
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Error adding item: ' + error.message);
    }
  };

  handleRemoveItem = async (item) => {
    const userId = 1; // Default user ID - make dynamic later
    const ingredientName = item.name.toLowerCase().replace(/\s+/g, '_');
    
    try {
      // Call Flask API to remove item
      await removeFromPantry(userId, ingredientName);

      // Reload pantry data from API
      await this.loadPantryData();
    } catch (error) {
      console.error('Error removing item:', error);
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
    // Replace underscores with spaces for display
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
                      <div className="font-medium">{ingredient.Name}</div>
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
