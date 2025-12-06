import React from 'react';
import { GAME_HEIGHT, OBSTACLE_WIDTH, OBSTACLE_GAP, GROUND_HEIGHT } from '../constants';

interface ObstacleProps {
  x: number;
  gapY: number; // This is the center of the gap
}

export const Obstacle: React.FC<ObstacleProps> = ({ x, gapY }) => {
  const topObstacleHeight = gapY - OBSTACLE_GAP / 2;
  const bottomObstacleHeight = GAME_HEIGHT - (gapY + OBSTACLE_GAP / 2) - GROUND_HEIGHT;

  return (
    <>
      {/* Top Obstacle */}
      <div
        className="absolute bg-green-500 border-4 border-green-700 rounded-md shadow-lg"
        style={{
          left: `${x}px`,
          top: 0,
          width: `${OBSTACLE_WIDTH}px`,
          height: `${topObstacleHeight}px`,
          boxSizing: 'border-box'
        }}
      />
      {/* Bottom Obstacle */}
      <div
        className="absolute bg-green-500 border-4 border-green-700 rounded-md shadow-lg"
        style={{
          left: `${x}px`,
          bottom: `${GROUND_HEIGHT}px`,
          width: `${OBSTACLE_WIDTH}px`,
          height: `${bottomObstacleHeight}px`,
          boxSizing: 'border-box'
        }}
      />
    </>
  );
};
