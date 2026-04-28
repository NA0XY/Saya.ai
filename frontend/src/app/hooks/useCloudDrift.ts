import { useEffect, useRef } from 'react';

declare global {
  interface Window { gsap?: any; }
}

export function useCloudDrift(containerRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const gsap = window.gsap;
    if (!gsap || !containerRef.current) return;

    const clouds = containerRef.current.querySelectorAll('.cloud');
    const animations: any[] = [];

    clouds.forEach((cloud) => {
      const xDir = Math.random() > 0.5 ? 1 : -1;
      const yDir = Math.random() > 0.5 ? 1 : -1;
      const duration = 8 + Math.random() * 6;

      const anim = gsap.to(cloud, {
        x: `+=${xDir * (20 + Math.random() * 15)}`,
        y: `+=${yDir * (10 + Math.random() * 10)}`,
        duration,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: Math.random() * 2,
      });
      animations.push(anim);
    });

    return () => { animations.forEach(a => a.kill()); };
  }, [containerRef]);
}
