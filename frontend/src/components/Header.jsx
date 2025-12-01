import React, { Component } from 'react';

class Header extends Component {
  render() {
    const { isSettingsOpen, toggleSettings, cartCount, onOpenCart } = this.props;

    const menuClass = `w-8 h-8 text-slate-600 hover:text-emerald-600 cursor-pointer transition-colors`;

    return (
      <header className="bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {/* Brand */}
            <div className="flex items-center space-x-2">
              <div className="h-9 w-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold text-xl">
                SP
              </div>
              <div>
                <h1 className="text-2xl font-bold text-emerald-600 leading-tight">
                  SmartPantry
                </h1>
                <p className="text-xs text-slate-500">
                  Your intelligent meal planning companion
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              {/* Cart */}
              <button 
                onClick={onOpenCart}
                className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm"
              >
                Cart
                <span className="ml-2 inline-flex items-center justify-center min-w-[1.5rem] px-1.5 py-0.5 rounded-full bg-white text-emerald-600 text-xs font-semibold">
                  {cartCount || 0}
                </span>
              </button>

              {/* Settings */}
              <button
                onClick={toggleSettings}
                className="p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                aria-label="Open settings"
              >
                <svg 
                  className={menuClass} 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 100 100" 
                  fill="currentColor"
                >
                  <rect x="15" y="30" width="70" height="6" rx="3" />
                  <rect x="15" y="48" width="70" height="6" rx="3" />
                  <rect x="15" y="66" width="70" height="6" rx="3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  }
}

export default Header;