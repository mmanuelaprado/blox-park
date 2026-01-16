
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const EntranceSign: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const textGroupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (textGroupRef.current) {
      // Pulsação sutil na escala e intensidade emissiva simulada
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.05 + 1;
      textGroupRef.current.scale.set(pulse, pulse, pulse);
    }
    if (groupRef.current) {
        // Balanço leve para dar vida ao letreiro
        groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  return (
    <group position={[0, 15, 145]} ref={groupRef}>
      {/* Estrutura de Suporte (Postes) */}
      <mesh position={[-12, -7.5, 0]} castShadow>
        <boxGeometry args={[1, 15, 1]} />
        <meshStandardMaterial color="#262626" metalness={0.8} />
      </mesh>
      <mesh position={[12, -7.5, 0]} castShadow>
        <boxGeometry args={[1, 15, 1]} />
        <meshStandardMaterial color="#262626" metalness={0.8} />
      </mesh>

      {/* Placa Principal */}
      <mesh castShadow>
        <boxGeometry args={[30, 8, 2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.2} />
      </mesh>

      {/* Bordas Neon */}
      <mesh position={[0, 0, 1.1]}>
        <boxGeometry args={[30.5, 8.5, 0.1]} />
        <meshStandardMaterial 
            color="#facc15" 
            emissive="#facc15" 
            emissiveIntensity={2} 
            transparent 
            opacity={0.8}
        />
      </mesh>

      {/* Texto Estilizado "BloxPark" (Representado por blocos 3D para manter estética Roblox) */}
      <group position={[0, 0, 1.2]} ref={textGroupRef}>
        {/* Simulação de letras com voxels/blocos */}
        <mesh position={[-8, 0, 0]}>
          <boxGeometry args={[3, 4, 0.5]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[-3, 0, 0]}>
          <boxGeometry args={[3, 3.5, 0.5]} />
          <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[2, 0, 0]}>
          <boxGeometry args={[3, 4, 0.5]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[7, 0, 0]}>
          <boxGeometry args={[3, 3.5, 0.5]} />
          <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={0.5} />
        </mesh>
        
        {/* Detalhe de Estrela ou Ícone do Parque */}
        <mesh position={[12, 2.5, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[1.5, 1.5, 0.6]} />
            <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1} />
        </mesh>
      </group>

      {/* Luzes de Chão apontando para cima */}
      <pointLight position={[-10, -10, 5]} intensity={50} color="#facc15" distance={20} />
      <pointLight position={[10, -10, 5]} intensity={50} color="#facc15" distance={20} />
    </group>
  );
};

export default EntranceSign;
