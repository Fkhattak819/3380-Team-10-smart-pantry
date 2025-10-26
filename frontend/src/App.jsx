import React, { Component } from 'react'
import Header from './components/Header'
import Navigation from './components/Navigation'
import RecipeList from './components/RecipeList'
import InventoryList from './components/InventoryList'

/**
 * Main App component class - root component of the SmartPantry application
 * Follows object-oriented design principles with proper component lifecycle
 */
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'recipes',
      appVersion: '1.0.0',
      isOnline: navigator.onLine,
      lastUpdated: new Date()
    };
  }

  componentDidMount() {
    // Listen for online/offline status
    window.addEventListener('online', this.handleOnlineStatus);
    window.addEventListener('offline', this.handleOnlineStatus);
    
    // Update last updated time every minute
    this.updateTimer = setInterval(() => {
      this.setState({ lastUpdated: new Date() });
    }, 60000);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnlineStatus);
    window.removeEventListener('offline', this.handleOnlineStatus);
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
  }

  handleOnlineStatus = () => {
    this.setState({ isOnline: navigator.onLine });
  };

  handleTabChange = (tab) => {
    this.setState({ activeTab: tab });
  };

  renderContent() {
    switch (this.state.activeTab) {
      case 'recipes':
        return <RecipeList />;
      case 'pantry':
        return <InventoryList />;
      case 'shopping':
        return (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Shopping List</h2>
            <p className="text-gray-600">Shopping functionality coming soon!</p>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <p className="text-gray-600">Settings functionality coming soon!</p>
          </div>
        );
      default:
        return <RecipeList />;
    }
  }

  render() {
    return (
      <div className="App min-h-screen bg-gray-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Navigation 
            activeTab={this.state.activeTab}
            onTabChange={this.handleTabChange}
          />
          {this.renderContent()}
        </div>
        {!this.state.isOnline && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
            ⚠️ You're offline
          </div>
        )}
      </div>
    );
  }
}

export default App
