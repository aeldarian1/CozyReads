'use client';

import { Dialog } from './Dialog';
import { ConfirmDialogOptions } from '@/types';

interface ConfirmDialogProps extends ConfirmDialogOptions {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const variantStyles = {
    default: {
      confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
      icon: '❓',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
    },
    destructive: {
      confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
      icon: '⚠️',
      iconBg: 'bg-red-100',
      iconText: 'text-red-600',
    },
  };

  const styles = variantStyles[variant];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      maxWidth="sm"
      closeOnBackdropClick={false}
      showCloseButton={false}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-10 h-10 rounded-full ${styles.iconBg} flex items-center justify-center`}>
            <span className="text-xl">{styles.icon}</span>
          </div>
          <p className="flex-1 text-gray-700 text-sm leading-relaxed pt-2">{message}</p>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              variant === 'destructive' ? 'focus:ring-red-500' : 'focus:ring-blue-500'
            } ${styles.confirmButton}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
