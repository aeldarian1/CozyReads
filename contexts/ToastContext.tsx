'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastOptions, PromiseToastMessages } from '@/types';

type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading';

interface Toast {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextType {
  showToast: (options: string | ToastOptions) => string;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  loading: (message: string, title?: string) => string;
  promise: <T>(promise: Promise<T>, messages: PromiseToastMessages<T>) => Promise<T>;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((options: string | ToastOptions): string => {
    const id = typeof options === 'string'
      ? Math.random().toString(36).substring(7)
      : options.id || Math.random().toString(36).substring(7);

    const toast: Toast = typeof options === 'string'
      ? { id, message: options, type: 'info', duration: 5000 }
      : {
          id,
          title: options.title,
          message: options.message,
          type: options.variant || 'info',
          duration: options.duration || 5000,
        };

    setToasts(prev => [...prev, toast]);

    // Auto-remove after duration
    if (toast.duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, toast.duration);
    }

    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((message: string, title?: string) => {
    showToast({ message, title, variant: 'success' });
  }, [showToast]);

  const error = useCallback((message: string, title?: string) => {
    showToast({ message, title, variant: 'error' });
  }, [showToast]);

  const info = useCallback((message: string, title?: string) => {
    showToast({ message, title, variant: 'info' });
  }, [showToast]);

  const warning = useCallback((message: string, title?: string) => {
    showToast({ message, title, variant: 'warning' });
  }, [showToast]);

  const loading = useCallback((message: string, title?: string): string => {
    return showToast({ message, title, variant: 'loading', duration: 0 });
  }, [showToast]);

  const promiseToast = useCallback(async <T,>(
    promise: Promise<T>,
    messages: PromiseToastMessages<T>
  ): Promise<T> => {
    const loadingId = loading(messages.loading);

    try {
      const result = await promise;
      dismiss(loadingId);

      const successMessage = typeof messages.success === 'function'
        ? messages.success(result)
        : messages.success;
      success(successMessage);

      return result;
    } catch (err) {
      dismiss(loadingId);

      const errorMessage = typeof messages.error === 'function'
        ? messages.error(err as Error)
        : messages.error;
      error(errorMessage);

      throw err;
    }
  }, [loading, dismiss, success, error]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getToastStyles = (type: ToastType) => {
    const styles = {
      success: {
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.95) 0%, rgba(22, 163, 74, 0.95) 100%)',
        icon: '✓',
      },
      error: {
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%)',
        icon: '✕',
      },
      warning: {
        background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.95) 0%, rgba(202, 138, 4, 0.95) 100%)',
        icon: '⚠',
      },
      info: {
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(37, 99, 235, 0.95) 100%)',
        icon: 'ℹ',
      },
      loading: {
        background: 'linear-gradient(135deg, rgba(100, 116, 139, 0.95) 0%, rgba(71, 85, 105, 0.95) 100%)',
        icon: '⏳',
      },
    };
    return styles[type];
  };

  return (
    <ToastContext.Provider
      value={{
        showToast,
        success,
        error,
        info,
        warning,
        loading,
        promise: promiseToast,
        dismiss
      }}
    >
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-md">
        {toasts.map(toast => {
          const styles = getToastStyles(toast.type);
          return (
            <div
              key={toast.id}
              className="rounded-xl p-4 shadow-2xl backdrop-blur-sm animate-slideInRight flex items-start gap-3 cursor-pointer"
              style={{
                background: styles.background,
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
              onClick={() => removeToast(toast.id)}
            >
              <span className="text-2xl flex-shrink-0">
                {toast.type === 'loading' ? (
                  <span className="inline-block animate-spin">⏳</span>
                ) : (
                  styles.icon
                )}
              </span>
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <p className="font-bold text-sm mb-1">{toast.title}</p>
                )}
                <p className="font-semibold text-sm">{toast.message}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeToast(toast.id);
                }}
                className="text-white/80 hover:text-white transition-colors flex-shrink-0"
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
