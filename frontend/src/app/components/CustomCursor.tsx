import { useEffect, useRef, useState } from 'react';

type Emotion = 'happy-normal' | 'playful' | 'sad' | 'serious' | 'worried';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const requestRef = useRef<number>();
  
  // State machine refs
  const currentEmotionRef = useRef<Emotion>('happy-normal');
  const lastMouseTimeRef = useRef<number>(Date.now());
  const isHoveringRef = useRef(false);
  const textEmotionRef = useRef<Emotion | null>(null);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Preload images to avoid flickering
    const emotions: Emotion[] = ['happy-normal', 'playful', 'sad', 'serious', 'worried'];
    emotions.forEach(emotion => {
      const img = new Image();
      img.src = `/assets/emotions/${emotion}.png`;
    });

    const checkMobile = () => {
      setIsMobile(window.matchMedia('(hover: none) and (pointer: coarse)').matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const cursor = cursorRef.current;
    if (!cursor) return;

    let hasMoved = false;

    const updateEmotion = (emotion: Emotion) => {
      if (currentEmotionRef.current !== emotion) {
        currentEmotionRef.current = emotion;
        if (cursor) {
          cursor.style.backgroundImage = `url('/assets/emotions/${emotion}.png')`;
        }
      }
    };

    const updateCursorPosition = () => {
      if (hasMoved) {
        const dx = targetRef.current.x - positionRef.current.x;
        const dy = targetRef.current.y - positionRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const timeSinceLastMove = Date.now() - lastMouseTimeRef.current;
        
        // Emotion state machine
        if (textEmotionRef.current && distance < 20) {
          updateEmotion(textEmotionRef.current); // Text context overrides if not whipping mouse
        } else if (isHoveringRef.current) {
          updateEmotion('playful');
        } else if (timeSinceLastMove > 4000) {
          updateEmotion('sad'); // Very idle -> sad
        } else if (timeSinceLastMove > 2000) {
          updateEmotion('worried'); // Mildly idle -> worried
        } else if (distance > 40) {
          updateEmotion('serious'); // Moving very fast -> serious/determined
        } else if (distance > 15) {
          updateEmotion('playful'); // Moving fast -> playful
        } else if (distance < 5 && timeSinceLastMove > 100) {
          updateEmotion('happy-normal'); // Normal -> happy
        }

        // Smooth easing (lerp)
        positionRef.current.x += dx * 0.2;
        positionRef.current.y += dy * 0.2;
        
        if (cursor) {
          cursor.style.left = `${positionRef.current.x}px`;
          cursor.style.top = `${positionRef.current.y}px`;
        }
      }
      requestRef.current = requestAnimationFrame(updateCursorPosition);
    };

    requestRef.current = requestAnimationFrame(updateCursorPosition);

    let lastAnalysisTime = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current.x = e.clientX;
      targetRef.current.y = e.clientY;
      lastMouseTimeRef.current = Date.now();
      
      if (!hasMoved) {
        hasMoved = true;
        positionRef.current.x = e.clientX;
        positionRef.current.y = e.clientY;
      }

      // Continual text analysis (throttled to 100ms)
      const now = Date.now();
      if (now - lastAnalysisTime > 100) {
        lastAnalysisTime = now;
        let target = e.target as HTMLElement;
        if (target && target.nodeType === Node.TEXT_NODE && target.parentElement) {
          target = target.parentElement;
        }

        const validTextTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'a', 'button', 'li', 'strong', 'em', 'label', 'div'];
        
        if (target && validTextTags.includes(target.tagName?.toLowerCase())) {
          const text = target.innerText?.toLowerCase() || target.textContent?.toLowerCase() || '';
          
          if (text.length > 0 && text.length < 500) {
            const sadKeywords = ['sad', 'bad', 'error', 'warning', 'fail', 'wrong', 'difficult', 'lonely', 'sorry', 'miss', 'missed', 'pain', 'hurt', 'avoid', '⚠️'];
            const happyKeywords = ['happy', 'joy', 'great', 'excellent', 'good', 'love', 'awesome', 'perfect', 'success', 'yay', 'smile', '😊', '🎉', 'welcome', 'upcoming', 'scheduled', 'completed', 'upcoming calls'];
            const seriousKeywords = ['important', 'security', 'privacy', 'settings', 'danger', 'alert', 'caution', 'medical', 'doctor', 'prescription', 'drug', 'precautions', '🛡️', '💊'];

            if (happyKeywords.some(kw => text.includes(kw))) {
              textEmotionRef.current = 'happy-normal';
            } else if (sadKeywords.some(kw => text.includes(kw))) {
              textEmotionRef.current = 'sad';
            } else if (seriousKeywords.some(kw => text.includes(kw))) {
              textEmotionRef.current = 'serious';
            } else {
              textEmotionRef.current = null;
            }
          } else {
            textEmotionRef.current = null;
          }
        } else {
          textEmotionRef.current = null;
        }
      }
    };

    const handleMouseLeave = () => { /* no-op */ };
    const handleMouseEnter = () => { /* no-op */ };
    
    const handleMouseDown = () => { 
      if (cursor) cursor.classList.add('clicking');
      if (!textEmotionRef.current) updateEmotion('playful');
    };
    const handleMouseUp = () => { 
      if (cursor) cursor.classList.remove('clicking'); 
    };

    const handleMouseOver = (e: MouseEvent) => {
      let target = e.target as HTMLElement;
      if (target && target.nodeType === Node.TEXT_NODE && target.parentElement) {
        target = target.parentElement;
      }
      
      // Check hover interactability
      if (
        target?.tagName?.toLowerCase() === 'a' ||
        target?.tagName?.toLowerCase() === 'button' ||
        target?.tagName?.toLowerCase() === 'input' ||
        target?.closest?.('a') ||
        target?.closest?.('button') ||
        target?.closest?.('input') ||
        getComputedStyle(target).cursor === 'pointer'
      ) {
        isHoveringRef.current = true;
        if (cursor) cursor.classList.add('hovering');
      } else {
        isHoveringRef.current = false;
        if (cursor) cursor.classList.remove('hovering');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  if (isMobile) return null;

  return (
    <div
      id="custom-cursor"
      ref={cursorRef}
      style={{ backgroundImage: `url('/assets/emotions/happy-normal.png')` }}
    />
  );
}
