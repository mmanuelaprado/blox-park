
import React, { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { playMiniGameSound } from './AudioSystem';

interface MiniGameStallProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  type: 'ringtoss' | 'balloonpop';
}

const MiniGameStall: React.FC<MiniGameStallProps> = ({ position, rotation = [0, 0, 0], type }) => {
  const ringsRef = useRef<THREE.Group>(null);
  const balloonsRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const worldPos = new THREE.Vector3(...position);
  
  // Logic to simulate someone playing and winning occasionally
  const nextEventRef = useRef(Math.random() * 5 + 2);
  const timerRef = useRef(0);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    timerRef.current += delta;

    if (timerRef.current > nextEventRef.current) {
      timerRef.current = 0;
      nextEventRef.current = Math.random() * 4 + 3; // Random interval for sounds
      
      if (type === 'ringtoss') {
        const soundType = Math.random() > 0.5 ? 'clink' : 'break';
        playMiniGameSound(soundType, worldPos, camera);
      } else {
        playMiniGameSound('pop', worldPos, camera);
      }
    }
    
    if (type === 'ringtoss' && ringsRef.current) {
      ringsRef.current.children.forEach((ring, i) => {
        ring.position.y = Math.sin(time * 2 + i) * 0.2;
        ring.rotation.z += 0.02;
      });
    }

    if (type === 'balloonpop' && balloonsRef.current) {
      balloonsRef.current.children.forEach((balloon, i) => {
        const scale = 1 + Math.sin(time * 3 + i) * 0.05;
        balloon.scale.set(scale, scale, scale);
      });
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Stall Structure */}
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[8, 4, 4]} />
        <meshStandardMaterial color="#4ade80" />
      </mesh>
      <mesh position={[0, 4.1, 0]} castShadow>
        <boxGeometry args={[8.5, 0.2, 4.5]} />
        <meshStandardMaterial color="#facc15" />
      </mesh>
      
      {/* Backboard */}
      <mesh position={[0, 6.5, -1.8]} castShadow>
        <boxGeometry args={[8, 5, 0.4]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 9, 0]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[9, 0.5, 6]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>

      {type === 'ringtoss' && (
        <group position={[0, 4.5, 0]}>
          {/* Bottles */}
          {[...Array(9)].map((_, i) => (
            <mesh key={`bot-${i}`} position={[(i % 3 - 1) * 1.5, 0.5, -(Math.floor(i / 3) - 1) * 1]} castShadow>
              <cylinderGeometry args={[0.2, 0.3, 1, 8]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          ))}
          {/* Hovering Rings */}
          <group ref={ringsRef}>
            {[...Array(3)].map((_, i) => (
              <mesh key={`ring-${i}`} position={[(i - 1) * 2, 2, 1]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.4, 0.08, 8, 24]} />
                <meshStandardMaterial color={i === 1 ? "#ef4444" : "#facc15"} emissive={i === 1 ? "#ef4444" : "#facc15"} emissiveIntensity={0.5} />
              </mesh>
            ))}
          </group>
        </group>
      )}

      {type === 'balloonpop' && (
        <group position={[0, 6.5, -1.5]} ref={balloonsRef}>
          {[...Array(12)].map((_, i) => (
            <mesh key={`bal-${i}`} position={[(i % 4 - 1.5) * 1.5, (Math.floor(i / 4) - 1) * 1.5, 0.2]}>
              <sphereGeometry args={[0.6, 12, 12]} />
              <meshStandardMaterial color={['#ef4444', '#3b82f6', '#facc15', '#a855f7'][i % 4]} />
            </mesh>
          ))}
        </group>
      )}

      {/* Counter Decor */}
      <mesh position={[0, 4.3, 1.5]}>
        <boxGeometry args={[7, 0.1, 1]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  );
};

export default MiniGameStall;
