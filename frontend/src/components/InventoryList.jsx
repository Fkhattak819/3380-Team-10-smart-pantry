import React, { Component } from 'react';
import { PantryService } from '../services/PantryService.js';

/**
 * InventoryList component class - manages pantry inventory display and operations
 * Follows object-oriented design principles with proper encapsulation
 */
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
      // Load pantry data from JSON file
      const response = await fetch('/pantry.json');
      const pantryData = await response.json();
      
      // Clear existing items
      this.pantryService.clearAll();
      
      // Add items from JSON
      pantryData.forEach(item => {
        this.pantryService.addItem(item.name, item.expiryDate, item.qty);
      });
      
      this.updateItemsList();
    } catch (error) {
      console.error('Error loading pantry data:', error);
      // Fallback to sample data if JSON fails
      this.initializeSampleData();
    }
  }

  initializeSampleData() {
    // Add sample items using the service
    this.pantryService.addItem('Milk', '2024-12-15', 2);
    this.pantryService.addItem('Bread', '2024-12-12', 1);
    this.pantryService.addItem('Eggs', '2024-12-20', 12);
    this.updateItemsList();
  }

  updateItemsList() {
    this.setState({ items: this.pantryService.items });
  }

  handleInputChange = (field, value) => {
    this.setState(prevState => ({
      newItem: { ...prevState.newItem, [field]: value }
    }));
  };

  handleAddItem = (e) => {
    e.preventDefault();
    const { name, expiryDate, quantity } = this.state.newItem;
    
    try {
      this.pantryService.addItem(name, expiryDate, quantity);
      this.setState({
        newItem: { name: '', expiryDate: '', quantity: 1 }
      });
      this.updateItemsList();
    } catch (error) {
      alert('Error adding item: ' + error.message);
    }
  };

  handleRemoveItem = (id) => {
    try {
      this.pantryService.removeItem(id);
      this.updateItemsList();
    } catch (error) {
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

    // Apply search filter
    if (this.state.searchQuery) {
      items = this.pantryService.searchItems(this.state.searchQuery);
    }

    // Apply status filter
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
        return 'border-orange-300 bg-orange-50';
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

  render() {
    const filteredItems = this.getFilteredItems();

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Pantry Inventory</h2>
        
        {/* Search and Filter Controls */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Search items..."
              value={this.state.searchQuery}
              onChange={this.handleSearchChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={this.state.filterStatus}
              onChange={(e) => this.handleFilterChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Items</option>
              <option value="fresh">Fresh</option>
              <option value="expiring-soon">Expiring Soon</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
        
        {/* Add Item Form */}
        <form onSubmit={this.handleAddItem} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium mb-3">Add New Item</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Item name"
              value={this.state.newItem.name}
              onChange={(e) => this.handleInputChange('name', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>
          <button
            type="submit"
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Item
          </button>
        </form>

        {/* Items List */}
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No items found</p>
          ) : (
            filteredItems.map(item => (
              <div 
                key={item.id} 
                className={`flex items-center justify-between p-3 border rounded-lg ${this.getItemStatusClass(item)}`}
              >
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-gray-600">
                    Expires: {item.expiryDate.toLocaleDateString()} | 
                    Quantity: {item.quantity}
                  </p>
                  <p className="text-xs text-gray-500">
                    Status: {this.getItemStatusText(item)}
                  </p>
                </div>
                <button
                  onClick={() => this.handleRemoveItem(item.id)}
                  className="text-red-600 hover:text-red-800 font-medium"
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
