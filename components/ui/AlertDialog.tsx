'use client';

import { Dialog } from './Dialog';
import { AlertDialogOptions } from '@/types';

interface AlertDialogProps extends AlertDialogOptions {
  isOpen: boolean;
  onClose: () => void;
}

export function AlertDialog({
  isOpen,
  title,
  message,
  confirmText = 'OK',
  variant = 'info',
  onClose,
}: AlertDialogProps) {
  const variantStyles = {
    success: {
      icon: '✓',
      iconBg: 'bg-green-100',
      iconText: 'text-green-600',
      button: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
    },
    error: {
      icon: '✕',
      iconBg: 'bg-red-100',
      iconText: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    },
    warning: {
      icon: '⚠',
      iconBg: 'bg-yellow-100',
      iconText: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
    },
    info: {
      icon: 'ℹ',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    },
    loading: {
      icon: '⏳',
      iconBg: 'bg-gray-100',
      iconText: 'text-gray-600',
      button: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500',
    },
  };

  const styles = variantStyles[variant];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="sm"
      closeOnBackdropClick={true}
      showCloseButton={false}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-10 h-10 rounded-full ${styles.iconBg} flex items-center justify-center`}>
            <span className={`text-xl ${styles.iconText}`}>{styles.icon}</span>
          </div>
          <p className="flex-1 text-gray-700 text-sm leading-relaxed pt-2">{message}</p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
