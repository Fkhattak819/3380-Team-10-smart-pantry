import React, { Component } from 'react';

// Header component
class Header extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    // Destructure new cart props: cartCount and onOpenCart
    const { isSettingsOpen, toggleSettings, cartCount, onOpenCart } = this.props;

    const menuClass = `w-10 h-10 text-gray-700 hover:text-green-600 cursor-pointer`;

    return (
      <header className="bg-white py-8 border-b relative">
        <div className="container mx-auto text-center">
          
          {/* Action container: Cart and Settings Menu */}
          <div className="absolute top-1/2 right-4 transform -translate-y-1/2 md:right-10 flex items-center space-x-4">
            
            {/* Cart Button (Styled like View Recipe button) */}
            <button 
              onClick={onOpenCart}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors text-sm font-medium flex items-center"
            >
              Cart 
              <span className="ml-2 px-2 py-0.5 rounded-full bg-white text-green-500 font-bold text-xs">
                {cartCount || 0}
              </span>
            </button>

            {/* Settings Menu Button */}
            <button onClick={toggleSettings} className="p-2 focus:outline-none">
              <svg 
                className={menuClass} 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 100 100" 
                fill="currentColor"
              >
                {/* Hamburger Icon Lines */}
                <rect x="15" y="30" width="70" height="6" rx="3" />
                <rect x="15" y="48" width="70" height="6" rx="3" />
                <rect x="15" y="66" width="70" height="6" rx="3" />
              </svg>
            </button>
          </div>

          <div className="flex items-center justify-center space-x-3 mb-2">
            <h1 className="text-4xl font-bold text-green-600">SmartPantry</h1>
          </div>
          <p className="text-gray-600 text-lg">Your intelligent meal planning companion</p>
        </div>
      </header>
    );
  }
}

export default Header;