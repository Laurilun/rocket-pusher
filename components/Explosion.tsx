import React, { useEffect, useState } from 'react';
import { EXPLOSION_DURATION } from '../constants';

interface ExplosionProps {
  x: number;
  y: number;
}

export const Explosion: React.FC<ExplosionProps> = ({ x, y }) => {
  const [isExploding, setIsExploding] = useState(false);

  useEffect(() => {
    // Trigger animation after the component mounts to allow CSS transitions to work.
    requestAnimationFrame(() => {
        setIsExploding(true);
    });
  }, []);

  return (
    <div className="absolute" style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}>
      {/* Create 8 particles for the explosion effect */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute bg-yellow-400 rounded-sm"
          style={{
            width: '4px',
            height: '20px',
            transformOrigin: 'center bottom',
            // Position each particle in a circle
            transform: `rotate(${i * 45}deg) translateY(${isExploding ? '-40px' : '-10px'})`,
            opacity: isExploding ? 0 : 1,
            transition: `all ${EXPLOSION_DURATION}ms ease-out`,
          }}
        />
      ))}
    </div>
  );
};