import { useCallback, useEffect, useRef, useState } from 'react';

export function useInView<T extends HTMLElement = HTMLElement>(threshold = 0.15, triggerOnce = true) {
  const [inView, setInView] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback(
    (node: T | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (!node) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setInView(true);
            if (triggerOnce) observer.unobserve(node);
          } else if (!triggerOnce) {
            setInView(false);
          }
        },
        { threshold },
      );

      observer.observe(node);
      observerRef.current = observer;
    },
    [threshold, triggerOnce],
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  return { ref, inView };
}
