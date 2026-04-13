import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-[#0e131f] text-[#dde2f3]">
          <h2 className="text-xl font-semibold text-red-500 mb-2">Something went wrong</h2>
          <p className="text-gray-400 text-sm mb-4">{this.state.error?.message}</p>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

