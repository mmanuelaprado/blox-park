
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Trampoline: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const jumpRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (jumpRef.current) {
      // Simula a vibração constante ou impacto
      const s = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.02;
      jumpRef.current.scale.set(1, s, 1);
    }
  });

  return (
    <group position={position}>
      {/* Estrutura Base */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[6, 6, 1, 32]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
      {/* Lona Elástica */}
      <group ref={jumpRef} position={[0, 1.1, 0]}>
        <mesh receiveShadow>
          <cylinderGeometry args={[5.5, 5.5, 0.2, 32]} />
          <meshStandardMaterial color="#1e40af" roughness={0.9} />
        </mesh>
      </group>
      {/* Postes da Rede */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 5.8, 3.5, Math.sin(angle) * 5.8]}>
            <cylinderGeometry args={[0.1, 0.1, 6, 8]} />
            <meshStandardMaterial color="#4b5563" />
          </mesh>
        );
      })}
      {/* Rede de Proteção (Simulada com cilindro transparente) */}
      <mesh position={[0, 3.5, 0]}>
        <cylinderGeometry args={[5.8, 5.8, 6, 32, 1, true]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.2} wireframe />
      </mesh>
    </group>
  );
};

export default Trampoline;
