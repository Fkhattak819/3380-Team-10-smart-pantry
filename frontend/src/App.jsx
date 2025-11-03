import React, { Component } from 'react'
import Header from './components/Header'
import Navigation from './components/Navigation'
import RecipeList from './components/RecipeList'
import InventoryList from './components/InventoryList'
import CartModal from './components/CartModal';

// Main App component
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'recipes',
      isOnline: navigator.onLine,
      cart: [],
      isCartOpen: false,
    };
  }

  openCart = () => {
    this.setState({ isCartOpen: true });
  };
  closeCart = () => {
    this.setState({ isCartOpen: false });
  };

  componentDidMount() {
    window.addEventListener('online', this.handleOnlineStatus);
    window.addEventListener('offline', this.handleOnlineStatus);

    const raw = localStorage.getItem('cart');
    if (raw) {
      this.setState({ cart: JSON.parse(raw) });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnlineStatus);
    window.removeEventListener('offline', this.handleOnlineStatus);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.cart !== this.state.cart) {
      localStorage.setItem('cart', JSON.stringify(this.state.cart));
    }
  }

  handleOnlineStatus = () => {
    this.setState({ isOnline: navigator.onLine });
  };

  handleTabChange = (tab) => {
    this.setState({ activeTab: tab });
  };

  addToCart = (ingredientName) => {
    if (!ingredientName) return;
    this.setState((prevState) => {
      if (!prevState.cart.includes(ingredientName)) {
        return {
          cart: [...prevState.cart, ingredientName]
        };
      }
      return null;
    });
  }

  removeFromCart = (ingredientName) => {
    this.setState((prevState) => ({
      cart: prevState.cart.filter(item => item !== ingredientName)
    }));
  };

  clearCart = () => {
    this.setState({ cart: [] });
  };

  renderContent() {
    switch (this.state.activeTab) {
      case 'recipes':
        return <RecipeList onAddToCart={this.addToCart} />;
      case 'pantry':
        return <InventoryList />;
      default:
        return <RecipeList onAddToCart={this.addToCart} />;
    }
  }

  render() {
    return (
      <div className="App min-h-screen bg-gray-100">
        <Header 
          cart={this.state.cart} 
          onClearCart={this.clearCart}
          onOpenCart={this.openCart}
        />
        <div className="container mx-auto px-4 py-8">
          <Navigation 
            activeTab={this.state.activeTab}
            onTabChange={this.handleTabChange}
          />
          {this.renderContent()}
        </div>
        <CartModal
          isOpen={this.state.isCartOpen}
          cart={this.state.cart}
          onClose={this.closeCart}
          onClearCart={this.clearCart}
          onRemoveItem={this.removeFromCart}
        />

        {!this.state.isOnline && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
            Warning: You're offline
          </div>
        )}
      </div>
    );
  }
}

export default App