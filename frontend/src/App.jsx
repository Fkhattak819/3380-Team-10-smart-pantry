import React, { Component } from 'react'
import LoginForm from './components/LoginForm'
import Header from './components/Header'
import Navigation from './components/Navigation'
import RecipeList from './components/RecipeList'
import InventoryList from './components/InventoryList'
import SettingsPanel from './components/SettingsPanel'
import CartModal from './components/CartModal'
import { authService } from './services/authService'

// Main App component
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: authService.getUser(),
      isLoading: true,
      activeTab: 'recipes',
      isOnline: navigator.onLine,
      isSettingsOpen: false,
      // Cart State
      cart: [], 
      isCartOpen: false,
    };
  }

  componentDidMount() {
    const user = authService.getUser();
    this.setState({ user, isLoading: false });
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

    // Use requestAnimationFrame to prevent blocking UI when toggling panels
    if (wasOpen !== isOpen) {
      requestAnimationFrame(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });
    }
  }

  handleLoginSuccess = (user) => {
    authService.setUser(user);
    this.setState({ user });
  };

  handleLogout = () => {
    authService.logout();
    this.setState({ user: null, isSettingsOpen: false });
  };

  handleOnlineStatus = () => {
    this.setState({ isOnline: navigator.onLine });
  };

  handleTabChange = (tab) => {
    // Use requestAnimationFrame to prevent blocking UI during tab switch
    requestAnimationFrame(() => {
      this.setState({ activeTab: tab, isSettingsOpen: false, isCartOpen: false });
    });
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
    // Check if the ingredient already exists before adding it
    const wasAlreadyInCart = this.state.cart.includes(ingredientName);
    
    if (wasAlreadyInCart) {
      return false; // Already in cart, return false
    }
    
    // If unique, add it to the cart
    this.setState(prevState => ({
      cart: [...prevState.cart, ingredientName]
    }));
    
    return true; // Successfully added, return true
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
    try {
      const { user, isLoading, activeTab, isOnline, isSettingsOpen, isCartOpen, cart } = this.state;

      if (isLoading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>
      }

      if (!user) {
        return <LoginForm onLoginSuccess={this.handleLoginSuccess} />
      }

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
            onLogout={this.handleLogout}
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
    } catch (error) {
      console.error('Error in App render:', error);
      return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Something went wrong</h2>
          <p>{error.message}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }
  }
}

export default App