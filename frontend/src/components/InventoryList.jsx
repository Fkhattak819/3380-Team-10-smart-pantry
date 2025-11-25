import React, { Component } from 'react';
import { PantryService } from '../services/PantryService.js';
import { apiFetch } from '../services/api.js';

// Inventory list component
class InventoryList extends Component {
  constructor(props) {
    super(props);
    this.pantryService = new PantryService();
    
    this.state = {
      items: [],
      newItem: { name: '', expiryDate: '', quantity: 1 },
      searchQuery: '',
      filterStatus: 'all'
    };

    this.loadPantryData();
  }

  async loadPantryData() {
    try {
      // Fetch pantry from Flask backend
      const userId = 1; // Default user ID - you can make this dynamic later
      const response = await apiFetch(`/pantry?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const pantryData = await response.json();
      
      this.pantryService.clearAll();
      
      // Transform API response to match PantryItem format
      pantryData.forEach(item => {
        // Use ExpiryDate from API if available, otherwise use default (7 days from now)
        const expiryDate = item.ExpiryDate || item.expiryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        // Convert to Date object for PantryItem
        const expiryDateObj = new Date(expiryDate);
        this.pantryService.addItem(item.Name, expiryDateObj, item.Quantity || item.qty || 1);
      });
      
      this.updateItemsList();
    } catch (error) {
      console.error('Error loading pantry data:', error);
      this.initializeSampleData();
    }
  }

  initializeSampleData() {
    // Fallback: Show empty state if API fails
    this.setState({ items: [] });
  }

  updateItemsList() {
    this.setState({ items: this.pantryService.items });
  }

  handleInputChange = (field, value) => {
    this.setState(prevState => ({
      newItem: { ...prevState.newItem, [field]: value }
    }));
  };

  handleAddItem = async (e) => {
    e.preventDefault();
    const { name, expiryDate, quantity } = this.state.newItem;
    const userId = 1; // Default user ID - make dynamic later
    
    // Validate input
    if (!name || !name.trim()) {
      alert('Please enter an item name');
      return;
    }
    
    if (!expiryDate) {
      alert('Please select an expiry date');
      return;
    }
    
    try {
      // Normalize ingredient name (lowercase, replace spaces with underscores)
      const ingredientName = name.toLowerCase().trim().replace(/\s+/g, '_');
      
      // Prepare JSON payload
      const payload = {
        userId: userId,
        ingredientName: ingredientName,
        quantity: parseFloat(quantity) || 1,
        expiryDate: expiryDate || null
      };
      
      console.log('Sending payload:', payload);
      
      // Call Flask API to add item
      const response = await apiFetch('/pantry/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to add item');
      }

      // Reload pantry data from API
      await this.loadPantryData();
      
      this.setState({
        newItem: { name: '', expiryDate: '', quantity: 1 }
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
      const response = await apiFetch(`/pantry?userId=${userId}&ingredientName=${encodeURIComponent(ingredientName)}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove item');
      }

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

  handleFilterChange = (status) => {
    this.setState({ filterStatus: status });
  };

  getFilteredItems() {
    let items = this.state.items;

    if (this.state.searchQuery) {
      items = this.pantryService.searchItems(this.state.searchQuery);
    }

    if (this.state.filterStatus !== 'all') {
      items = items.filter(item => item.getStatus() === this.state.filterStatus);
    }

    return items;
  }

  getItemStatusClass(item) {
    const status = item.getStatus();
    switch (status) {
      case 'expired':
        return 'border-red-300 bg-red-50';
      case 'expiring-soon':
        return 'border-green-300 bg-green-50';
      case 'fresh':
        return 'border-green-300 bg-green-50';
      default:
        return 'border-gray-300 bg-white';
    }
  }

  getItemStatusText(item) {
    const status = item.getStatus();
    switch (status) {
      case 'expired':
        return 'Expired';
      case 'expiring-soon':
        return 'Expiring Soon';
      case 'fresh':
        return 'Fresh';
      default:
        return 'Unknown';
    }
  }

  getFilterCounts() {
    const all = this.state.items.length;
    const expired = this.state.items.filter(item => item.getStatus() === 'expired').length;
    const expiringSoon = this.state.items.filter(item => item.getStatus() === 'expiring-soon').length;
    const fresh = this.state.items.filter(item => item.getStatus() === 'fresh').length;
    return { all, expired, expiringSoon, fresh };
  }

  getFilterClass(status) {
    const baseClass = "flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors";
    const isActive = this.state.filterStatus === status;
    
    if (isActive) {
      return `${baseClass} bg-gray-800 text-white`;
    }
    return `${baseClass} text-gray-600 hover:text-gray-800 hover:bg-gray-100`;
  }  

  render() {
    const filteredItems = this.getFilteredItems();
    const filterCounts = this.getFilterCounts();

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
        
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => this.handleFilterChange('all')}
            className={this.getFilterClass('all')}
          >
            <span>All ({filterCounts.all})</span>
          </button>
          <button
            onClick={() => this.handleFilterChange('expiring-soon')}
            className={this.getFilterClass('expiring-soon')}
          >
            <span>Expiring Soon ({filterCounts.expiringSoon})</span>
          </button>
        </div>

        <form onSubmit={this.handleAddItem} className="mb-6">
          <h3 className="text-lg font-medium mb-3">Add New Item</h3>
          <div className="flex gap-3 items-end">
            <input
              type="text"
              placeholder="Item name"
              value={this.state.newItem.name}
              onChange={(e) => this.handleInputChange('name', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="date"
              value={this.state.newItem.expiryDate}
              onChange={(e) => this.handleInputChange('expiryDate', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="number"
              placeholder="Quantity"
              value={this.state.newItem.quantity}
              onChange={(e) => this.handleInputChange('quantity', parseInt(e.target.value) || 1)}
              className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              min="1"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Add Item
            </button>
          </div>
        </form>

        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No items found</p>
          ) : (
            filteredItems.map(item => (
              <div 
                key={item.id} 
                className={`flex items-center justify-between p-4 border border-gray-300 rounded-lg ${this.getItemStatusClass(item)}`} 
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-800">{item.name}</h4>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">
                        {this.getItemStatusText(item)}
                      </span>
                  </div>               
                  <p className="text-sm text-gray-600">
                    Expires: {item.expiryDate.toLocaleDateString()} | 
                    Quantity: {item.quantity}
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
