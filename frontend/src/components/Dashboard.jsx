import React, { Component } from 'react';
import InventoryList from './InventoryList';
import { PantryService } from '../services/PantryService.js';

/**
 * Dashboard component class - main dashboard with statistics and controls
 * Follows object-oriented design principles with proper state management
 */
class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.pantryService = new PantryService();
    
    this.state = {
      statistics: {
        total: 0,
        expired: 0,
        expiringSoon: 0,
        fresh: 0
      },
      recentActivity: [],
      isLoading: true
    };
  }

  componentDidMount() {
    this.updateStatistics();
    this.initializeRecentActivity();
    this.setState({ isLoading: false });
  }

  updateStatistics() {
    const stats = this.pantryService.getStatistics();
    this.setState({ statistics: stats });
  }

  initializeRecentActivity() {
    // Initialize with sample recent activity
    const activities = [
      { id: 1, action: 'Added Milk to inventory', timestamp: new Date(), type: 'add' },
      { id: 2, action: 'Bread expires tomorrow', timestamp: new Date(), type: 'warning' },
      { id: 3, action: 'Removed expired yogurt', timestamp: new Date(), type: 'remove' }
    ];
    this.setState({ recentActivity: activities });
  }

  addActivity(action, type = 'info') {
    const newActivity = {
      id: Date.now(),
      action,
      timestamp: new Date(),
      type
    };
    
    this.setState(prevState => ({
      recentActivity: [newActivity, ...prevState.recentActivity.slice(0, 4)]
    }));
  }

  handleQuickAction = (action) => {
    switch (action) {
      case 'add':
        this.addActivity('Quick add item action triggered', 'add');
        break;
      case 'shopping':
        this.addActivity('Shopping list generated', 'info');
        break;
      case 'expiring':
        this.addActivity('Viewing expiring items', 'warning');
        break;
      default:
        this.addActivity(`Action: ${action}`, 'info');
    }
  };

  getStatisticsCard(title, value, color, icon) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
          <div className={`text-4xl ${color}`}>
            {icon}
          </div>
        </div>
      </div>
    );
  }

  getActivityIcon(type) {
    switch (type) {
      case 'add':
        return '➕';
      case 'remove':
        return '🗑️';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  }

  formatActivityTime(timestamp) {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  render() {
    if (this.state.isLoading) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading Smart Pantry...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {this.getStatisticsCard(
                'Total Items', 
                this.state.statistics.total, 
                'text-blue-600',
                '📦'
              )}
              {this.getStatisticsCard(
                'Fresh Items', 
                this.state.statistics.fresh, 
                'text-green-600',
                '✅'
              )}
              {this.getStatisticsCard(
                'Expiring Soon', 
                this.state.statistics.expiringSoon, 
                'text-orange-600',
                '⏰'
              )}
              {this.getStatisticsCard(
                'Expired', 
                this.state.statistics.expired, 
                'text-red-600',
                '❌'
              )}
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <InventoryList />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => this.handleQuickAction('add')}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                  >
                    ➕ Add Item
                  </button>
                  <button 
                    onClick={() => this.handleQuickAction('shopping')}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    🛒 Generate Shopping List
                  </button>
                  <button 
                    onClick={() => this.handleQuickAction('expiring')}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
                  >
                    ⏰ View Expiring Items
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {this.state.recentActivity.length === 0 ? (
                    <p className="text-gray-500 text-sm">No recent activity</p>
                  ) : (
                    this.state.recentActivity.map(activity => (
                      <div key={activity.id} className="flex items-start space-x-2 text-sm">
                        <span className="text-lg">{this.getActivityIcon(activity.type)}</span>
                        <div className="flex-1">
                          <p className="text-gray-800">{activity.action}</p>
                          <p className="text-gray-500 text-xs">
                            {this.formatActivityTime(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">System Status</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Database:</span>
                    <span className="text-green-600">✓ Connected</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Sync:</span>
                    <span className="text-gray-800">Just now</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Version:</span>
                    <span className="text-gray-800">v1.0.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Dashboard;
