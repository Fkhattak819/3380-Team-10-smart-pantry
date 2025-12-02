import React, { Component } from 'react'
import LoginForm from './components/LoginForm'
import Header from './components/Header'
import Navigation from './components/Navigation'
import RecipeList from './components/RecipeList'
import InventoryList from './components/InventoryList'
import SettingsPanel from './components/SettingsPanel'
import CartModal from './components/CartModal'
import { authService } from './services/authService'

// Main App component - manages global state
// Handles auth, tabs, cart, filters
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: authService.getUser(), // Get user from localStorage if logged in
      isLoading: true,
      activeTab: 'recipes', // recipes or pantry tab
      isOnline: navigator.onLine,
      isSettingsOpen: false,
      cart: [], // Shopping cart for missing ingredients
      isCartOpen: false,
      recipeFilters: {
        maxPrepTime: 300,
        selectedDiet: '',
        minCalories: null,
        maxCalories: null,
        selectedAllergens: []
      }
    };
  }

  // Check if user logged in when component mounts
  componentDidMount() {
    const user = authService.getUser();
    this.setState({ user, isLoading: false });
    window.addEventListener('online', this.handleOnlineStatus);
    window.addEventListener('offline', this.handleOnlineStatus);
  }

  // Remove event listeners on unmount
  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnlineStatus);
    window.removeEventListener('offline', this.handleOnlineStatus);
  }

  // Stop body scroll when modals open
  componentDidUpdate(prevProps, prevState) {
    const wasOpen = prevState.isSettingsOpen || prevState.isCartOpen;
    const isOpen = this.state.isSettingsOpen || this.state.isCartOpen;

    if (wasOpen !== isOpen) {
      requestAnimationFrame(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });
    }
  }

  // Save user when login succeeds
  handleLoginSuccess = (user) => {
    authService.setUser(user);
    this.setState({ user });
  };

  // Logout - clear user from localStorage and state
  handleLogout = () => {
    authService.logout();
    this.setState({ user: null, isSettingsOpen: false });
  };

  // Update online status
  handleOnlineStatus = () => {
    this.setState({ isOnline: navigator.onLine });
  };

  // Switch tabs and close modals
  handleTabChange = (tab) => {
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
  
  // Add ingredient to cart
  // Return true if added, false if already there
  handleAddToCart = (ingredientName) => {
    const wasAlreadyInCart = this.state.cart.includes(ingredientName);
    
    if (wasAlreadyInCart) {
      return false;
    }
    
    this.setState(prevState => ({
      cart: [...prevState.cart, ingredientName]
    }));
    
    return true;
  };

  handleRemoveCartItem = (ingredientName) => {
    this.setState(prevState => ({
      cart: prevState.cart.filter((item, index) => {
        const itemIndexToRemove = prevState.cart.findIndex(i => i === ingredientName);
        return index !== itemIndexToRemove;
      })
    }));
  };

  handleClearCart = () => {
    this.setState({ cart: [] });
  };

  handleFilterChange = (filters) => {
    this.setState({ recipeFilters: filters });
  };

  renderContent() {
    const userId = this.state.user?.userId;
    // Pass the handler down to RecipeList
    switch (this.state.activeTab) {
      case 'recipes':
        return <RecipeList onAddToCart={this.handleAddToCart} userId={userId} filters={this.state.recipeFilters} />;
      case 'pantry':
        return <InventoryList userId={userId} />;
      default:
        return <RecipeList onAddToCart={this.handleAddToCart} userId={userId} filters={this.state.recipeFilters} />;
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
            userId={this.state.user?.userId}
            onFilterChange={this.handleFilterChange}
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