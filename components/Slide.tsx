
import React from 'react';

const Slide: React.FC<{ position: [number, number, number], rotation?: [number, number, number] }> = ({ position, rotation = [0, 0, 0] }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Plataforma superior */}
      <mesh position={[0, 5, 0]}>
        <boxGeometry args={[3, 0.4, 3]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      {/* Escada */}
      <mesh position={[0, 2.5, -1.8]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[2, 6, 0.2]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      {/* O Escorregador em si (Rampa) */}
      <mesh position={[0, 2.5, 3.5]} rotation={[-0.7, 0, 0]}>
        <boxGeometry args={[2.5, 8, 0.4]} />
        <meshStandardMaterial color="#facc15" />
      </mesh>
      {/* Postes */}
      {[[-1.3, -1.3], [1.3, -1.3], [-1.3, 1.3], [1.3, 1.3]].map((p, i) => (
        <mesh key={i} position={[p[0], 2.5, p[1]]}>
          <cylinderGeometry args={[0.15, 0.15, 5, 8]} />
          <meshStandardMaterial color="#4b5563" />
        </mesh>
      ))}
    </group>
  );
};

export default Slide;
