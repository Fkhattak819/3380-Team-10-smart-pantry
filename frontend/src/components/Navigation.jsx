import React, { Component } from 'react';

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
    const baseClass = "flex-1 md:flex-none px-4 py-2 text-sm font-medium rounded-full transition-all";
    const isActive = this.state.activeTab === tab;
    
    if (isActive) {
      return `${baseClass} bg-emerald-500 text-white shadow-sm`;
    }
    return `${baseClass} text-slate-600 hover:text-slate-900 hover:bg-slate-100`;
  }

  render() {
    const tabs = [
      { id: 'recipes', label: 'Recipes' },
      { id: 'pantry', label: 'Pantry' }
    ];

    return (
      <nav className="flex justify-center">
        <div className="inline-flex bg-slate-100 rounded-full p-1 space-x-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => this.handleTabChange(tab.id)}
              className={this.getTabClass(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>
    );
  }
}

export default Navigation;