
import React from 'react';
import * as THREE from 'three';

interface BenchProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  onClick?: (pos: [number, number, number], rot: [number, number, number]) => void;
}

const Bench: React.FC<BenchProps> = ({ position, rotation = [0, 0, 0], onClick }) => {
  return (
    <group 
      position={position} 
      rotation={rotation} 
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(position, rotation);
      }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      {/* Área de colisão invisível maior para facilitar o clique */}
      <mesh position={[0, 1.5, 0]} visible={false}>
        <boxGeometry args={[7, 3, 3]} />
      </mesh>

      {/* Assento */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[6, 0.4, 2]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>
      {/* Encosto */}
      <mesh position={[0, 2.2, -0.9]} rotation={[-0.2, 0, 0]} castShadow>
        <boxGeometry args={[6, 1.8, 0.3]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>
      {/* Pés/Suportes */}
      <mesh position={[-2.5, 0.6, 0.7]} castShadow>
        <boxGeometry args={[0.4, 1.2, 0.4]} />
        <meshStandardMaterial color="#262626" metalness={0.8} />
      </mesh>
      <mesh position={[2.5, 0.6, 0.7]} castShadow>
        <boxGeometry args={[0.4, 1.2, 0.4]} />
        <meshStandardMaterial color="#262626" metalness={0.8} />
      </mesh>
      <mesh position={[-2.5, 0.6, -0.7]} castShadow>
        <boxGeometry args={[0.4, 1.2, 0.4]} />
        <meshStandardMaterial color="#262626" metalness={0.8} />
      </mesh>
      <mesh position={[2.5, 0.6, -0.7]} castShadow>
        <boxGeometry args={[0.4, 1.2, 0.4]} />
        <meshStandardMaterial color="#262626" metalness={0.8} />
      </mesh>
      {/* Braços */}
      <mesh position={[-2.9, 1.8, 0]} castShadow>
        <boxGeometry args={[0.2, 0.2, 2]} />
        <meshStandardMaterial color="#262626" />
      </mesh>
      <mesh position={[2.9, 1.8, 0]} castShadow>
        <boxGeometry args={[0.2, 0.2, 2]} />
        <meshStandardMaterial color="#262626" />
      </mesh>
    </group>
  );
};

export default Bench;
