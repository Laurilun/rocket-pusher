import React from 'react';

interface TargetProps {
  x: number;
  y: number;
  size: number;
  health: number;
  maxHealth: number;
  isSolid: boolean;
  isCracked: boolean;
  shapeSeed: number;
  rotation: number;
  type: string;
}

// Generate a pseudo-random polygonal shape for a rock
const generateShapePoints = (seed: number, size: number): string => {
    const points: string[] = [];
    const numVertices = 9;
    const angleStep = (2 * Math.PI) / numVertices;
    const radius = size / 2;

    for (let i = 0; i < numVertices; i++) {
        const angle = i * angleStep;
        // Use a simple seeded random function to vary the radius
        const randomFactor = 0.7 + ((Math.sin((seed + i) * 12.9898) * 43758.5453) % 1) * 0.3;
        const currentRadius = radius * randomFactor;
        const x = radius + currentRadius * Math.cos(angle);
        const y = radius + currentRadius * Math.sin(angle);
        points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
    }
    return points.join(' ');
};

const RockIcon: React.FC<Omit<TargetProps, 'x' | 'y' | 'rotation'>> = React.memo(({ size, health, maxHealth, type, shapeSeed }) => {
    const shapePoints = generateShapePoints(shapeSeed, size);
    const damageLevel = 1 - (health / maxHealth);
    
    // Hittable (small) rocks are light gray, dangerous rocks are dark gray
    const fillColor = type === 'small' ? '#78716c' : '#44403c';
    
    return (
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full drop-shadow-md">
            <polygon points={shapePoints} fill={fillColor} stroke="#292524" strokeWidth="2" />
            {/* Render cracks based on damage */}
            {damageLevel > 0.1 && (
                <path d={`M ${size*0.3},${size*0.2} L ${size*0.4},${size*0.4} L ${size*0.2},${size*0.5}`} stroke="rgba(0,0,0,0.5)" strokeWidth="1" fill="none" />
            )}
            {damageLevel > 0.5 && (
                <path d={`M ${size*0.7},${size*0.8} L ${size*0.6},${size*0.6} L ${size*0.8},${size*0.5}`} stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" fill="none" />
            )}
        </svg>
    );
});


export const Target: React.FC<TargetProps> = (props) => {
  const { x, y, size, rotation } = props;
  return (
    <div
      className="absolute"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${size}px`,
        height: `${size}px`,
        transform: `rotate(${rotation}deg)`,
      }}
    >
       <RockIcon {...props} />
    </div>
  );
};