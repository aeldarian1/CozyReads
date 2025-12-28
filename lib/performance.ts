/**
 * Performance optimization utilities.
 * Provides helpers for code splitting, lazy loading, and performance monitoring.
 */

import { ComponentType, lazy } from 'react';

/**
 * Lazy load a component with a loading fallback.
 * Automatically shows a loading state while the component loads.
 *
 * @example
 * const HeavyComponent = lazyLoad(() => import('./HeavyComponent'));
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc);

  return (props: React.ComponentProps<T>) => (
    <React.Suspense fallback={fallback || <LoadingFallback />}>
      <LazyComponent {...props} />
    </React.Suspense>
  );
}

/**
 * Default loading fallback component.
 */
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );
}

/**
 * Batch multiple operations to reduce re-renders.
 * Groups multiple state updates into a single render cycle.
 *
 * @example
 * const batch = createBatcher();
 * items.forEach(item => batch(() => updateItem(item)));
 * batch.flush();
 */
export function createBatcher<T>(delay = 16) {
  let queue: Array<() => T> = [];
  let timeoutId: NodeJS.Timeout | null = null;

  const flush = () => {
    const operations = [...queue];
    queue = [];
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    operations.forEach((op) => op());
  };

  const add = (operation: () => T) => {
    queue.push(operation);

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(flush, delay);
  };

  return { add, flush };
}

/**
 * Debounce a function to limit execution rate.
 * Useful for search inputs, resize handlers, etc.
 *
 * @example
 * const debouncedSearch = debounce(handleSearch, 300);
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return function debounced(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Throttle a function to limit execution frequency.
 * Ensures function is called at most once per time period.
 *
 * @example
 * const throttledScroll = throttle(handleScroll, 100);
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return function throttled(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Image optimization utilities.
 */
export const imageOptimization = {
  /**
   * Generate srcset for responsive images.
   */
  generateSrcSet: (baseUrl: string, widths: number[]): string => {
    return widths.map((width) => `${baseUrl}?w=${width} ${width}w`).join(', ');
  },

  /**
   * Get optimal image size based on container width.
   */
  getOptimalSize: (containerWidth: number): number => {
    const sizes = [320, 640, 768, 1024, 1280, 1536];
    return sizes.find((size) => size >= containerWidth) || sizes[sizes.length - 1];
  },

  /**
   * Lazy load images with Intersection Observer.
   */
  lazyLoadImage: (img: HTMLImageElement, src: string) => {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            img.src = src;
            img.classList.add('loaded');
            observer.disconnect();
          }
        });
      });

      observer.observe(img);
    } else {
      // Fallback for browsers without IntersectionObserver
      img.src = src;
    }
  },

  /**
   * Preload critical images.
   */
  preloadImage: (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  },
};

/**
 * Performance monitoring utilities.
 */
export const performance = {
  /**
   * Measure component render time.
   */
  measureRender: (componentName: string, callback: () => void) => {
    const startTime = Date.now();
    callback();
    const endTime = Date.now();
    const duration = endTime - startTime;

    if (duration > 16) {
      // Longer than one frame (16ms at 60fps)
      console.warn(`Slow render: ${componentName} took ${duration}ms`);
    }

    return duration;
  },

  /**
   * Track long tasks (>50ms).
   */
  trackLongTask: async (taskName: string, task: () => Promise<any>) => {
    const startTime = Date.now();
    const result = await task();
    const duration = Date.now() - startTime;

    if (duration > 50) {
      console.warn(`Long task: ${taskName} took ${duration}ms`);
    }

    return result;
  },

  /**
   * Get current memory usage (if available).
   */
  getMemoryUsage: (): number | null => {
    if ('memory' in performance && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return null;
  },
};

/**
 * Network request optimization.
 */
export const networkOptimization = {
  /**
   * Batch multiple API requests.
   */
  batchRequests: async <T>(
    requests: Array<() => Promise<T>>,
    batchSize = 5
  ): Promise<T[]> => {
    const results: T[] = [];

    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map((req) => req()));
      results.push(...batchResults);

      // Small delay between batches to avoid overwhelming server
      if (i + batchSize < requests.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return results;
  },

  /**
   * Retry failed requests with exponential backoff.
   */
  retryWithBackoff: async <T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<T> => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  },
};

/**
 * Cache utilities for client-side caching.
 */
export class ClientCache<T> {
  private cache = new Map<string, { value: T; expiry: number }>();

  constructor(private defaultTTL = 5 * 60 * 1000) {} // 5 minutes default

  set(key: string, value: T, ttl = this.defaultTTL): void {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl,
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

// Import React for Suspense
import * as React from 'react';
