
import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Sparkles from './Sparkles';
import { useRideAudio } from './AudioSystem';

const FerrisWheel: React.FC<{ 
  position: [number, number, number], 
  isActive?: boolean, 
  isRiding?: boolean,
  ridePOVRef?: React.MutableRefObject<THREE.Group | null>
}> = ({ position, isActive = false, isRiding = false, ridePOVRef }) => {
  const wheelRef = useRef<THREE.Group>(null);
  const cabinsRef = useRef<(THREE.Group | null)[]>([]);
  const [speed, setSpeed] = useState(0);
  
  const audioNode = useRideAudio(isActive, 'motor');

  useEffect(() => {
    if (wheelRef.current && audioNode.current) {
      wheelRef.current.add(audioNode.current);
    }
  }, [audioNode]);

  useFrame((state, delta) => {
    const targetSpeed = isActive ? 0.4 : 0;
    const newSpeed = THREE.MathUtils.lerp(speed, targetSpeed, delta * 0.5);
    setSpeed(newSpeed);

    if (wheelRef.current) {
      wheelRef.current.rotation.z += delta * newSpeed;
    }
    
    cabinsRef.current.forEach((cabin, i) => {
        if (cabin && wheelRef.current) {
            cabin.rotation.z = -wheelRef.current.rotation.z;
            if (isRiding && i === 0 && ridePOVRef) {
              ridePOVRef.current = cabin;
            }
        }
    });
  });

  const cabinCount = 8;
  const radius = 14;

  return (
    <group position={position}>
      <mesh position={[-3, 12, -1]} rotation={[0, 0, 0.15]} castShadow>
        <boxGeometry args={[1, 30, 1]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <mesh position={[3, 12, -1]} rotation={[0, 0, -0.15]} castShadow>
        <boxGeometry args={[1, 30, 1]} />
        <meshStandardMaterial color="#475569" />
      </mesh>

      <group ref={wheelRef} position={[0, 25, 1]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, 0.3, 16, 100]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
        
        {[...Array(cabinCount)].map((_, i) => (
          <group key={i} rotation={[0, 0, (i / cabinCount) * Math.PI * 2]}>
             <group position={[0, radius, 0]} ref={(el) => { cabinsRef.current[i] = el; }}>
                <mesh position={[0, -1.5, 0]} castShadow>
                    <boxGeometry args={[3, 3, 3]} />
                    <meshStandardMaterial color={i % 2 === 0 ? "#3b82f6" : "#facc15"} />
                </mesh>
                <Sparkles 
                  active={isActive} 
                  count={5} 
                  color={i % 2 === 0 ? "#60a5fa" : "#fef08a"} 
                  areaSize={[4, 4, 4]} 
                />
             </group>
          </group>
        ))}
      </group>
    </group>
  );
};

export default FerrisWheel;
