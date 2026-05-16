import { useEffect, useCallback, useRef, useState } from 'react';

/**
 * Keyboard shortcut configuration interface.
 */
export interface KeyboardShortcut {
  /** Keyboard key (e.g., 'a', 'Enter', 'Escape', '/') */
  key: string;

  /** Human-readable description of what the shortcut does */
  description: string;

  /** Function to execute when shortcut is triggered */
  action: () => void;

  /** Require Ctrl/Cmd key */
  ctrlKey?: boolean;

  /** Require Shift key */
  shiftKey?: boolean;

  /** Require Alt/Option key */
  altKey?: boolean;

  /** Category for organization in help menu */
  category?: 'navigation' | 'actions' | 'editing' | 'view' | 'selection' | 'other';

  /** Priority (higher priority shortcuts are checked first) */
  priority?: number;

  /** Whether this shortcut is enabled */
  enabled?: boolean;

  /** Scope - global or specific context */
  scope?: 'global' | 'modal' | 'grid' | 'form';
}

/**
 * Options for the keyboard shortcuts hook.
 */
export interface UseKeyboardShortcutsOptions {
  /** Whether shortcuts are enabled */
  enabled?: boolean;

  /** Whether to prevent default for matched shortcuts */
  preventDefault?: boolean;

  /** Whether to stop propagation for matched shortcuts */
  stopPropagation?: boolean;

  /** Callback when a shortcut is triggered */
  onShortcutTriggered?: (shortcut: KeyboardShortcut) => void;

  /** Callback when a conflict is detected */
  onConflict?: (shortcuts: KeyboardShortcut[]) => void;

  /** Allow shortcuts in input fields */
  allowInInputs?: boolean;

  /** Current scope for filtering shortcuts */
  scope?: 'global' | 'modal' | 'grid' | 'form';
}

/**
 * Enhanced keyboard shortcuts hook with support for:
 * - Multiple modifier keys (Ctrl, Shift, Alt)
 * - Scoped shortcuts (global, modal-specific, etc.)
 * - Priority system for conflict resolution
 * - Categories for organization
 * - Conflict detection
 *
 * @example
 * const shortcuts: KeyboardShortcut[] = [
 *   { key: '/', description: 'Focus search', action: () => searchRef.current?.focus(), category: 'navigation' },
 *   { key: 'a', description: 'Add book', action: () => setIsAddModalOpen(true), category: 'actions' },
 *   { key: 'z', ctrlKey: true, description: 'Undo', action: () => undo(), category: 'editing', priority: 10 },
 * ];
 *
 * useKeyboardShortcuts(shortcuts, { enabled: true });
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
) {
  const {
    enabled = true,
    preventDefault = true,
    stopPropagation = false,
    onShortcutTriggered,
    onConflict,
    allowInInputs = false,
    scope = 'global',
  } = options;

  // Track last triggered shortcut for debugging
  const lastTriggeredRef = useRef<{ shortcut: KeyboardShortcut; timestamp: number } | null>(null);

  // Detect conflicts on mount
  useEffect(() => {
    if (!enabled) return;

    const conflicts = detectConflicts(shortcuts);
    if (conflicts.length > 0 && onConflict) {
      onConflict(conflicts);
    }
  }, [shortcuts, enabled, onConflict]);

  // Main keyboard handler
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs (unless allowed)
      if (!allowInInputs) {
        const target = event.target as HTMLElement;
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable
        ) {
          return;
        }
      }

      // Filter shortcuts by scope and enabled status
      const activeShortcuts = shortcuts.filter(
        (s) =>
          (s.enabled !== false) &&
          (!s.scope || s.scope === 'global' || s.scope === scope)
      );

      // Sort by priority (higher priority first)
      const sortedShortcuts = activeShortcuts.sort(
        (a, b) => (b.priority || 0) - (a.priority || 0)
      );

      // Find matching shortcut
      const matchedShortcut = sortedShortcuts.find((s) => {
        const keyMatches = s.key.toLowerCase() === event.key.toLowerCase();
        const ctrlMatches = s.ctrlKey ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatches = s.shiftKey ? event.shiftKey : !event.shiftKey;
        const altMatches = s.altKey ? event.altKey : !event.altKey;

        return keyMatches && ctrlMatches && shiftMatches && altMatches;
      });

      if (matchedShortcut) {
        if (preventDefault) {
          event.preventDefault();
        }
        if (stopPropagation) {
          event.stopPropagation();
        }

        // Execute the action
        matchedShortcut.action();

        // Track for debugging
        lastTriggeredRef.current = {
          shortcut: matchedShortcut,
          timestamp: Date.now(),
        };

        // Callback
        onShortcutTriggered?.(matchedShortcut);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled, preventDefault, stopPropagation, onShortcutTriggered, allowInInputs, scope]);

  return {
    lastTriggered: lastTriggeredRef.current,
  };
}

/**
 * Detect conflicting shortcuts (same key combination).
 */
