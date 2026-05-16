'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
          <div className="max-w-md w-full rounded-2xl p-8 shadow-2xl text-center" style={{
            background: 'var(--gradient-card)',
            border: '1px solid var(--border-color)',
          }}>
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-dark)' }}>
              Something went wrong
            </h2>
            <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 shadow-lg"
              style={{
                background: 'var(--gradient-accent)',
                color: 'var(--text-dark)',
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 shadow-lg ml-3"
              style={{
                background: 'var(--bg-tertiary)',
                color: 'var(--text-dark)',
                border: '2px solid var(--border-color)',
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ErrorFallback({ error, reset }: { error: Error; reset?: () => void }) {
  return (
    <div className="rounded-2xl p-6 shadow-lg" style={{
      background: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
    }}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">⚠️</span>
        <h3 className="text-lg font-bold" style={{ color: '#b91c1c' }}>
          Error Loading Content
        </h3>
      </div>
      <p className="mb-4 text-sm" style={{ color: '#7f1d1d' }}>
        {error.message}
      </p>
      {reset && (
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:scale-105"
          style={{
            background: '#dc2626',
            color: '#fff',
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
}
