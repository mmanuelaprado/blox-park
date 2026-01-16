
import React from 'react';

const Path: React.FC = () => {
  return (
    <group>
      {/* Main Path */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 40]} receiveShadow>
        <planeGeometry args={[12, 80]} />
        <meshStandardMaterial color="#d1d5db" />
      </mesh>
      {/* Circle Center */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 20]} receiveShadow>
        <circleGeometry args={[15, 32]} />
        <meshStandardMaterial color="#d1d5db" />
      </mesh>
      {/* Side paths */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-20, 0.05, 0]} receiveShadow>
        <planeGeometry args={[40, 8]} />
        <meshStandardMaterial color="#d1d5db" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[20, 0.05, 0]} receiveShadow>
        <planeGeometry args={[40, 8]} />
        <meshStandardMaterial color="#d1d5db" />
      </mesh>
    </group>
  );
};

export default Path;
