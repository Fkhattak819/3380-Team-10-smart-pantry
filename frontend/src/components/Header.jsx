import React, { Component } from 'react';

// Header component
class Header extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { isSettingsOpen, toggleSettings } = this.props;

    const menuClass = `w-10 h-10 text-gray-700 hover:text-green-600 cursor-pointer`;

    return (
      <header className="bg-white py-8 border-b relative">
        <div className="container mx-auto text-center">
          
          <div className="absolute top-1/2 right-4 transform -translate-y-1/2 md:right-10">
            <button onClick={toggleSettings} className="p-2 focus:outline-none">
              <svg 
                className={menuClass} 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 100 100" 
                fill="currentColor"
              >
                {/* Adjusted Y values to decrease the spacing between lines */}
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