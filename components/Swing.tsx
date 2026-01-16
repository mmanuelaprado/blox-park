
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Swing: React.FC<{ 
  position: [number, number, number], 
  rotation?: [number, number, number],
  isRiding?: boolean,
  ridePOVRef?: React.MutableRefObject<THREE.Group | null>
}> = ({ position, rotation = [0, 0, 0], isRiding = false, ridePOVRef }) => {
  const seatGroupRef = useRef<THREE.Group>(null);
  const povRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (seatGroupRef.current) {
      // Movimento de balanço contínuo
      const angle = Math.sin(state.clock.elapsedTime * 2.5) * 0.6;
      seatGroupRef.current.rotation.x = angle;
      
      if (isRiding && ridePOVRef) {
        ridePOVRef.current = povRef.current;
      }
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Estrutura A-Frame */}
      <mesh position={[-3, 4, 0]} rotation={[0, 0, 0.2]} castShadow>
        <boxGeometry args={[0.4, 9, 0.4]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      <mesh position={[3, 4, 0]} rotation={[0, 0, -0.2]} castShadow>
        <boxGeometry args={[0.4, 9, 0.4]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      <mesh position={[0, 8.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 7, 8]} />
        <meshStandardMaterial color="#4b5563" />
      </mesh>

      {/* Assento Balançando */}
      <group ref={seatGroupRef} position={[0, 8.2, 0]}>
        <mesh position={[0, -5, 0]} castShadow>
          <boxGeometry args={[2, 0.2, 1]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
        
        {/* Ponto de vista da câmera (POV) ajustado para o assento */}
        <group ref={povRef} position={[0, -4.2, 0.2]} />

        {/* Cordas/Correntes */}
        <mesh position={[-0.9, -2.5, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 5, 6]} />
          <meshStandardMaterial color="#9ca3af" />
        </mesh>
        <mesh position={[0.9, -2.5, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 5, 6]} />
          <meshStandardMaterial color="#9ca3af" />
        </mesh>
      </group>
    </group>
  );
};

export default Swing;
