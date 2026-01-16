
import React from 'react';
import * as THREE from 'three';

interface FoodStallProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  type: 'pizza' | 'icecream' | 'burger';
}

const FoodStall: React.FC<FoodStallProps> = ({ position, rotation = [0, 0, 0], type }) => {
  const getTheme = () => {
    switch (type) {
      case 'pizza':
        return { main: '#ef4444', secondary: '#ffffff', accent: '#facc15', sign: 'PIZZA' };
      case 'icecream':
        return { main: '#f472b6', secondary: '#60a5fa', accent: '#ffffff', sign: 'ICE' };
      case 'burger':
        return { main: '#b45309', secondary: '#fbbf24', accent: '#334155', sign: 'BURGER' };
      default:
        return { main: '#cccccc', secondary: '#999999', accent: '#333333', sign: 'FOOD' };
    }
  };

  const theme = getTheme();

  return (
    <group position={position} rotation={rotation}>
      {/* Base Counter */}
      <mesh position={[0, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[8, 4, 4]} />
        <meshStandardMaterial color={theme.main} />
      </mesh>
      
      {/* Counter Top */}
      <mesh position={[0, 4.1, 0.5]} castShadow>
        <boxGeometry args={[8.4, 0.3, 3.5]} />
        <meshStandardMaterial color={theme.accent} />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, 6, -1.8]} castShadow>
        <boxGeometry args={[8, 4, 0.4]} />
        <meshStandardMaterial color={theme.main} />
      </mesh>

      {/* Roof Pillars */}
      {[[-3.8, 1.8], [3.8, 1.8]].map((p, i) => (
        <mesh key={i} position={[p[0], 6, p[1]]} castShadow>
          <boxGeometry args={[0.3, 4, 0.3]} />
          <meshStandardMaterial color={theme.accent} />
        </mesh>
      ))}

      {/* Roof */}
      <group position={[0, 8.2, 0]}>
        <mesh rotation={[0.2, 0, 0]} castShadow>
          <boxGeometry args={[9, 0.5, 5]} />
          <meshStandardMaterial color={theme.secondary} />
        </mesh>
        {/* Decorative Stripes on Roof */}
        {[...Array(5)].map((_, i) => (
          <mesh key={i} position={[(i - 2) * 1.8, 0.3, 0]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.5, 0.1, 5.1]} />
            <meshStandardMaterial color={theme.main} />
          </mesh>
        ))}
      </group>

      {/* Signage */}
      <group position={[0, 9.5, 2.2]} rotation={[-0.1, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[6, 1.5, 0.2]} />
          <meshStandardMaterial color={theme.accent} />
        </mesh>
        {/* Abstract letter shapes for Roblox aesthetic */}
        <mesh position={[0, 0, 0.15]}>
          <boxGeometry args={[5, 0.8, 0.1]} />
          <meshStandardMaterial color={theme.main} />
        </mesh>
      </group>

      {/* Small Decorative Items on Counter */}
      <mesh position={[-2, 4.5, 1]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.8, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[2, 4.5, 1]} castShadow>
        <boxGeometry args={[1, 0.8, 1]} />
        <meshStandardMaterial color={theme.secondary} />
      </mesh>
    </group>
  );
};

export default FoodStall;
