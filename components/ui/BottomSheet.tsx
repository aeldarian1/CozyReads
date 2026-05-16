'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { animationPresets } from '@/lib/animations';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  snapPoints?: number[]; // Percentage heights [0.5, 0.9] = 50%, 90%
  defaultSnap?: number; // Default snap point index
  showHandle?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnSwipeDown?: boolean;
}

/**
 * Bottom sheet component optimized for mobile devices.
 * Slides up from the bottom with swipe-to-dismiss functionality.
 *
 * @example
 * <BottomSheet
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   title="Select Collection"
 *   snapPoints={[0.5, 0.9]}
 * >
 *   <div>Content here</div>
 * </BottomSheet>
 */
export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  snapPoints = [0.9],
  defaultSnap = 0,
  showHandle = true,
  closeOnBackdropClick = true,
  closeOnSwipeDown = true,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    // Prevent body scroll when sheet is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!closeOnSwipeDown) return;
    isDragging.current = true;
    dragStartY.current = e.touches[0].clientY;
    currentY.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !sheetRef.current) return;

    const deltaY = e.touches[0].clientY - dragStartY.current;

    // Only allow dragging down
    if (deltaY > 0) {
      currentY.current = deltaY;
      sheetRef.current.style.transform = `translateY(${deltaY}px)`;
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.current || !sheetRef.current) return;

    isDragging.current = false;

    // If dragged down more than 100px, close the sheet
    if (currentY.current > 100) {
      onClose();
    } else {
      // Snap back to original position
      sheetRef.current.style.transform = 'translateY(0)';
    }

    currentY.current = 0;
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const heightPercentage = snapPoints[defaultSnap] * 100;

  const sheetContent = (
    <div
      className="fixed inset-0 z-[9999] animate-fadeIn"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'bottom-sheet-title' : undefined}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl animate-slideUp"
        style={{
          maxHeight: `${heightPercentage}vh`,
          transition: isDragging.current ? 'none' : 'transform 0.3s cubic-bezier(0, 0, 0.2, 1)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag Handle */}
        {showHandle && (
          <div className="flex justify-center py-3">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>
        )}

        {/* Header */}
        {title && (
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2
                id="bottom-sheet-title"
                className="text-xl font-bold text-gray-900"
              >
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto overscroll-contain" style={{ maxHeight: 'calc(100% - 120px)' }}>
          <div className="px-6 py-4">
            {children}
          </div>
        </div>

        {/* Safe area padding for iOS */}
        <div className="h-safe-bottom" />
      </div>
    </div>
  );

  return createPortal(sheetContent, document.body);
}

/**
 * Hook to detect if the device is mobile
 */
export function useIsMobile(breakpoint: number = 768): boolean {
  if (typeof window === 'undefined') return false;

  const [isMobile, setIsMobile] = React.useState(window.innerWidth < breakpoint);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
}

// Import React for the hook
import * as React from 'react';
