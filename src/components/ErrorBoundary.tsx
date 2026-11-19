import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-screen bg-[#FFFFFF] text-[#0A0A0A] flex flex-col items-center justify-center p-8 text-center font-sans">
          <div className="max-w-md p-8 border border-[rgba(10,10,10,0.16)] bg-[#F7F7F8]">
            <span className="text-xs font-mono font-bold text-[#FF4F00] uppercase tracking-wider block mb-2">
              System Notice
            </span>
            <h2 className="text-xl font-bold text-[#0A0A0A] mb-3">
              Application Notice
            </h2>
            <p className="text-xs font-mono text-[#0A0A0A]/60 mb-6 leading-relaxed">
              A temporary render interruption occurred. All local data and defaults remain safe.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-5 py-2.5 bg-[#FF4F00] hover:bg-[#E04500] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
