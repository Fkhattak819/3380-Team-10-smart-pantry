import React, { Component } from 'react';

// Header component
class Header extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <header className="bg-white py-8">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <h1 className="text-4xl font-bold text-orange-500">SmartPantry</h1>
          </div>
          <p className="text-gray-600 text-lg">Your intelligent meal planning companion</p>
        </div>
      </header>
    );
  }
}

export default Header;
