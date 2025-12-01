import React, { Component } from 'react';

class Notification extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isVisible: false,
      message: '',
      type: 'success' // 'success' or 'error'
    };
  }

  componentDidMount() {
    if (this.props.message) {
      this.show(this.props.message, this.props.type || 'success');
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.message !== prevProps.message && this.props.message) {
      this.show(this.props.message, this.props.type || 'success');
    }
  }

  componentWillUnmount() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  show = (message, type = 'success') => {
    // Clear any existing timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.setState({
      isVisible: true,
      message,
      type
    });

    // Auto-hide after 3 seconds
    this.timeoutId = setTimeout(() => {
      this.hide();
    }, 3000);
  };

  hide = () => {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.setState({ isVisible: false });
    if (this.props.onClose) {
      this.props.onClose();
    }
  };

  render() {
    const { isVisible, message, type } = this.state;
    
    if (!isVisible || !message) return null;

    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const icon = type === 'success' ? '✓' : '✕';

    return (
      <div className="fixed top-4 right-4 z-50 animate-slide-in">
        <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 min-w-[300px] max-w-md`}>
          <span className="text-xl font-bold">{icon}</span>
          <p className="flex-1 text-sm font-medium">{message}</p>
          <button
            onClick={this.hide}
            className="text-white hover:text-gray-200 text-xl font-bold"
          >
            ×
          </button>
        </div>
        <style>{`
          @keyframes slide-in {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          .animate-slide-in {
            animation: slide-in 0.3s ease-out;
          }
        `}</style>
      </div>
    );
  }
}

export default Notification;

