
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Carousel: React.FC<{ position: [number, number, number], isActive?: boolean }> = ({ position, isActive = false }) => {
  const groupRef = useRef<THREE.Group>(null);
  const horsesRef = useRef<(THREE.Group | null)[]>([]);
  const [speed, setSpeed] = useState(0);
  const pulseRef = useRef(0);

  useFrame((state, delta) => {
    const targetSpeed = isActive ? 0.7 : 0;
    const newSpeed = THREE.MathUtils.lerp(speed, targetSpeed, delta * 1.2);
    setSpeed(newSpeed);

    if (isActive) {
      pulseRef.current = (Math.cos(state.clock.elapsedTime * 4) + 1) / 2;
    } else {
      pulseRef.current = THREE.MathUtils.lerp(pulseRef.current, 0, delta * 2);
    }

    if (groupRef.current) {
      groupRef.current.rotation.y += delta * newSpeed;
    }

    horsesRef.current.forEach((horse, i) => {
        if (horse) {
            const time = state.clock.elapsedTime;
            const animSpeed = isActive ? 2.5 : 0.5;
            const phase = i * (Math.PI / 3);
            const verticalCycle = Math.sin(time * animSpeed + phase);
            horse.position.y = 2.5 + verticalCycle * 1.8;
            horse.rotation.z = verticalCycle * 0.15;
            horse.rotation.x = Math.cos(time * animSpeed + phase) * 0.05;
        }
    });
  });

  return (
    <group position={position}>
      {/* Audio logic is now handled globally or bypassed for stability */}

      <pointLight 
        position={[0, 12, 0]} 
        intensity={isActive ? 5 + pulseRef.current * 15 : 1} 
        color="#facc15" 
        distance={30} 
      />
      
      <mesh position={[0, 0.5, 0]} receiveShadow>
        <cylinderGeometry args={[11, 11, 1.2, 32]} />
        <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.4} />
      </mesh>
      
      <group ref={groupRef}>
        <mesh position={[0, 6, 0]}>
          <cylinderGeometry args={[2.5, 2.5, 12, 16]} />
          <meshStandardMaterial 
            color="#facc15" 
            emissive="#facc15" 
            emissiveIntensity={isActive ? 0.3 + pulseRef.current * 0.7 : 0.1} 
            metalness={1}
            roughness={0}
          />
        </mesh>
        
        <mesh position={[0, 13, 0]} castShadow>
          <coneGeometry args={[13, 5, 32]} />
          <meshStandardMaterial color="#ef4444" roughness={0.8} />
        </mesh>

        {[...Array(8)].map((_, i) => (
          <group 
            key={i} 
            rotation={[0, (i / 8) * Math.PI * 2, 0]}
          >
            <group position={[8, 0, 0]} ref={(el) => { horsesRef.current[i] = el; }}>
                <mesh position={[0, 0, 0]} castShadow>
                   <boxGeometry args={[1.5, 2, 3.5]} />
                   <meshStandardMaterial color="#ffffff" metalness={0.3} />
                </mesh>
                <mesh position={[0, 1.5, 1.2]} castShadow>
                    <boxGeometry args={[1.2, 1.5, 1.5]} />
                    <meshStandardMaterial color="#ffffff" />
                </mesh>
                <mesh position={[0, -2, 0]}>
                   <cylinderGeometry args={[0.15, 0.15, 12, 8]} />
                   <meshStandardMaterial 
                    color="#ffd700" 
                    emissive="#ffd700" 
                    emissiveIntensity={isActive ? pulseRef.current * 0.5 : 0} 
                    metalness={1} 
                   />
                </mesh>
            </group>
          </group>
        ))}
      </group>
    </group>
  );
};

export default Carousel;
