import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service here (like Sentry)
    console.error("Critical React Exception Caught:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI rendering when an unhandled exception occurs
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-200">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            
            <h1 className="text-2xl font-bold font-heading text-white tracking-tight">System Exception</h1>
            
            <p className="text-slate-400 text-sm leading-relaxed">
              We encountered an unexpected error while rendering this page. Our engineering team has been notified.
            </p>

            <div className="bg-slate-950 rounded-lg p-4 text-left overflow-x-auto border border-slate-800">
              <p className="font-mono text-xs text-red-400 break-words">
                {this.state.error && this.state.error.toString()}
              </p>
            </div>

            <div className="pt-6 border-t border-slate-800 flex items-center justify-center space-x-4">
              <button 
                onClick={this.handleReload}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
               >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>

              <Link 
                to="/"
                onClick={() => this.setState({ hasError: false })}
                className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
               >
                <Home className="w-4 h-4" />
                <span>Return Home</span>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
