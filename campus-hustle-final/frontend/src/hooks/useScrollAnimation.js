// frontend/src/hooks/useScrollAnimation.js
// Drives the data-animate and data-animate-stagger CSS classes via IntersectionObserver.
// Drop this hook into index.js once — it observes the entire document automatically.

import { useEffect } from 'react';

const useScrollAnimation = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            // Un-observe after first trigger for performance
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    const observe = () => {
      document
        .querySelectorAll('[data-animate], [data-animate-stagger]')
        .forEach((el) => observer.observe(el));
    };

    observe();

    // Re-run on DOM changes (new routes render new elements)
    const mutationObserver = new MutationObserver(observe);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
};

export default useScrollAnimation;
