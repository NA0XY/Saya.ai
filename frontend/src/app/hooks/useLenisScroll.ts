import { useEffect, useRef } from 'react';

declare global {
  interface Window { Lenis?: any; }
}

export function useLenisScroll() {
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    if (!window.Lenis) return;

    const lenis = new window.Lenis();
    lenisRef.current = lenis;
    const dotsContainer = document.querySelector('.dots-container') as HTMLElement;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    lenis.on('scroll', ({ scroll }: { scroll: number }) => {
      if (dotsContainer) {
        dotsContainer.style.backgroundPosition = `center ${scroll * 0.5}px`;
      }
    });

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return lenisRef;
}
