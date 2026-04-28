import { useEffect, useRef } from 'react';

declare global {
  interface Window { p5?: any; }
}

class RainDrop {
  x: number; y: number; length: number; thickness: number;
  speed: number; gravity: number; angle: number;
  w: number; h: number;

  constructor(w: number, h: number) {
    this.w = w; this.h = h;
    this.angle = -Math.PI / 12;
    this.gravity = 0.5;
    this.x = 0; this.y = 0; this.length = 0;
    this.thickness = 0; this.speed = 0;
    this.reset();
  }

  reset() {
    this.x = Math.random() * (this.w + 100);
    this.y = Math.random() * -300 - 50;
    this.length = 20 + Math.random() * 30;
    this.thickness = 1 + Math.random() * 2;
    this.speed = 5 + Math.random() * 5;
  }

  update() {
    this.x += this.speed * this.gravity * Math.sin(this.angle);
    this.y += this.speed * this.gravity * Math.cos(this.angle);
    if (this.y > this.h + this.length || this.x < -100 || this.x > this.w + 100) {
      this.reset();
    }
  }

  draw(ctx: CanvasRenderingContext2D, opacity: number) {
    const endX = this.x + this.length * Math.sin(this.angle);
    const endY = this.y + this.length * Math.cos(this.angle);
    const segments = 5;
    for (let i = 0; i < segments; i++) {
      const sx = this.x + (i / segments) * (endX - this.x);
      const sy = this.y + (i / segments) * (endY - this.y);
      const ex = this.x + ((i + 1) / segments) * (endX - this.x);
      const ey = this.y + ((i + 1) / segments) * (endY - this.y);
      const progress = i / (segments - 1);
      const alpha = (0.08 + progress * 0.92) * opacity;
      ctx.strokeStyle = `rgba(217,217,217,${alpha})`;
      ctx.lineWidth = this.thickness;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }
    ctx.fillStyle = `rgba(217,217,217,${opacity})`;
    ctx.beginPath();
    ctx.arc(endX, endY, this.thickness * 0.75, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function useRainAnimation(containerRef: React.RefObject<HTMLDivElement | null>) {
  const animRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drops: RainDrop[] = [];
    const maxDrops = 250;
    const opacity = 0.3;

    function resize() {
      canvas.width = container!.offsetWidth;
      canvas.height = container!.offsetHeight;
      drops.forEach(d => { d.w = canvas.width; d.h = canvas.height; });
    }
    resize();
    window.addEventListener('resize', resize);

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (drops.length < maxDrops) {
        const add = Math.min(5, maxDrops - drops.length);
        for (let i = 0; i < add; i++) drops.push(new RainDrop(canvas.width, canvas.height));
      }
      drops.forEach(d => { d.draw(ctx, opacity); d.update(); });
      animRef.current = requestAnimationFrame(animate);
    }
    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      canvas.remove();
    };
  }, [containerRef]);
}
