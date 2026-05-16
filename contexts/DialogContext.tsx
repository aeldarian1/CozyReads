'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { ConfirmDialogOptions, AlertDialogOptions } from '@/types';

interface DialogContextType {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
  alert: (options: AlertDialogOptions) => Promise<void>;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    options: ConfirmDialogOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    options: AlertDialogOptions;
    resolve: () => void;
  } | null>(null);

  const confirm = useCallback((options: ConfirmDialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmDialog({
        isOpen: true,
        options,
        resolve,
      });
    });
  }, []);

  const alert = useCallback((options: AlertDialogOptions): Promise<void> => {
    return new Promise((resolve) => {
      setAlertDialog({
        isOpen: true,
        options,
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmDialog) {
      confirmDialog.resolve(true);
      setConfirmDialog(null);
    }
  }, [confirmDialog]);

  const handleCancel = useCallback(() => {
    if (confirmDialog) {
      confirmDialog.resolve(false);
      setConfirmDialog(null);
    }
  }, [confirmDialog]);

  const handleAlertClose = useCallback(() => {
    if (alertDialog) {
      alertDialog.resolve();
      setAlertDialog(null);
    }
  }, [alertDialog]);

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}

      {confirmDialog && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          {...confirmDialog.options}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

      {alertDialog && (
        <AlertDialog
          isOpen={alertDialog.isOpen}
          {...alertDialog.options}
          onClose={handleAlertClose}
        />
      )}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
}
