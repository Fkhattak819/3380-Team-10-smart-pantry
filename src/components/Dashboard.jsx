import React from 'react';
import InventoryList from './InventoryList';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700">Total Items</h3>
              <p className="text-3xl font-bold text-blue-600">12</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700">Expiring Soon</h3>
              <p className="text-3xl font-bold text-orange-600">3</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700">Expired</h3>
              <p className="text-3xl font-bold text-red-600">1</p>
            </div>
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
                <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
                  Add Item
                </button>
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                  Generate Shopping List
                </button>
                <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700">
                  View Expiring Items
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Added Milk to inventory</p>
                <p>• Bread expires tomorrow</p>
                <p>• Removed expired yogurt</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
