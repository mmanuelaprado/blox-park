
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Sparkles from './Sparkles';

const Spinner: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const wheelRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (wheelRef.current) {
      wheelRef.current.rotation.y += delta * 2;
    }
  });

  return (
    <group position={position}>
      <group ref={wheelRef}>
        <Sparkles active={true} count={10} color="#10b981" areaSize={[8, 2, 8]} size={0.2} speed={1.5} />
        <mesh position={[0, 0.5, 0]} receiveShadow>
          <cylinderGeometry args={[4, 4, 0.4, 32]} />
          <meshStandardMaterial color="#10b981" />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <group key={i} rotation={[0, (i / 4) * Math.PI * 2, 0]}>
            <mesh position={[2, 1.5, 0]}>
              <torusGeometry args={[1, 0.1, 8, 16, Math.PI]} rotation={[Math.PI/2, 0, 0]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          </group>
        ))}
      </group>
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 2, 8]} />
        <meshStandardMaterial color="#4b5563" />
      </mesh>
    </group>
  );
};

export default Spinner;
