
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Rocket } from './components/Rocket';
import { Target } from './components/Target';
import { Explosion } from './components/Explosion';
import { Shrapnel } from './components/Shrapnel';
import * as C from './constants';

// State types
type GameState = 'ready' | 'playing' | 'gameOver';
type RockType = keyof typeof C.ROCK_TYPES;

interface RockState {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: RockType;
  health: number;
  maxHealth: number;
  size: number;
  isSolid: boolean;
  isCracked: boolean;
  rotation: number;
  rotationSpeed: number;
  shapeSeed: number;
}

interface ExplosionState {
  id: number;
  x: number;
  y: number;
}

interface ShrapnelState {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  shapeSeed: number;
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('ready');
  const [score, setScore] = useState(0);

  // Rocket state
  const [rocketY, setRocketY] = useState(C.GAME_HEIGHT / 2);
  const [velocity, setVelocity] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [isAscending, setIsAscending] = useState(false);

  // Game objects state
  const [rocks, setRocks] = useState<RockState[]>([]);
  const [explosions, setExplosions] = useState<ExplosionState[]>([]);
  const [shrapnel, setShrapnel] = useState<ShrapnelState[]>([]);
  const [rockSpawnTimer, setRockSpawnTimer] = useState(C.ROCK_SPAWN_INTERVAL);
  
  const nextId = useRef({ rock: 0, explosion: 0, shrapnel: 0 });
  const gameLoopRef = useRef<number | null>(null);

  const resetGame = useCallback(() => {
    setGameState('ready');
    setScore(0);
    setRocketY(C.GAME_HEIGHT / 2);
    setVelocity(0);
    setRotation(0);
    setIsAscending(false);
    setRocks([]);
    setExplosions([]);
    setShrapnel([]);
    setRockSpawnTimer(C.ROCK_SPAWN_INTERVAL);
    nextId.current = { rock: 0, explosion: 0, shrapnel: 0 };
  }, []);

