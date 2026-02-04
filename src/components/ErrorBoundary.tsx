import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReload = () => window.location.reload();

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-familiar-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-gray-100">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-500 mb-6">
              We're sorry, but Familiar encountered an unexpected error.
            </p>
            <div className="bg-gray-50 p-3 rounded-xl mb-6 text-left overflow-auto max-h-32">
              <code className="text-xs text-red-500 font-mono">
                {this.state.error?.message}
              </code>
            </div>
            <Button onClick={this.handleReload} className="w-full flex items-center justify-center gap-2">
              <RefreshCw size={18} />
              Reload Application
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
