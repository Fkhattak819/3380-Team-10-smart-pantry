import React, { Component } from 'react'
import Header from './components/Header'
import Navigation from './components/Navigation'
import RecipeList from './components/RecipeList'
import InventoryList from './components/InventoryList'
import SettingsPanel from './components/SettingsPanel'

// Main App component
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'recipes',
      isOnline: navigator.onLine,
      isSettingsOpen: false,
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

  handleOnlineStatus = () => {
    this.setState({ isOnline: navigator.onLine });
  };

  handleTabChange = (tab) => {
    this.setState({ activeTab: tab, isSettingsOpen: false });
  };

  toggleSettings = () => {
    this.setState(prevState => ({ isSettingsOpen: !prevState.isSettingsOpen }));
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
    const { activeTab, isOnline, isSettingsOpen } = this.state;

    return (
      <div className="App min-h-screen bg-gray-100">
        <Header 
          isSettingsOpen={isSettingsOpen} 
          toggleSettings={this.toggleSettings} 
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