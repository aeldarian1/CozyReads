'use client';

import { ReactNode } from 'react';
import { Dialog } from './Dialog';
import { Button } from './Button';

export interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
}

export interface ModalFooterProps {
  onCancel?: () => void;
  onConfirm?: () => void;
  cancelText?: string;
  confirmText?: string;
  confirmVariant?: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline';
  isLoading?: boolean;
  isDisabled?: boolean;
  extraActions?: ReactNode;
}

/**
 * Base modal component with consistent styling and behavior.
 * Provides a standard structure with header, body, and footer.
 *
 * @example
 * <ModalBase
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   title="Add Book"
 *   footer={
 *     <ModalFooter
 *       onCancel={onClose}
 *       onConfirm={handleSave}
 *       confirmText="Save"
 *     />
 *   }
 * >
 *   <div>Modal content here</div>
 * </ModalBase>
 */
export function ModalBase({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
}: ModalBaseProps) {
  const maxWidthMap = {
    sm: 'max-w-sm',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full',
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth={maxWidthMap[size]}
      showCloseButton={showCloseButton}
      closeOnBackdropClick={closeOnBackdropClick}
      closeOnEscape={closeOnEscape}
    >
      <div className="space-y-6">
        {/* Modal Body */}
        <div className="px-6 py-4">
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </Dialog>
  );
}

/**
 * Standard modal footer with cancel and confirm buttons.
 *
 * @example
 * <ModalFooter
 *   onCancel={handleCancel}
 *   onConfirm={handleConfirm}
 *   confirmText="Save Changes"
 *   isLoading={isSaving}
 * />
 */
export function ModalFooter({
  onCancel,
  onConfirm,
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  confirmVariant = 'primary',
  isLoading = false,
  isDisabled = false,
  extraActions,
}: ModalFooterProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      {/* Extra actions on the left */}
      <div className="flex-1">
        {extraActions}
      </div>

      {/* Cancel and Confirm buttons on the right */}
      <div className="flex items-center gap-3">
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
        )}
        {onConfirm && (
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            isLoading={isLoading}
            disabled={isDisabled || isLoading}
          >
            {confirmText}
          </Button>
        )}
      </div>
    </div>
  );
}
