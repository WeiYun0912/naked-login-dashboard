import { useState, useEffect, useCallback } from 'react';
import type { RefObject } from 'react';

interface MousePosition {
  x: number;
  y: number;
}

export function useMousePosition(ref?: RefObject<HTMLElement | null>) {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (ref?.current) {
      const rect = ref.current.getBoundingClientRect();
      setPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    } else {
      setPosition({ x: e.clientX, y: e.clientY });
    }
  }, [ref]);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  useEffect(() => {
    const target = ref?.current ?? document;

    target.addEventListener('mousemove', handleMouseMove as EventListener);

    if (ref?.current) {
      ref.current.addEventListener('mouseenter', handleMouseEnter);
      ref.current.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      target.removeEventListener('mousemove', handleMouseMove as EventListener);
      if (ref?.current) {
        ref.current.removeEventListener('mouseenter', handleMouseEnter);
        ref.current.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [ref, handleMouseMove, handleMouseEnter, handleMouseLeave]);

  return { position, isHovering };
}
