// PantryItem represents a single item in the pantry
export class PantryItem {
  constructor(id, name, quantity = 1, unit = '') {
    this._id = id;
    this._name = name;
    this._quantity = quantity;
    this._unit = unit;
    this._dateAdded = new Date();
  }

  get id() {
    return this._id;
  }

  get name() {
    return this._name;
  }

  get quantity() {
    return this._quantity;
  }

  get unit() {
    return this._unit;
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

  // Utility methods
  toJSON() {
    return {
      id: this._id,
      name: this._name,
      quantity: this._quantity,
      unit: this._unit,
      dateAdded: this._dateAdded.toISOString()
    };
  }

  toString() {
    return `${this._name} (${this._quantity} ${this._unit})`;
  }
}
