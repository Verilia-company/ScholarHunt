import { useState, useEffect, useRef, useCallback } from "react";
import React from "react";

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  elementRef: React.RefObject<Element | null>,
  {
    threshold = 0,
    root = null,
    rootMargin = "0%",
  }: IntersectionObserverInit = {}
): boolean {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, root, rootMargin]);

  return isVisible;
}

// Debounce hook for search inputs
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Local storage hook with SSR support
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );
  return [storedValue, setValue];
}

// Performance monitoring hook
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<{
    fcp?: number;
    lcp?: number;
    fid?: number;
    cls?: number;
  }>({});

  useEffect(() => {
    if (typeof window === "undefined") return;

    let fcpObserver: PerformanceObserver | null = null;
    let lcpObserver: PerformanceObserver | null = null;
    let clsObserver: PerformanceObserver | null = null;

    try {
      // First Contentful Paint
      if ("PerformanceObserver" in window) {
        fcpObserver = new PerformanceObserver((entryList) => {
          try {
            const entries = entryList.getEntries();
            const fcpEntry = entries.find(
              (entry) => entry.name === "first-contentful-paint"
            );
            if (fcpEntry) {
              setMetrics((prev) => ({ ...prev, fcp: fcpEntry.startTime }));
            }
          } catch (error) {
            console.warn("Error processing FCP metrics:", error);
          }
        });

        // Largest Contentful Paint
        lcpObserver = new PerformanceObserver((entryList) => {
          try {
            const entries = entryList.getEntries();
            const lcpEntry = entries[entries.length - 1];
            if (lcpEntry) {
              setMetrics((prev) => ({ ...prev, lcp: lcpEntry.startTime }));
            }
          } catch (error) {
            console.warn("Error processing LCP metrics:", error);
          }
        });

        // Cumulative Layout Shift
        clsObserver = new PerformanceObserver((entryList) => {
          try {
            let cls = 0;
            for (const entry of entryList.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                cls += (entry as any).value;
              }
            }
            setMetrics((prev) => ({ ...prev, cls }));
          } catch (error) {
            console.warn("Error processing CLS metrics:", error);
          }
        });

        // Observe with error handling
        fcpObserver.observe({ entryTypes: ["paint"] });
        lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
        clsObserver.observe({ entryTypes: ["layout-shift"] });
      }
    } catch (error) {
      console.warn("Performance monitoring not supported:", error);
    }

    return () => {
      try {
        fcpObserver?.disconnect();
        lcpObserver?.disconnect();
        clsObserver?.disconnect();
      } catch (error) {
        console.warn("Error disconnecting performance observers:", error);
      }
    };
  }, []);

  return metrics;
}

// Image lazy loading with placeholder
export function useLazyImage(src: string, placeholder: string = "") {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const imageRef = useRef<HTMLElement | null>(null);
  const isVisible = useIntersectionObserver(imageRef);

  useEffect(() => {
    if (isVisible && src) {
      try {
        const img = new Image();
        img.onload = () => {
          setImageSrc(src);
        };
        img.onerror = () => {
          console.warn(`Failed to load image: ${src}`);
          // Keep placeholder if loading fails
        };
        img.src = src;
      } catch (error) {
        console.warn(`Error loading image ${src}:`, error);
      }
    }
  }, [isVisible, src]);

  return [imageRef, imageSrc] as const;
}

// Optimized image component props
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
  priority?: boolean;
}

// Note: OptimizedImage component is available in performance.tsx
// This is the types-only version for performance.ts

// Prefetch utility for critical resources
export function usePrefetch(urls: string[]) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    urls.forEach((url) => {
      try {
        // Check if link already exists to avoid duplicates
        const existingLink = document.querySelector(`link[href="${url}"]`);
        if (existingLink) return;

        const link = document.createElement("link");
        link.rel = "prefetch";
        link.href = url;

        // Add error handling
        link.onerror = () => {
          console.warn(`Failed to prefetch resource: ${url}`);
        };

        document.head.appendChild(link);
      } catch (error) {
        console.warn(`Error prefetching ${url}:`, error);
      }
    });
  }, [urls]);
}

// Critical CSS inlining utility
export function inlineCriticalCSS() {
  if (typeof window === "undefined") return;

  // This would typically be done at build time
  // For now, we ensure critical styles are loaded first
  const criticalStyles = document.querySelectorAll("style[data-critical]");

  // Convert NodeList to Array to avoid issues with live collections
  const stylesArray = Array.from(criticalStyles);

  stylesArray.forEach((style) => {
    // Only move if not already at the top
    if (
      style.parentNode === document.head &&
      style !== document.head.firstElementChild
    ) {
      const clonedStyle = style.cloneNode(true);
      style.remove();
      document.head.insertBefore(clonedStyle, document.head.firstChild);
    }
  });
}