export function detectConflicts(shortcuts: KeyboardShortcut[]): KeyboardShortcut[] {
  const conflicts: KeyboardShortcut[] = [];
  const seen = new Map<string, KeyboardShortcut>();

  for (const shortcut of shortcuts) {
    const key = getShortcutKey(shortcut);
    const existing = seen.get(key);

    if (existing) {
      // Found a conflict
      if (!conflicts.includes(existing)) {
        conflicts.push(existing);
      }
      conflicts.push(shortcut);
    } else {
      seen.set(key, shortcut);
    }
  }

  return conflicts;
}

/**
 * Generate a unique key for a shortcut combination.
 */
function getShortcutKey(shortcut: KeyboardShortcut): string {
  const parts = [shortcut.key.toLowerCase()];
  if (shortcut.ctrlKey) parts.push('ctrl');
  if (shortcut.shiftKey) parts.push('shift');
  if (shortcut.altKey) parts.push('alt');
  if (shortcut.scope && shortcut.scope !== 'global') parts.push(shortcut.scope);
  return parts.sort().join('+');
}

/**
 * Format a shortcut for display (e.g., "Ctrl+Shift+A").
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  const parts: string[] = [];

  if (shortcut.ctrlKey) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcut.shiftKey) {
    parts.push(isMac ? '⇧' : 'Shift');
  }
  if (shortcut.altKey) {
    parts.push(isMac ? '⌥' : 'Alt');
  }

  // Format special keys
  let key = shortcut.key;
  const specialKeys: Record<string, string> = {
    Enter: '↵',
    Escape: 'Esc',
    ArrowUp: '↑',
    ArrowDown: '↓',
    ArrowLeft: '←',
    ArrowRight: '→',
    Backspace: '⌫',
    Delete: 'Del',
    ' ': 'Space',
  };

  key = specialKeys[key] || key.toUpperCase();
  parts.push(key);

  return parts.join(isMac ? '' : '+');
}

/**
 * Group shortcuts by category for display.
 */
export function groupShortcutsByCategory(shortcuts: KeyboardShortcut[]): Record<string, KeyboardShortcut[]> {
  const grouped: Record<string, KeyboardShortcut[]> = {
    navigation: [],
    actions: [],
    editing: [],
    view: [],
    selection: [],
    other: [],
  };

  for (const shortcut of shortcuts) {
    const category = shortcut.category || 'other';
    grouped[category].push(shortcut);
  }

  return grouped;
}

/**
 * Hook for managing a sequence of shortcuts (like vim commands).
 * Allows chaining shortcuts like "g g" to go to top.
 */
export function useShortcutSequence(
  sequences: Array<{
    keys: string[];
    description: string;
    action: () => void;
  }>,
  options: { timeout?: number; enabled?: boolean } = {}
) {
  const { timeout = 1000, enabled = true } = options;
  const [currentSequence, setCurrentSequence] = useState<string[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Add key to current sequence
      const newSequence = [...currentSequence, event.key];

      // Check if any sequence matches
      const matchedSequence = sequences.find((seq) =>
        seq.keys.every((key, index) => key === newSequence[index])
      );

      if (matchedSequence && matchedSequence.keys.length === newSequence.length) {
        // Complete match
        event.preventDefault();
        matchedSequence.action();
        setCurrentSequence([]);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      } else {
        // Partial match or no match
        const hasPartialMatch = sequences.some((seq) =>
          newSequence.every((key, index) => key === seq.keys[index])
        );

        if (hasPartialMatch) {
          setCurrentSequence(newSequence);

          // Reset after timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          timeoutRef.current = setTimeout(() => {
            setCurrentSequence([]);
          }, timeout);
        } else {
          setCurrentSequence([]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [sequences, currentSequence, timeout, enabled]);

  return { currentSequence };
}
