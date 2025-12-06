
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 500;

// Rocket physics
export const ASCEND_FORCE = -0.3; // Negative is up
export const DESCEND_FORCE = 0.2;
export const MAX_VERTICAL_VELOCITY = 7;
export const VELOCITY_DAMPING = 0.99; // Slight air friction
export const ROCKET_PUSH_FORCE = 3;
export const ROCKET_RECOIL = 0.8;
export const ROCKET_ROTATION_IMPACT_FACTOR = 0.5;

// Rocket properties
export const ROCKET_WIDTH = 80;
export const ROCKET_HEIGHT = 50;
export const ROCKET_X_POSITION = 100;
export const ROCKET_HITBOX_INSET_X = 20;
export const ROCKET_HITBOX_INSET_Y = 15;

// Rock properties
export const ROCK_SPAWN_INTERVAL = 40; // Lower is more frequent
export const TARGET_SPEED_MIN = 1.5;
export const TARGET_SPEED_MAX = 3.5;
export const TARGET_SPAWN_VELOCITY_Y_MAX = 0.5;
export const ROCK_HITBOX_SCALE = 0.9; // Use 90% of the rock's size for collision
export const ROCK_DAMPING = 0.998;
export const ROCK_COLLISION_DAMAGE = 0.5;
export const MAX_ROCK_ROTATION_SPEED = 2; // Degrees per frame on spawn
export const MAX_ABSOLUTE_ROTATION_SPEED = 5; // Max speed after collisions
export const ROCK_ROTATION_IMPACT_FACTOR = 0.1;
export const ROCK_MASS_EXPONENT = 2; // Used for collision physics. Mass = size^exponent.


// Fix: Define a type for rock properties to resolve compilation error on optional property access.
type RockConfig = {
  size: number;
  health: number;
  shrapnelCount: number;
  score: number;
  isSolid?: boolean;
  crackThreshold?: number;
};

export const ROCK_TYPES: Record<string, RockConfig> = {
  small: {
    size: 50,
    health: 2,
    shrapnelCount: 3,
    score: 1,
  },
  medium: {
    size: 70,
    health: 8,
    shrapnelCount: 5,
    score: 2,
  },
  large: {
    size: 100,
    health: 15,
    shrapnelCount: 7,
    score: 3,
  },
  solid: {
    size: 140,
    health: 20,
    shrapnelCount: 10,
    score: 10,
    isSolid: true,
    crackThreshold: 10, // Health must be at or below this to be cracked
  }
};


// Shrapnel properties
export const SHRAPNEL_SIZE = 12;
export const SHRAPNEL_COUNT = 5; // Base count, will be overridden by rock type
export const SHRAPNEL_SPEED = 4;
export const SHRAPNEL_GRAVITY = 0.03; // A little bit of gravity for shrapnel
export const SHRAPNEL_COLLISION_DAMAGE = 0.5;
export const SHRAPNEL_BOUNCE_DAMPING = 0.7;
export const SHRAPNEL_ROTATION_IMPACT = 0.2;

// Explosion properties
export const EXPLOSION_DURATION = 400; // in ms

// Fix: Add missing constant exports for Helicopter and Obstacle components to resolve compilation errors.
// Helicopter properties
export const HELICOPTER_WIDTH = 80;
export const HELICOPTER_HEIGHT = 50;

// Obstacle properties
export const OBSTACLE_WIDTH = 80;
export const OBSTACLE_GAP = 180;
export const GROUND_HEIGHT = 20;