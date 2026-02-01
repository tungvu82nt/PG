/**
 * Performance utilities for frontend optimization
 */

/**
 * Lazy load images with intersection observer
 */
export class LazyImageLoader {
  private observer: IntersectionObserver | null = null;
  private images: Set<HTMLImageElement> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              this.loadImage(img);
            }
          });
        },
        {
          rootMargin: '50px',
          threshold: 0.1,
        }
      );
    }
  }

  observe(img: HTMLImageElement) {
    if (this.observer && img.dataset.src) {
      this.images.add(img);
      this.observer.observe(img);
    }
  }

  unobserve(img: HTMLImageElement) {
    if (this.observer) {
      this.images.delete(img);
      this.observer.unobserve(img);
    }
  }

  private loadImage(img: HTMLImageElement) {
    if (img.dataset.src) {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
      this.unobserve(img);
    }
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.images.clear();
    }
  }
}

/**
 * Memory-efficient cache with LRU eviction
 */
export class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;

  return ((...args: Parameters<T>) => {
    const currentTime = Date.now();

    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  }) as T;
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout | null = null;

  return ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}

/**
 * Measure and log performance
 */
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();

  start(name: string): void {
    this.marks.set(name, performance.now());
  }

  end(name: string): number {
    const startTime = this.marks.get(name);
    if (startTime === undefined) {
      console.warn(`Performance mark "${name}" not found`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.marks.delete(name);
    
    console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
    return duration;
  }

  measure(name: string, fn: () => void): number {
    this.start(name);
    fn();
    return this.end(name);
  }

  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.start(name);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Virtual scrolling helper for large lists
 */
export interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export function calculateVirtualScrollItems(
  scrollTop: number,
  totalItems: number,
  options: VirtualScrollOptions
) {
  const { itemHeight, containerHeight, overscan = 5 } = options;
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight),
    totalItems - 1
  );

  const start = Math.max(0, visibleStart - overscan);
  const end = Math.min(totalItems - 1, visibleEnd + overscan);

  return {
    start,
    end,
    visibleStart,
    visibleEnd,
    offsetY: start * itemHeight,
  };
}