import React, { Component } from 'react'
import Header from './components/Header'
import Navigation from './components/Navigation'
import RecipeList from './components/RecipeList'
import InventoryList from './components/InventoryList'
import SettingsPanel from './components/SettingsPanel'
import CartModal from './components/CartModal' // Import the cart modal

// Main App component
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'recipes',
      isOnline: navigator.onLine,
      isSettingsOpen: false,
      // Cart State
      cart: [], 
      isCartOpen: false,
    };
  }

  componentDidMount() {
    window.addEventListener('online', this.handleOnlineStatus);
    window.addEventListener('offline', this.handleOnlineStatus);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnlineStatus);
    window.removeEventListener('offline', this.handleOnlineStatus);
  }

  // NEW: Lifecycle method to control body scrolling
  componentDidUpdate(prevProps, prevState) {
    const wasOpen = prevState.isSettingsOpen || prevState.isCartOpen;
    const isOpen = this.state.isSettingsOpen || this.state.isCartOpen;

    if (wasOpen !== isOpen) {
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }
  }

  handleOnlineStatus = () => {
    this.setState({ isOnline: navigator.onLine });
  };

  handleTabChange = (tab) => {
    this.setState({ activeTab: tab, isSettingsOpen: false, isCartOpen: false });
  };

  toggleSettings = () => {
    this.setState(prevState => ({ 
      isSettingsOpen: !prevState.isSettingsOpen,
      isCartOpen: false, // Close cart if settings open
    }));
  };
  
  // Cart Handlers
  handleOpenCart = () => {
    this.setState({ isCartOpen: true, isSettingsOpen: false });
  };

  handleCloseCart = () => {
    this.setState({ isCartOpen: false });
  };
  
  handleAddToCart = (ingredientName) => {
    // FIX: Check if the ingredient already exists before adding it
    this.setState(prevState => {
      if (prevState.cart.includes(ingredientName)) {
        return null; // Return null to prevent the state update
      }
      
      // If unique, add it to the cart
      return {
        cart: [...prevState.cart, ingredientName]
      };
    });
  };

  handleRemoveCartItem = (ingredientName) => {
    // Removes the first occurrence of the ingredient name from the cart
    this.setState(prevState => ({
      cart: prevState.cart.filter((item, index) => {
        // Find the index of the first item matching ingredientName
        const itemIndexToRemove = prevState.cart.findIndex(i => i === ingredientName);
        // Only return true (keep the item) if the current index is NOT the index to remove
        return index !== itemIndexToRemove;
      })
    }));
  };

  handleClearCart = () => {
    this.setState({ cart: [] });
  };

  renderContent() {
    // Pass the handler down to RecipeList
    switch (this.state.activeTab) {
      case 'recipes':
        return <RecipeList onAddToCart={this.handleAddToCart} />;
      case 'pantry':
        return <InventoryList />;
      default:
        return <RecipeList onAddToCart={this.handleAddToCart} />;
    }
  }

  render() {
    const { activeTab, isOnline, isSettingsOpen, isCartOpen, cart } = this.state;

    return (
      <div className="App min-h-screen bg-gray-100">
        <Header 
          isSettingsOpen={isSettingsOpen} 
          toggleSettings={this.toggleSettings}
          // Pass cart state and handlers to Header
          cartCount={cart.length}
          onOpenCart={this.handleOpenCart}
        />
        <div className="container mx-auto px-4 py-8">
          <Navigation 
            activeTab={activeTab}
            onTabChange={this.handleTabChange}
          />
          {this.renderContent()}
        </div>
        
        <SettingsPanel 
          isOpen={isSettingsOpen} 
          onClose={this.toggleSettings} 
        />
        
        {/* Render the Cart Modal */}
        <CartModal
          isOpen={isCartOpen}
          cart={cart}
          onClose={this.handleCloseCart}
          onRemoveItem={this.handleRemoveCartItem}
          onClearCart={this.handleClearCart}
        />
        
        {!isOnline && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
            Warning: You're offline
          </div>
        )}
      </div>
    );
  }
}

export default App