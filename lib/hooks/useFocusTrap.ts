import { useEffect, RefObject } from 'react';

/**
 * Focus trap hook for modals and dialogs.
 * Ensures focus stays within the container and manages Tab navigation.
 *
 * @param ref - Reference to the container element
 * @param isActive - Whether the focus trap is active
 * @param options - Configuration options
 *
 * @example
 * const modalRef = useRef<HTMLDivElement>(null);
 * useFocusTrap(modalRef, isOpen, { returnFocus: true });
 */
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  isActive: boolean,
  options: {
    returnFocus?: boolean;
    initialFocus?: string; // CSS selector for initial focus element
  } = {}
) {
  const { returnFocus = true, initialFocus } = options;

  useEffect(() => {
    if (!isActive || !ref.current) return;

    const container = ref.current;
    const previouslyFocused = document.activeElement as HTMLElement;

    // Get all focusable elements
    const getFocusableElements = (): HTMLElement[] => {
      const selector = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]',
      ].join(', ');

      return Array.from(container.querySelectorAll(selector)).filter(
        (el) => {
          // Filter out hidden elements
          const element = el as HTMLElement;
          return (
            element.offsetParent !== null &&
            !element.hasAttribute('aria-hidden') &&
            getComputedStyle(element).visibility !== 'hidden'
          );
        }
      ) as HTMLElement[];
    };

    // Focus the initial element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      if (initialFocus) {
        const initialElement = container.querySelector(initialFocus) as HTMLElement;
        initialElement?.focus();
      } else {
        focusableElements[0]?.focus();
      }
    }

    // Handle Tab key navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement;

      // Shift + Tab on first element -> focus last
      if (e.shiftKey && activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
      // Tab on last element -> focus first
      else if (!e.shiftKey && activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      container.removeEventListener('keydown', handleKeyDown);

      // Return focus to previously focused element
      if (returnFocus && previouslyFocused) {
        previouslyFocused.focus();
      }
    };
  }, [ref, isActive, returnFocus, initialFocus]);
}

/**
 * Hook to manage focus within a roving tabindex pattern.
 * Useful for grid/list navigation with arrow keys.
 *
 * @example
 * const { focusedIndex, setFocusedIndex } = useRovingTabIndex(items.length);
 */
export function useRovingTabIndex(itemCount: number) {
  const [focusedIndex, setFocusedIndex] = React.useState(0);

  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    let newIndex = currentIndex;

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        newIndex = Math.min(currentIndex + 1, itemCount - 1);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = itemCount - 1;
        break;
    }

    if (newIndex !== currentIndex) {
      setFocusedIndex(newIndex);
    }
  };

  return {
    focusedIndex,
    setFocusedIndex,
    handleKeyDown,
    getTabIndex: (index: number) => (index === focusedIndex ? 0 : -1),
  };
}

// Import React for useState
import * as React from 'react';
