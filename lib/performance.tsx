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

    // First Contentful Paint
    const fcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const fcpEntry = entries.find(
        (entry) => entry.name === "first-contentful-paint"
      );
      if (fcpEntry) {
        setMetrics((prev) => ({ ...prev, fcp: fcpEntry.startTime }));
      }
    });

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lcpEntry = entries[entries.length - 1];
      if (lcpEntry) {
        setMetrics((prev) => ({ ...prev, lcp: lcpEntry.startTime }));
      }
    });

    // Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((entryList) => {
      let cls = 0;
      for (const entry of entryList.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          cls += (entry as any).value;
        }
      }
      setMetrics((prev) => ({ ...prev, cls }));
    });

    try {
      fcpObserver.observe({ entryTypes: ["paint"] });
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
      clsObserver.observe({ entryTypes: ["layout-shift"] });
    } catch (error) {
      console.warn("Performance monitoring not supported:", error);
    }

    return () => {
      fcpObserver.disconnect();
      lcpObserver.disconnect();
      clsObserver.disconnect();
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
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
      };
      img.src = src;
    }
  }, [isVisible, src]);

  return [imageRef, imageSrc] as const;
}

// Optimized image component
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
  priority?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  placeholder = "",
  priority = false,
}: OptimizedImageProps) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imageSrc, setImageSrc] = useState(priority ? src : placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const isVisible = useIntersectionObserver(imgRef, { rootMargin: "50px" });

  useEffect(() => {
    if (!priority && isVisible && src && !isLoaded) {
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
      img.onerror = () => {
        setHasError(true);
      };
      img.src = src;
    }
  }, [isVisible, src, priority, isLoaded]);

  if (hasError) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-400 text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={`transition-opacity duration-300 ${
        isLoaded ? "opacity-100" : "opacity-50"
      } ${className}`}
      loading={priority ? "eager" : "lazy"}
      onLoad={() => setIsLoaded(true)}
      onError={() => setHasError(true)}
    />
  );
}

// Prefetch utility for critical resources
export function usePrefetch(urls: string[]) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    urls.forEach((url) => {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = url;
      document.head.appendChild(link);
    });
  }, [urls]);
}

// Critical CSS inlining utility
export function inlineCriticalCSS() {
  if (typeof window === "undefined") return;

  // This would typically be done at build time
  // For now, we ensure critical styles are loaded first
  const criticalStyles = document.querySelectorAll("style[data-critical]");
  criticalStyles.forEach((style) => {
    style.remove();
    document.head.insertBefore(style, document.head.firstChild);
  });
}
