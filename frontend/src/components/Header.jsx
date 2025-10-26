import React, { Component } from 'react';

/**
 * Header component class - displays the SmartPantry header
 * Follows object-oriented design principles
 */
class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTime: new Date()
    };
  }

  componentDidMount() {
    // Update time every minute
    this.timer = setInterval(() => {
      this.setState({ currentTime: new Date() });
    }, 60000);
  }

  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  formatTime(date) {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  render() {
    return (
      <header className="bg-white py-8">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <span className="text-4xl">👨‍🍳</span>
            <h1 className="text-4xl font-bold text-orange-500">SmartPantry</h1>
          </div>
          <p className="text-gray-600 text-lg">Your intelligent meal planning companion</p>
        </div>
      </header>
    );
  }
}

export default Header;
