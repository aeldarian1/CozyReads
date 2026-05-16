import { useState, useCallback, useRef } from 'react';

/**
 * Action interface for undo/redo operations.
 * Each action must implement both execute and undo methods.
 */
export interface Action {
  id: string;
  type: string;
  description: string;
  execute: () => Promise<void> | void;
  undo: () => Promise<void> | void;
  metadata?: Record<string, any>;
}

/**
 * Undo/Redo hook for managing action history.
 * Provides undo, redo, and action execution with history tracking.
 *
 * @param maxHistorySize - Maximum number of actions to keep in history (default: 50)
 *
 * @example
 * const { execute, undo, redo, canUndo, canRedo, history } = useUndoRedo();
 *
 * // Execute an action
 * execute({
 *   id: generateId(),
 *   type: 'delete-book',
 *   description: 'Delete "1984"',
 *   execute: async () => {
 *     await fetch(`/api/books/${bookId}`, { method: 'DELETE' });
 *   },
 *   undo: async () => {
 *     await fetch('/api/books', { method: 'POST', body: JSON.stringify(bookData) });
 *   },
 * });
 *
 * // Undo the last action
 * await undo();
 *
 * // Redo the last undone action
 * await redo();
 */
export function useUndoRedo(maxHistorySize = 50) {
  const [history, setHistory] = useState<Action[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);

  // Track the last executed action for potential grouping
  const lastExecutedRef = useRef<{ action: Action; timestamp: number } | null>(null);

  /**
   * Execute an action and add it to history.
   * Clears any redo history when a new action is executed.
   */
  const execute = useCallback(
    async (action: Action, options: { skipExecution?: boolean; groupWithLast?: boolean } = {}) => {
      const { skipExecution = false, groupWithLast = false } = options;

      setIsExecuting(true);
      try {
        // Execute the action if not skipped
        if (!skipExecution) {
          await action.execute();
        }

        setHistory((prev) => {
          // Remove any redo history (actions after current index)
          const newHistory = prev.slice(0, currentIndex + 1);

          // Check if we should group with the last action
          const now = Date.now();
          const lastExecuted = lastExecutedRef.current;
          const shouldGroup =
            groupWithLast &&
            lastExecuted &&
            lastExecuted.action.type === action.type &&
            now - lastExecuted.timestamp < 1000; // Within 1 second

          if (shouldGroup && newHistory.length > 0) {
            // Replace the last action with a grouped version
            const lastAction = newHistory[newHistory.length - 1];
            const groupedAction: Action = {
              ...action,
              description: `${lastAction.description} (grouped)`,
              undo: async () => {
                await action.undo();
                await lastAction.undo();
              },
            };
            newHistory[newHistory.length - 1] = groupedAction;
            return newHistory;
          }

          // Add the new action
          newHistory.push(action);

          // Limit history size
          if (newHistory.length > maxHistorySize) {
            return newHistory.slice(-maxHistorySize);
          }

          return newHistory;
        });

        setCurrentIndex((prev) => {
          const newIndex = prev + 1;
          return Math.min(newIndex, maxHistorySize - 1);
        });

        // Track for potential grouping
        lastExecutedRef.current = { action, timestamp: Date.now() };
      } catch (error) {
        console.error('Failed to execute action:', error);
        throw error;
      } finally {
        setIsExecuting(false);
      }
    },
    [currentIndex, maxHistorySize]
  );

  /**
   * Undo the last action.
   */
  const undo = useCallback(async () => {
    if (currentIndex < 0 || isExecuting) return;

    const action = history[currentIndex];
    if (!action) return;

    setIsExecuting(true);
    try {
      await action.undo();
      setCurrentIndex((prev) => prev - 1);
    } catch (error) {
      console.error('Failed to undo action:', error);
      throw error;
    } finally {
      setIsExecuting(false);
    }
  }, [currentIndex, history, isExecuting]);

  /**
   * Redo the last undone action.
   */
  const redo = useCallback(async () => {
    if (currentIndex >= history.length - 1 || isExecuting) return;

    const action = history[currentIndex + 1];
    if (!action) return;

    setIsExecuting(true);
    try {
      await action.execute();
      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      console.error('Failed to redo action:', error);
      throw error;
    } finally {
      setIsExecuting(false);
    }
  }, [currentIndex, history, isExecuting]);

  /**
   * Clear the entire history.
   */
  const clear = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
    lastExecutedRef.current = null;
  }, []);

  /**
   * Get a list of undoable actions.
   */
  const undoableActions = history.slice(0, currentIndex + 1);

  /**
   * Get a list of redoable actions.
   */
  const redoableActions = history.slice(currentIndex + 1);

  return {
    execute,
    undo,
    redo,
    clear,
    canUndo: currentIndex >= 0 && !isExecuting,
    canRedo: currentIndex < history.length - 1 && !isExecuting,
    isExecuting,
    history,
    currentIndex,
    undoableActions,
    redoableActions,
  };
}

/**
 * Context provider for global undo/redo state.
 * Useful for sharing undo/redo across multiple components.
 */
import { createContext, useContext, ReactNode } from 'react';

interface UndoRedoContextType {
  execute: (action: Action, options?: { skipExecution?: boolean; groupWithLast?: boolean }) => Promise<void>;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  clear: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isExecuting: boolean;
  history: Action[];
  undoableActions: Action[];
  redoableActions: Action[];
}

const UndoRedoContext = createContext<UndoRedoContextType | undefined>(undefined);

export function UndoRedoProvider({ children }: { children: ReactNode }) {
  const undoRedo = useUndoRedo();

  return (
    <UndoRedoContext.Provider value={undoRedo}>
      {children}
    </UndoRedoContext.Provider>
  );
}

export function useUndoRedoContext() {
  const context = useContext(UndoRedoContext);
  if (!context) {
    throw new Error('useUndoRedoContext must be used within UndoRedoProvider');
  }
  return context;
}

/**
 * Helper to generate unique IDs for actions.
 */
export function generateActionId(): string {
  return `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Pre-built action factories for common operations.
 */
export const actionFactories = {
  deleteBook: (book: { id: string; title: string; [key: string]: any }): Action => ({
    id: generateActionId(),
    type: 'delete-book',
    description: `Delete "${book.title}"`,
    execute: async () => {
      const response = await fetch(`/api/books/${book.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete book');
    },
    undo: async () => {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book),
      });
      if (!response.ok) throw new Error('Failed to restore book');
    },
    metadata: { book },
  }),

  updateBook: (
    bookId: string,
    oldData: Record<string, any>,
    newData: Record<string, any>
  ): Action => ({
    id: generateActionId(),
    type: 'update-book',
    description: `Update "${oldData.title || 'book'}"`,
    execute: async () => {
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });
      if (!response.ok) throw new Error('Failed to update book');
    },
    undo: async () => {
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(oldData),
      });
      if (!response.ok) throw new Error('Failed to undo book update');
    },
    metadata: { bookId, oldData, newData },
  }),

  bulkDelete: (books: Array<{ id: string; title: string; [key: string]: any }>): Action => ({
    id: generateActionId(),
    type: 'bulk-delete',
    description: `Delete ${books.length} books`,
    execute: async () => {
      const promises = books.map((book) =>
        fetch(`/api/books/${book.id}`, { method: 'DELETE' })
      );
      await Promise.all(promises);
    },
    undo: async () => {
      const promises = books.map((book) =>
        fetch('/api/books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(book),
        })
      );
      await Promise.all(promises);
    },
    metadata: { books },
  }),
};
