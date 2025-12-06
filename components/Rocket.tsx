import React from 'react';
import { ROCKET_WIDTH, ROCKET_HEIGHT, ROCKET_X_POSITION } from '../constants';

interface RocketProps {
  y: number;
  rotation: number;
  isAscending: boolean;
}

const RocketIcon: React.FC = () => (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg" style={{ transform: 'rotate(90deg)' }}>
        <path d="M16 2L10 12H13V22H19V12H22L16 2Z" fill="#E5E7EB"/>
        <path d="M16 2L19 22H19V12L22 12L16 2Z" fill="#D1D5DB"/>
        <path d="M13 22L10 28L13 30L16 22H13Z" fill="#F87171"/>
        <path d="M19 22L22 28L19 30L16 22H19Z" fill="#EF4444"/>
        <path d="M16 22L13 30H19L16 22Z" fill="#FCD34D"/>
    </svg>
);

const Exhaust: React.FC<{ isAscending: boolean }> = ({ isAscending }) => {
    const flameScale = isAscending ? 1.2 : 0.6;
    const animationDuration = isAscending ? '100ms' : '200ms';
    return (
        <div className="absolute left-[-25px] top-1/2 -translate-y-1/2 w-16 h-16">
            <div 
                className="absolute bg-orange-400 rounded-full"
                style={{
                    width: '100%',
                    height: '100%',
                    transform: `scale(${flameScale * 0.8}, ${flameScale * Math.random() * 0.5})`,
                    opacity: 0.8,
                    transition: `transform ${animationDuration} ease-out`,
                    filter: 'blur(10px)',
                }}
            />
            <div 
                className="absolute bg-yellow-300 rounded-full"
                style={{
                    width: '70%',
                    height: '70%',
                    left: '15%',
                    top: '15%',
                    transform: `scale(${flameScale}, ${flameScale * Math.random()})`,
                    opacity: 0.9,
                    transition: `transform ${animationDuration} ease-out`,
                    filter: 'blur(5px)',
                }}
            />
        </div>
    );
};


export const Rocket: React.FC<RocketProps> = ({ y, rotation, isAscending }) => {
  return (
    <div
      className="absolute"
      style={{
        width: `${ROCKET_WIDTH}px`,
        height: `${ROCKET_HEIGHT}px`,
        left: `${ROCKET_X_POSITION}px`,
        top: `${y}px`,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center',
        transition: 'transform 100ms linear',
      }}
    >
      <Exhaust isAscending={isAscending} />
      <RocketIcon />
    </div>
  );
};
