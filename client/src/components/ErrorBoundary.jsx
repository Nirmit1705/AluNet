import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Profile Error caught:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen bg-background">
          <div className="container-custom py-8">
            <div className="glass-card p-8 rounded-xl text-center">
              <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
              <p className="mb-6">There was an error loading your profile. Please try again later.</p>
              <details className="mb-4 text-left p-4 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-auto">
                <summary className="cursor-pointer mb-2 font-medium">Error details</summary>
                <pre className="text-xs whitespace-pre-wrap">
                  {this.state.error && this.state.error.toString()}
                </pre>
              </details>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-white rounded-lg"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
