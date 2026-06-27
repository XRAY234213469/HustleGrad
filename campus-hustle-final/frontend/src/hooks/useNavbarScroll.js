// frontend/src/hooks/useNavbarScroll.js
// Adds .scrolled class to .navbar when user scrolls past 20px
import { useEffect } from 'react';

const useNavbarScroll = () => {
  useEffect(() => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const handler = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    };

    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);
};

export default useNavbarScroll;
