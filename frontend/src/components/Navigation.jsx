import React, { Component } from 'react';

/**
 * Navigation component class - handles main navigation
 * Follows object-oriented design principles
 */
class Navigation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: props.activeTab || 'recipes'
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.activeTab !== this.props.activeTab) {
      this.setState({ activeTab: this.props.activeTab });
    }
  }

  handleTabChange = (tab) => {
    this.setState({ activeTab: tab });
    if (this.props.onTabChange) {
      this.props.onTabChange(tab);
    }
  };

  getTabClass(tab) {
    const baseClass = "flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors";
    const isActive = this.state.activeTab === tab;
    
    if (isActive) {
      return `${baseClass} bg-white border border-gray-300 text-gray-800`;
    }
    return `${baseClass} text-gray-600 hover:text-gray-800 hover:bg-gray-100`;
  }

  getTabIcon(tab) {
    switch (tab) {
      case 'recipes':
        return '👨‍🍳';
      case 'pantry':
        return '🏠';
      case 'shopping':
        return '🛒';
      case 'settings':
        return '⚙️';
      default:
        return '📋';
    }
  }

  render() {
    const tabs = [
      { id: 'recipes', label: 'Recipes' },
      { id: 'pantry', label: 'Pantry' },
      { id: 'shopping', label: 'Shopping' },
      { id: 'settings', label: 'Settings' }
    ];

    return (
      <nav className="flex justify-center space-x-2 mb-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => this.handleTabChange(tab.id)}
            className={this.getTabClass(tab.id)}
          >
            <span className="text-lg">{this.getTabIcon(tab.id)}</span>
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </nav>
    );
  }
}

export default Navigation;
