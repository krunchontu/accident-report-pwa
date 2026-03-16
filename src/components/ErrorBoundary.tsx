import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <div className="text-4xl mb-4">&#9888;</div>
            <h1 className="text-xl font-bold text-navy mb-2">Something went wrong</h1>
            <p className="text-sm text-gray-600 mb-6">
              Your data is safe in local storage. Tap below to reload.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-4 bg-navy text-white rounded-xl font-semibold mb-3"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 border-2 border-gray-300 rounded-xl font-medium text-gray-600"
            >
              Reload App
            </button>
            {this.state.error && (
              <details className="mt-4 text-left text-xs text-gray-400">
                <summary>Error details</summary>
                <pre className="mt-2 whitespace-pre-wrap break-all">{this.state.error.message}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
