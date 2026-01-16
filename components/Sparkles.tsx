
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SparklesProps {
  count?: number;
  color?: string;
  size?: number;
  areaSize?: [number, number, number];
  speed?: number;
  active?: boolean;
}

const Sparkles: React.FC<SparklesProps> = ({ 
  count = 20, 
  color = "#ffffff", 
  size = 0.2, 
  areaSize = [1, 1, 1],
  speed = 1,
  active = true
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const posArr = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      posArr[i * 3] = (Math.random() - 0.5) * areaSize[0];
      posArr[i * 3 + 1] = (Math.random() - 0.5) * areaSize[1];
      posArr[i * 3 + 2] = (Math.random() - 0.5) * areaSize[2];
      
      velocities[i * 3] = (Math.random() - 0.5) * 0.05;
      velocities[i * 3 + 1] = Math.random() * 0.1;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
    }
    return { posArr, velocities };
  }, [count, areaSize]);

  useFrame((state, delta) => {
    if (!pointsRef.current || !active) return;
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += particles.velocities[i * 3 + 1] * speed;
      
      // Reset particle if it goes too high
      if (pos[i * 3 + 1] > areaSize[1] / 2) {
        pos[i * 3 + 1] = -areaSize[1] / 2;
        pos[i * 3] = (Math.random() - 0.5) * areaSize[0];
        pos[i * 3 + 2] = (Math.random() - 0.5) * areaSize[2];
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y += delta * 0.2;
  });

  return (
    <points ref={pointsRef} visible={active}>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position" 
          count={count} 
          array={particles.posArr} 
          itemSize={3} 
        />
      </bufferGeometry>
      <pointsMaterial 
        size={size} 
        color={color} 
        transparent 
        opacity={0.8} 
        blending={THREE.AdditiveBlending} 
        depthWrite={false}
      />
    </points>
  );
};

export default Sparkles;
