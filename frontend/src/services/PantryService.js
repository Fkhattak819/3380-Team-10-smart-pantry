import { PantryItem } from '../models/PantryItem.js';

/**
 * PantryService class manages the pantry inventory
 * Follows object-oriented design with proper encapsulation
 */
export class PantryService {
  constructor() {
    this._items = new Map();
    this._nextId = 1;
  }

  // Getters
  get items() {
    return Array.from(this._items.values());
  }

  get totalItems() {
    return this._items.size;
  }

  get expiredItems() {
    return this.items.filter(item => item.isExpired());
  }

  get expiringSoonItems() {
    return this.items.filter(item => item.isExpiringSoon());
  }

  get freshItems() {
    return this.items.filter(item => item.getStatus() === 'fresh');
  }

  // Core business methods
  addItem(name, expiryDate, quantity = 1) {
    if (!name || !expiryDate) {
      throw new Error('Name and expiry date are required');
    }

    const item = new PantryItem(this._nextId++, name, expiryDate, quantity);
    this._items.set(item.id, item);
    return item;
  }

  removeItem(id) {
    if (!this._items.has(id)) {
      throw new Error('Item not found');
    }
    return this._items.delete(id);
  }

  updateItem(id, updates) {
    const item = this._items.get(id);
    if (!item) {
      throw new Error('Item not found');
    }

    if (updates.name !== undefined) {
      item.name = updates.name;
    }
    if (updates.quantity !== undefined) {
      item.quantity = updates.quantity;
    }
    if (updates.expiryDate !== undefined) {
      item.expiryDate = updates.expiryDate;
    }

    return item;
  }

  getItem(id) {
    return this._items.get(id);
  }

  // Search and filter methods
  searchItems(query) {
    const lowerQuery = query.toLowerCase();
    return this.items.filter(item => 
      item.name.toLowerCase().includes(lowerQuery)
    );
  }

  getItemsByStatus(status) {
    return this.items.filter(item => item.getStatus() === status);
  }

  getItemsExpiringInDays(days) {
    return this.items.filter(item => {
      const daysUntilExpiry = item.getDaysUntilExpiry();
      return daysUntilExpiry <= days && daysUntilExpiry >= 0;
    });
  }

  // Statistics methods
  getStatistics() {
    const total = this.totalItems;
    const expired = this.expiredItems.length;
    const expiringSoon = this.expiringSoonItems.length;
    const fresh = this.freshItems.length;

    return {
      total,
      expired,
      expiringSoon,
      fresh,
      percentages: {
        expired: total > 0 ? Math.round((expired / total) * 100) : 0,
        expiringSoon: total > 0 ? Math.round((expiringSoon / total) * 100) : 0,
        fresh: total > 0 ? Math.round((fresh / total) * 100) : 0
      }
    };
  }

  // Data persistence methods
  exportToJSON() {
    return JSON.stringify(this.items.map(item => item.toJSON()), null, 2);
  }

  importFromJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      this._items.clear();
      this._nextId = 1;

      data.forEach(itemData => {
        const item = new PantryItem(
          this._nextId++,
          itemData.name,
          itemData.expiryDate,
          itemData.quantity
        );
        this._items.set(item.id, item);
      });
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  }

  // Utility methods
  clearAll() {
    this._items.clear();
    this._nextId = 1;
  }

  getItemCount() {
    return this._items.size;
  }

  isEmpty() {
    return this._items.size === 0;
  }
}
