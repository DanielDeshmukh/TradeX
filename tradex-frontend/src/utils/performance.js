import { lazy, Suspense } from "react";

export function lazyLoad(importFunc, fallback = null) {
  const LazyComponent = lazy(importFunc);
  
  return function LazyLoadWrapper(props) {
    return (
      <Suspense fallback={fallback || <div className="animate-pulse bg-surface rounded-lg h-32" />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

export function memoCompare(prev, next) {
  return JSON.stringify(prev) === JSON.stringify(next);
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export function measurePerformance(name, fn) {
  return async function(...args) {
    const start = performance.now();
    const result = await fn.apply(this, args);
    const end = performance.now();
    console.log(`${name} took ${end - start}ms`);
    return result;
  };
}
