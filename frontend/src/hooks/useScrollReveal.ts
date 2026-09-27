import { useEffect } from 'react';

/**
 * useScrollReveal Hook
 * Observes all elements with the .scroll-reveal class.
 * When they scroll into view, adds .is-revealed class
 * to trigger smooth, cinematic 1.25s CSS transitions.
 */
export function useScrollReveal() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkVisibility = () => {
      const triggerBottom = window.innerHeight * 0.94;
      document.querySelectorAll('.scroll-reveal:not(.is-revealed)').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= triggerBottom) {
          el.classList.add('is-revealed');
        }
      });
    };

    // If IntersectionObserver is supported, use it as primary trigger
    let observer: IntersectionObserver | null = null;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed');
              observer?.unobserve(entry.target);
            }
          });
        },
        {
          root: null,
          rootMargin: '0px 0px -20px 0px',
          threshold: 0.05,
        }
      );

      document.querySelectorAll('.scroll-reveal').forEach((el) => {
        observer?.observe(el);
      });
    }

    // Scroll and resize event fallback and immediate check
    window.addEventListener('scroll', checkVisibility, { passive: true });
    window.addEventListener('resize', checkVisibility, { passive: true });

    // Initial check for elements already near viewport
    checkVisibility();
    const timer = setTimeout(checkVisibility, 200);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', checkVisibility);
      window.removeEventListener('resize', checkVisibility);
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);
}
