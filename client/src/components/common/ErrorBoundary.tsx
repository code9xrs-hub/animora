import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  resetKey?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  prevResetKey?: string;
}

/**
 * Catches render errors and failed lazy-chunk loads (common right after a new
 * deploy) so a single broken view never blanks the whole app.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    prevResetKey: this.props.resetKey
  };

  static getDerivedStateFromError(): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  static getDerivedStateFromProps(props: ErrorBoundaryProps, state: ErrorBoundaryState): Partial<ErrorBoundaryState> | null {
    if (props.resetKey !== state.prevResetKey) {
      return {
        hasError: false,
        prevResetKey: props.resetKey
      };
    }
    return null;
  }

  componentDidCatch(error: unknown) {
    console.error('Unhandled UI error:', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="font-display text-lg font-bold text-white">Something went wrong</h1>
        <p className="text-sm text-[#8E93A0]">
          This page failed to load. It may have been updated — reloading usually fixes it.
        </p>
        <button type="button" onClick={() => window.location.reload()} className="btn-primary">
          Reload page
        </button>
      </div>
    );
  }
}
