import { useState, useCallback, useRef } from 'react';

interface CarouselState {
  positions: { left: number; center: number; right: number };
  touchEnabled: boolean;
}

export function useCarousel(totalSlides: number) {
  const [state, setState] = useState<CarouselState>({
    positions: { left: 0, center: 1, right: 2 },
    touchEnabled: true,
  });
  const dragStartX = useRef(0);
  const isDragging = useRef(false);

  const slideLeft = useCallback(() => {
    setState(prev => {
      if (!prev.touchEnabled) return prev;
      const newPos = {
        left: (prev.positions.left - 1 + totalSlides) % totalSlides,
        center: (prev.positions.center - 1 + totalSlides) % totalSlides,
        right: (prev.positions.right - 1 + totalSlides) % totalSlides,
      };
      setTimeout(() => setState(s => ({ ...s, touchEnabled: true })), 600);
      return { positions: newPos, touchEnabled: false };
    });
  }, [totalSlides]);

  const slideRight = useCallback(() => {
    setState(prev => {
      if (!prev.touchEnabled) return prev;
      const newPos = {
        left: (prev.positions.left + 1) % totalSlides,
        center: (prev.positions.center + 1) % totalSlides,
        right: (prev.positions.right + 1) % totalSlides,
      };
      setTimeout(() => setState(s => ({ ...s, touchEnabled: true })), 600);
      return { positions: newPos, touchEnabled: false };
    });
  }, [totalSlides]);

  const getPositionClass = useCallback((index: number) => {
    if (index === state.positions.left) return 'position-left';
    if (index === state.positions.center) return 'position-center';
    if (index === state.positions.right) return 'position-right';
    return 'position-none';
  }, [state.positions]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
  }, []);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const diff = dragStartX.current - e.clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? slideRight() : slideLeft();
    }
  }, [slideLeft, slideRight]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const diff = dragStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? slideRight() : slideLeft();
    }
  }, [slideLeft, slideRight]);

  return {
    activeIndex: state.positions.center,
    getPositionClass,
    slideLeft,
    slideRight,
    handleMouseDown,
    handleMouseUp,
    handleTouchStart,
    handleTouchEnd,
  };
}
