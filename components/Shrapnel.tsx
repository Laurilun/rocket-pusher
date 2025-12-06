import React from 'react';
import { SHRAPNEL_SIZE } from '../constants';

interface ShrapnelProps {
  x: number;
  y: number;
  shapeSeed: number;
}

// Generate a pseudo-random polygonal shape, same as rocks but for shrapnel
const generateShapePoints = (seed: number, size: number): string => {
    const points: string[] = [];
    const numVertices = 7; // Fewer vertices for smaller fragments
    const angleStep = (2 * Math.PI) / numVertices;
    const radius = size / 2;

    for (let i = 0; i < numVertices; i++) {
        const angle = i * angleStep;
        // Use a simple seeded random function to vary the radius
        const randomFactor = 0.6 + ((Math.sin((seed + i) * 12.9898) * 43758.5453) % 1) * 0.4;
        const currentRadius = radius * randomFactor;
        const x = radius + currentRadius * Math.cos(angle);
        const y = radius + currentRadius * Math.sin(angle);
        points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
    }
    return points.join(' ');
};

const ShrapnelIcon: React.FC<{ shapeSeed: number }> = React.memo(({ shapeSeed }) => {
    const shapePoints = generateShapePoints(shapeSeed, SHRAPNEL_SIZE);
    return (
        <svg viewBox={`0 0 ${SHRAPNEL_SIZE} ${SHRAPNEL_SIZE}`} className="w-full h-full">
            <polygon points={shapePoints} fill="#a8a29e" />
        </svg>
    );
});


export const Shrapnel: React.FC<ShrapnelProps> = ({ x, y, shapeSeed }) => {
  return (
    <div
      className="absolute"
      style={{
        width: `${SHRAPNEL_SIZE}px`,
        height: `${SHRAPNEL_SIZE}px`,
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
        <ShrapnelIcon shapeSeed={shapeSeed} />
    </div>
  );
};