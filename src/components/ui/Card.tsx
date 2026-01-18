import { useRef } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useMousePosition } from '@/hooks/useMousePosition';

interface CardProps {
  children: ReactNode;
  className?: string;
  glowOnHover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', glowOnHover = true, onClick }: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { position, isHovering } = useMousePosition(cardRef);

  return (
    <motion.div
      ref={cardRef}
      className={`
        relative overflow-hidden rounded-xl
        bg-bg-card backdrop-blur-xl
        border border-border
        transition-colors duration-200
        hover:border-border-hover
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ scale: onClick ? 1.01 : 1 }}
    >
      {/* Mouse tracking glow */}
      {glowOnHover && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            opacity: isHovering ? 1 : 0,
            background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(94, 106, 210, 0.1), transparent 40%)`,
          }}
        />
      )}

      {/* Top highlight */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
