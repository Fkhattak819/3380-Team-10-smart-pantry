import { PantryItem } from '../models/PantryItem.js';

// PantryService manages the pantry inventory
export class PantryService {
  constructor() {
    this._items = new Map();
    this._nextId = 1;
  }

  get items() {
    return Array.from(this._items.values());
  }

  get totalItems() {
    return this._items.size;
  }
  addItem(name, quantity = 1, unit = '') {
    if (!name) {
      throw new Error('Name is required');
    }

    const item = new PantryItem(this._nextId++, name, quantity, unit);
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