  const gameLoop = useCallback(() => {
    let shrapnelToSpawn: ShrapnelState[] = [];
    let explosionsToSpawn: { explosion: ExplosionState; duration: number }[] = [];
    let newScore = score;
    const destroyedRockIds = new Set<number>();
    const clampRotationSpeed = (speed: number) => Math.max(-C.MAX_ABSOLUTE_ROTATION_SPEED, Math.min(C.MAX_ABSOLUTE_ROTATION_SPEED, speed));

    const triggerExplosion = (x: number, y: number, rockType: RockType) => {
        const newExplosion = { id: nextId.current.explosion++, x, y };
        explosionsToSpawn.push({ explosion: newExplosion, duration: C.EXPLOSION_DURATION });
        
        const count = C.ROCK_TYPES[rockType].shrapnelCount;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * 2 * Math.PI;
            shrapnelToSpawn.push({
                id: nextId.current.shrapnel++,
                x, y,
                vx: Math.cos(angle) * C.SHRAPNEL_SPEED * (0.8 + Math.random() * 0.4),
                vy: Math.sin(angle) * C.SHRAPNEL_SPEED * (0.8 + Math.random() * 0.4),
                shapeSeed: Math.random(),
            });
        }
    };

    // 1. ROCKET PHYSICS
    const acceleration = isAscending ? C.ASCEND_FORCE : C.DESCEND_FORCE;
    let newVelocity = (velocity + acceleration) * C.VELOCITY_DAMPING;
    newVelocity = Math.max(-C.MAX_VERTICAL_VELOCITY, Math.min(C.MAX_VERTICAL_VELOCITY, newVelocity));
    let newRocketY = rocketY + newVelocity;
    
    if (newRocketY <= 0) {
        newRocketY = 0;
        newVelocity = 0;
    } else if (newRocketY + C.ROCKET_HEIGHT >= C.GAME_HEIGHT) {
        newRocketY = C.GAME_HEIGHT - C.ROCKET_HEIGHT;
        newVelocity = 0;
    }
    const newRotation = newVelocity * 4;

    // 2. ROCK SPAWNING
    let newTimer = rockSpawnTimer - 1;
    let currentRocks = [...rocks];
    if (newTimer <= 0) {
        newTimer = C.ROCK_SPAWN_INTERVAL;
        const spawnWeights: Record<RockType, number> = { small: 15, medium: 1, large: 2, solid: 1 };
        const weightedRockTypes: RockType[] = [];
        for (const type in spawnWeights) {
          for (let i = 0; i < spawnWeights[type as RockType]; i++) {
            weightedRockTypes.push(type as RockType);
          }
        }
        const randomType = weightedRockTypes[Math.floor(Math.random() * weightedRockTypes.length)];
        const rockInfo = C.ROCK_TYPES[randomType];
        const rockY = Math.random() * (C.GAME_HEIGHT - rockInfo.size);
        const speed = C.TARGET_SPEED_MIN + Math.random() * (C.TARGET_SPEED_MAX - C.TARGET_SPEED_MIN);
        const initialVy = (Math.random() - 0.5) * 2 * C.TARGET_SPAWN_VELOCITY_Y_MAX;
        const initialRotationSpeed = (Math.random() - 0.5) * 2 * C.MAX_ROCK_ROTATION_SPEED;

        currentRocks.push({ 
            id: nextId.current.rock++, 
            x: C.GAME_WIDTH, 
            y: rockY, 
            vx: -speed,
            vy: initialVy,
            type: randomType,
            health: rockInfo.health,
            maxHealth: rockInfo.health,
            size: rockInfo.size,
            isSolid: rockInfo.isSolid || false,
            isCracked: false,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() > 0.3 ? initialRotationSpeed : 0, // 30% chance of no spin
            shapeSeed: Math.random(),
        });
    }

    // 3. MOVE OBJECTS
    currentRocks = currentRocks.map(r => ({
        ...r, 
        x: r.x + r.vx, 
        y: r.y + r.vy,
        rotation: r.rotation + r.rotationSpeed,
        vx: r.vx * C.ROCK_DAMPING,
        vy: r.vy * C.ROCK_DAMPING,
    }));
    let currentShrapnel = shrapnel
        .map(s => ({ ...s, x: s.x + s.vx, y: s.y + s.vy, vy: s.vy + C.SHRAPNEL_GRAVITY }))
        .filter(s => s.x > -10 && s.x < C.GAME_WIDTH + 10 && s.y > -10 && s.y < C.GAME_HEIGHT + 10);

    // 4. COLLISION DETECTION & RESOLUTION
    const rocketRect = { 
        left: C.ROCKET_X_POSITION + C.ROCKET_HITBOX_INSET_X, 
        right: C.ROCKET_X_POSITION + C.ROCKET_WIDTH - C.ROCKET_HITBOX_INSET_X, 
        top: newRocketY + C.ROCKET_HITBOX_INSET_Y, 
        bottom: newRocketY + C.ROCKET_HEIGHT - C.ROCKET_HITBOX_INSET_Y 
    };

    // ROCKET vs ROCKS
    currentRocks.forEach(rock => {
        const rockHitboxSize = rock.size * C.ROCK_HITBOX_SCALE;
        const inset = (rock.size - rockHitboxSize) / 2;
        const rockRect = { left: rock.x + inset, right: rock.x + rock.size - inset, top: rock.y + inset, bottom: rock.y + rock.size - inset };
        
        const hasCollision = rocketRect.right > rockRect.left && rocketRect.left < rockRect.right && rocketRect.bottom > rockRect.top && rocketRect.top < rockRect.bottom;
        if (hasCollision) {
            if (rock.type === 'small') {
                // Push the small rock
                rock.vx += C.ROCKET_PUSH_FORCE;
                rock.vy += newVelocity * 0.5;

                // Add torque based on impact position
                const rockCenterY = rock.y + rock.size / 2;
                const rocketCenterY = newRocketY + C.ROCKET_HEIGHT / 2;
                const impactOffsetY = (rocketCenterY - rockCenterY) / (rock.size / 2); // Normalized
                const torque = impactOffsetY * C.ROCKET_ROTATION_IMPACT_FACTOR;
                rock.rotationSpeed = clampRotationSpeed(rock.rotationSpeed + torque);
                
                newVelocity *= C.ROCKET_RECOIL; // Rocket gets a kickback
            } else {
                // Game over for other types
                setGameState('gameOver');
                return;
            }
        }
    });

    if (gameState === 'gameOver') return;

    // SHRAPNEL vs ROCKS
    const destroyedShrapnelIds = new Set<number>();
    currentShrapnel.forEach(s => {
        currentRocks.forEach(rock => {
            if (destroyedRockIds.has(rock.id) || destroyedShrapnelIds.has(s.id)) return;

            const dx = (rock.x + rock.size / 2) - s.x;
            const dy = (rock.y + rock.size / 2) - s.y;
            const distance = Math.hypot(dx, dy);
            const minDistance = (rock.size / 2) + (C.SHRAPNEL_SIZE / 2);

            if (distance < minDistance) {
                rock.health -= C.SHRAPNEL_COLLISION_DAMAGE;
                destroyedShrapnelIds.add(s.id);

                // Add a little spin from the impact
                const spin = (Math.random() - 0.5) * C.SHRAPNEL_ROTATION_IMPACT;
                rock.rotationSpeed = clampRotationSpeed(rock.rotationSpeed + spin);
            }
        });
    });
    
    // ROCKS vs ROCKS
    for (let i = 0; i < currentRocks.length; i++) {
        for (let j = i + 1; j < currentRocks.length; j++) {
            const rock1 = currentRocks[i];
            const rock2 = currentRocks[j];

            if (destroyedRockIds.has(rock1.id) || destroyedRockIds.has(rock2.id)) continue;

            const dx = (rock2.x + rock2.size / 2) - (rock1.x + rock1.size / 2);
            const dy = (rock2.y + rock2.size / 2) - (rock1.y + rock1.size / 2);
            const distance = Math.hypot(dx, dy);
            const minDistance = (rock1.size / 2) + (rock2.size / 2);

            if (distance < minDistance) {
                // Store pre-collision velocities to calculate impact force
                const old_vx1 = rock1.vx;
                const old_vy1 = rock1.vy;
                const old_vx2 = rock2.vx;
                const old_vy2 = rock2.vy;
                
                rock1.health -= C.ROCK_COLLISION_DAMAGE;
                rock2.health -= C.ROCK_COLLISION_DAMAGE;

                // Physics Response (Elastic Collision)
                const angle = Math.atan2(dy, dx);
                const sin = Math.sin(angle);
                const cos = Math.cos(angle);
                const vx1 = rock1.vx * cos + rock1.vy * sin;
                const vy1 = rock1.vy * cos - rock1.vx * sin;
                const vx2 = rock2.vx * cos + rock2.vy * sin;
                const vy2 = rock2.vy * cos - rock2.vx * sin;
                const m1 = Math.pow(rock1.size, C.ROCK_MASS_EXPONENT);
                const m2 = Math.pow(rock2.size, C.ROCK_MASS_EXPONENT);
                const finalVx1 = ((m1 - m2) * vx1 + 2 * m2 * vx2) / (m1 + m2);
                const finalVx2 = ((m2 - m1) * vx2 + 2 * m1 * vx1) / (m1 + m2);
                rock1.vx = finalVx1 * cos - vy1 * sin;
                rock1.vy = vy1 * cos + finalVx1 * sin;
                rock2.vx = finalVx2 * cos - vy2 * sin;
                rock2.vy = vy2 * cos + finalVx2 * sin;

                // Rotational response based on impact
                const impact1 = Math.hypot(rock1.vx - old_vx1, rock1.vy - old_vy1);
                const impact2 = Math.hypot(rock2.vx - old_vx2, rock2.vy - old_vy2);
                const impactToSpinFactor = C.ROCK_ROTATION_IMPACT_FACTOR;
                
                const spinChange1 = (impact1 / rock1.size) * impactToSpinFactor * (Math.random() < 0.5 ? 1 : -1);
                rock1.rotationSpeed = clampRotationSpeed(rock1.rotationSpeed + spinChange1);
                
                const spinChange2 = (impact2 / rock2.size) * impactToSpinFactor * (Math.random() < 0.5 ? 1 : -1);
                rock2.rotationSpeed = clampRotationSpeed(rock2.rotationSpeed + spinChange2);

                // Separate overlapping rocks
                const overlap = minDistance - distance;
                const separationX = (overlap / 2) * cos;
                const separationY = (overlap / 2) * sin;
                rock1.x -= separationX;
                rock1.y -= separationY;
                rock2.x += separationX;
                rock2.y += separationY;
            }
        }
    }

    // Check for destroyed rocks after all collisions
    currentRocks.forEach(rock => {
        if (rock.health <= 0 && !destroyedRockIds.has(rock.id)) {
            destroyedRockIds.add(rock.id);
            newScore += C.ROCK_TYPES[rock.type].score;
            triggerExplosion(rock.x + rock.size / 2, rock.y + rock.size / 2, rock.type);
        }
    });

    // 5. CLEANUP & STATE UPDATES
    currentRocks = currentRocks.filter(r => !destroyedRockIds.has(r.id) && r.x > -r.size * 2 && r.x < C.GAME_WIDTH + r.size * 2 && r.y > -r.size * 2 && r.y < C.GAME_HEIGHT + r.size * 2);
    currentShrapnel = currentShrapnel.filter(s => !destroyedShrapnelIds.has(s.id));

    // Rocket
    setRocketY(newRocketY);
    setVelocity(newVelocity);
    setRotation(newRotation);
    
    // Score & Timer
    setRockSpawnTimer(newTimer);
    setScore(newScore);

    // Objects
    setRocks(currentRocks);
    setShrapnel([...currentShrapnel, ...shrapnelToSpawn]);
    
    if (explosionsToSpawn.length > 0) {
        setExplosions(current => [...current, ...explosionsToSpawn.map(e => e.explosion)]);
        explosionsToSpawn.forEach(({ explosion, duration }) => {
            setTimeout(() => {
                setExplosions(current => current.filter(e => e.id !== explosion.id));
            }, duration);
        });
    }
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [rocketY, velocity, isAscending, rocks, score, rockSpawnTimer, shrapnel, gameState]);

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, gameLoop]);
  
  const handlePointerDown = () => {
    if (gameState === 'ready') setGameState('playing');
    setIsAscending(true);
  };
  
  const handlePointerUp = () => setIsAscending(false);
  
  return (
    <div className="flex justify-center items-center h-screen bg-gray-900 font-sans select-none">
      <div
        className="relative overflow-hidden border-4 border-gray-700 rounded-lg shadow-2xl bg-slate-900"
        style={{ width: `${C.GAME_WIDTH}px`, height: `${C.GAME_HEIGHT}px`, backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)', backgroundSize: '30px 30px' }}
        onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}
      >
        {rocks.map(rock => ( <Target key={rock.id} {...rock} /> ))}
        {shrapnel.map(s => ( <Shrapnel key={s.id} x={s.x} y={s.y} shapeSeed={s.shapeSeed} /> ))}
        <Rocket y={rocketY} rotation={rotation} isAscending={isAscending} />
        {explosions.map(exp => ( <Explosion key={exp.id} x={exp.x} y={exp.y} /> ))}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white text-6xl font-bold" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.8)' }}>{score}</div>
        
        {gameState === 'ready' && (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-50 cursor-pointer" onClick={handlePointerDown}>
            <h1 className="text-5xl text-white font-bold mb-4 drop-shadow-lg">Rocket Rush</h1>
            <p className="text-2xl text-white font-semibold drop-shadow-md">Hold to Ascend</p>
            <p className="text-xl text-white font-semibold drop-shadow-md">Release to Descend</p>
          </div>
        )}
        
        {gameState === 'gameOver' && (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-70">
            <div className="bg-white bg-opacity-80 p-8 rounded-lg shadow-xl text-center backdrop-blur-sm">
                <h2 className="text-4xl text-gray-800 font-bold mb-2">Game Over</h2>
                <p className="text-xl text-gray-700 mb-4">Your Score: <span className="font-bold text-2xl">{score}</span></p>
                <button
                    onClick={resetGame}
                    className="px-6 py-3 bg-blue-500 text-white font-bold text-lg rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-opacity-50 transition-transform transform hover:scale-105"
                >
                    Restart
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
