/**
 * PantryItem class represents a single item in the pantry
 * Follows object-oriented design principles
 */
export class PantryItem {
  constructor(id, name, expiryDate, quantity = 1) {
    this._id = id;
    this._name = name;
    this._expiryDate = new Date(expiryDate);
    this._quantity = quantity;
    this._dateAdded = new Date();
  }

  // Getters
  get id() {
    return this._id;
  }

  get name() {
    return this._name;
  }

  get expiryDate() {
    return this._expiryDate;
  }

  get quantity() {
    return this._quantity;
  }

  get dateAdded() {
    return this._dateAdded;
  }

  // Setters
  set name(newName) {
    if (typeof newName === 'string' && newName.trim().length > 0) {
      this._name = newName.trim();
    } else {
      throw new Error('Name must be a non-empty string');
    }
  }

  set quantity(newQuantity) {
    if (Number.isInteger(newQuantity) && newQuantity > 0) {
      this._quantity = newQuantity;
    } else {
      throw new Error('Quantity must be a positive integer');
    }
  }

  set expiryDate(newDate) {
    const date = new Date(newDate);
    if (date instanceof Date && !isNaN(date)) {
      this._expiryDate = date;
    } else {
      throw new Error('Expiry date must be a valid date');
    }
  }

  // Business logic methods
  isExpired() {
    return this._expiryDate < new Date();
  }

  isExpiringSoon(days = 3) {
    const today = new Date();
    const expiryDate = new Date(this._expiryDate);
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days && diffDays >= 0;
  }

  getDaysUntilExpiry() {
    const today = new Date();
    const expiryDate = new Date(this._expiryDate);
    const diffTime = expiryDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getStatus() {
    if (this.isExpired()) {
      return 'expired';
    } else if (this.isExpiringSoon()) {
      return 'expiring-soon';
    } else {
      return 'fresh';
    }
  }

  // Utility methods
  toJSON() {
    return {
      id: this._id,
      name: this._name,
      expiryDate: this._expiryDate.toISOString().split('T')[0],
      quantity: this._quantity,
      dateAdded: this._dateAdded.toISOString(),
      status: this.getStatus()
    };
  }

  toString() {
    return `${this._name} (${this._quantity}) - Expires: ${this._expiryDate.toLocaleDateString()}`;
  }
}
