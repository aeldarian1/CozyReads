interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-16 w-16',
  };

  return (
    <div className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${className}`} style={{
      borderColor: 'var(--warm-brown)',
    }} />
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-lg font-semibold" style={{ color: 'var(--text-dark)' }}>
          Loading your library...
        </p>
      </div>
    </div>
  );
}

export function LoadingOverlay({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50" style={{
      background: 'rgba(0, 0, 0, 0.5)'
    }}>
      <div className="rounded-2xl p-8 shadow-2xl" style={{
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-color)'
      }}>
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-lg font-semibold text-center" style={{ color: 'var(--text-dark)' }}>
          {message}
        </p>
      </div>
    </div>
  );
}
