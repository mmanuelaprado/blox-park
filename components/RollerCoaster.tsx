
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const RollerCoaster: React.FC<{ 
  position: [number, number, number], 
  isActive?: boolean,
  isRiding?: boolean,
  ridePOVRef?: React.MutableRefObject<THREE.Group | null>
}> = ({ position, isActive = false, isRiding = false, ridePOVRef }) => {
  const cartRef = useRef<THREE.Group>(null);
  
  const curve = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const x = Math.cos(angle) * 45;
      const z = Math.sin(angle) * 30;
      const y = Math.sin(angle * 3) * 15 + 20;
      points.push(new THREE.Vector3(x, y, z));
    }
    return new THREE.CatmullRomCurve3(points, true);
  }, []);

  useFrame((state) => {
    if (!cartRef.current || !isActive) return;

    const time = state.clock.elapsedTime * 0.12;
    const t = (time % 1);
    
    const pos = curve.getPointAt(t);
    const nextPos = curve.getPointAt((t + 0.01) % 1);
    
    cartRef.current.position.copy(pos);
    cartRef.current.lookAt(nextPos);

    if (isRiding && ridePOVRef) {
      ridePOVRef.current = cartRef.current;
    }
  });

  return (
    <group position={position}>
      <mesh castShadow>
        <tubeGeometry args={[curve, 100, 0.5, 8, true]} />
        <meshStandardMaterial color="#1e293b" emissive="#3b82f6" emissiveIntensity={0.5} />
      </mesh>

      <group ref={cartRef}>
        <mesh castShadow>
          <boxGeometry args={[2.5, 1.5, 4]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
        {/* POV offset para ficar "dentro" do carrinho */}
        <group position={[0, 1.2, 0.5]} />
      </group>

      {curve.getPoints(20).map((p, i) => (
        <mesh key={i} position={[p.x, p.y / 2, p.z]}>
            <boxGeometry args={[0.4, p.y, 0.4]} />
            <meshStandardMaterial color="#64748b" transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
};

export default RollerCoaster;
