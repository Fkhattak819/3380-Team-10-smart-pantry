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
            Warning: You're offline
          </div>
        )}
      </div>
    );
  }
}

export default App
