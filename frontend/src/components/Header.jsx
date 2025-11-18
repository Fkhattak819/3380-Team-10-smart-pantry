import React, { Component } from 'react';

// Header component
class Header extends Component {
    constructor(props) {
    super(props);
  }

  render() {
    const { cart = [], onOpenCart } = this.props;

    return (
      <header className="bg-white py-8">
        <div className="container mx-auto relative">
          {/* Cart button in top-right */}
          <div className="absolute right-4 top-4">
            <button
              type="button"
              onClick={onOpenCart}
              className="relative bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              aria-label="Open cart"
            >
              Cart
              <span className="ml-2 inline-flex items-center justify-center text-xs bg-white text-green-700 rounded-full px-2 py-0.5">
                {cart.length}
              </span>
            </button>
          </div>

          {/* Centered title */}
          <div className="flex justify-center mb-2">
            <h1 className="text-4xl font-bold text-green-600">SmartPantry</h1>
          </div>

          {/* Centered subtitle */}
          <p className="text-gray-600 text-lg text-center">Your intelligent meal planning companion</p>
        </div>
      </header>
    );
  }
}

export default Header;