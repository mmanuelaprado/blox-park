
import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CharacterProps {
  position: [number, number, number];
  onMove?: (pos: THREE.Vector3) => void;
  id?: string;
  benchPositions?: { pos: [number, number, number], rot: [number, number, number] }[];
}

const CharacterFace: React.FC<{ eyeColor: string }> = ({ eyeColor }) => {
  return (
    <group position={[0, 0.6, 0.605]}>
      {/* Sobrancelhas */}
      <mesh position={[-0.28, 0.42, 0.01]} rotation={[0, 0, 0.1]}>
        <boxGeometry args={[0.25, 0.05, 0.02]} />
        <meshBasicMaterial color="#312e81" />
      </mesh>
      <mesh position={[0.28, 0.42, 0.01]} rotation={[0, 0, -0.1]}>
        <boxGeometry args={[0.25, 0.05, 0.02]} />
        <meshBasicMaterial color="#312e81" />
      </mesh>
      {/* Olhos */}
      {[-0.28, 0.28].map((x, i) => (
        <group key={i} position={[x, 0.15, 0]}>
          <mesh><planeGeometry args={[0.25, 0.35]} /><meshBasicMaterial color="#ffffff" /></mesh>
          <mesh position={[0, -0.02, 0.01]}><planeGeometry args={[0.18, 0.2]} /><meshBasicMaterial color={eyeColor} /></mesh>
          <mesh position={[0, -0.02, 0.02]}><planeGeometry args={[0.08, 0.1]} /><meshBasicMaterial color="#000000" /></mesh>
          <mesh position={[0.05, 0.08, 0.03]}><planeGeometry args={[0.05, 0.05]} /><meshBasicMaterial color="#ffffff" /></mesh>
        </group>
      ))}
      {/* Sorriso */}
      <group position={[0, -0.25, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <torusGeometry args={[0.18, 0.04, 12, 24, Math.PI]} />
          <meshStandardMaterial color="#991b1b" roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
};

const Character: React.FC<CharacterProps> = ({ position, onMove, id, benchPositions = [] }) => {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  const clothes = useMemo(() => {
    const shirts = ['#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
    const pants = ['#1e293b', '#334155', '#475569', '#166534', '#1e3a8a'];
    const hairs = ['#451a03', '#78350f', '#000000', '#fbbf24', '#ffffff'];
    const eyes = ['#22c55e', '#a855f7', '#f97316', '#3b82f6', '#451a03'];
    return {
      shirt: shirts[Math.floor(Math.random() * shirts.length)],
      pants: pants[Math.floor(Math.random() * pants.length)],
      hair: hairs[Math.floor(Math.random() * hairs.length)],
      eyeColor: eyes[Math.floor(Math.random() * eyes.length)]
    };
  }, []);

  const [target] = useState(new THREE.Vector3(position[0], position[1], position[2]));
  const [isWalking, setIsWalking] = useState(false);
  const [isSitting, setIsSitting] = useState(false);
  const [sitTimer, setSitTimer] = useState(0);
  const [currentBenchRot, setCurrentBenchRot] = useState(0);

  const wander = () => {
    target.set((Math.random() - 0.5) * 120, 0, (Math.random() - 0.5) * 120);
  };
  
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;
    const lerpSpeed = 8 * delta;

    if (isSitting) {
        setSitTimer(prev => prev - delta);
        if (sitTimer <= 0) {
            setIsSitting(false);
            groupRef.current.position.y = 0;
            wander();
        }
        groupRef.current.rotation.y = currentBenchRot;
        groupRef.current.position.y = 1.4; 
        
        if (leftLegRef.current) leftLegRef.current.rotation.x = -Math.PI / 2;
        if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.PI / 2;
        return;
    }

    const speed = 6;
    const distance = groupRef.current.position.distanceTo(target);
    
    if (distance > 1.5) {
      setIsWalking(true);
      const direction = target.clone().sub(groupRef.current.position).normalize();
      groupRef.current.position.add(direction.multiplyScalar(speed * delta));
      const lookTarget = new THREE.Vector3(target.x, groupRef.current.position.y, target.z);
      groupRef.current.lookAt(lookTarget);
      if (onMove) onMove(groupRef.current.position);
    } else {
      setIsWalking(false);
      let closestBench = null;
      let minDist = 8;
      for (const b of benchPositions) {
        const bVec = new THREE.Vector3(...b.pos);
        const d = groupRef.current.position.distanceTo(bVec);
        if (d < minDist) { minDist = d; closestBench = b; }
      }
      if (closestBench && Math.random() > 0.4) {
        setIsSitting(true);
        setSitTimer(8 + Math.random() * 15);
        groupRef.current.position.set(closestBench.pos[0], 1.4, closestBench.pos[2]);
        setCurrentBenchRot(closestBench.rot[1]);
      } else { wander(); }
    }

    const walkSpeed = 10;
    if (isWalking) {
      if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(time * walkSpeed) * 0.7;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.sin(time * walkSpeed) * 0.7;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -Math.sin(time * walkSpeed) * 0.5;
      if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(time * walkSpeed) * 0.5;
      
      if (bodyRef.current) {
        bodyRef.current.position.y = 2.4 + Math.abs(Math.sin(time * walkSpeed)) * 0.15;
      }
    } else if (!isSitting) {
      if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, lerpSpeed);
      if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, lerpSpeed);
      if (bodyRef.current) bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, 2.4, lerpSpeed);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <group ref={bodyRef} position={[0, 2.4, 0]}>
        <mesh position={[0, 1.25, 0]} castShadow>
          <boxGeometry args={[2, 2.5, 1]} />
          <meshStandardMaterial color={clothes.shirt} />
        </mesh>
        
        <group ref={headRef} position={[0, 2.5, 0]}>
          <mesh position={[0, 0.6, 0]} castShadow>
            <cylinderGeometry args={[0.7, 0.7, 1.2, 12]} />
            <meshStandardMaterial color="#facc15" />
          </mesh>
          <group position={[0, 1.0, 0]}>
            <mesh position={[0, 0.4, 0]} castShadow><boxGeometry args={[1.7, 0.5, 1.7]} /><meshStandardMaterial color={clothes.hair} /></mesh>
            <mesh position={[0.65, -0.4, 0]} castShadow><boxGeometry args={[0.3, 0.9, 1.2]} /><meshStandardMaterial color={clothes.hair} /></mesh>
            <mesh position={[-0.65, -0.4, 0]} castShadow><boxGeometry args={[0.3, 0.9, 1.2]} /><meshStandardMaterial color={clothes.hair} /></mesh>
          </group>
          {/* Adicionando a Face ao NPC */}
          <CharacterFace eyeColor={clothes.eyeColor} />
        </group>

        <group ref={leftArmRef} position={[-1.3, 2.3, 0]}>
          <mesh position={[0, -1.1, 0]} castShadow><boxGeometry args={[0.6, 2.2, 0.6]} /><meshStandardMaterial color="#facc15" /></mesh>
        </group>
        <group ref={rightArmRef} position={[1.3, 2.3, 0]}>
          <mesh position={[0, -1.1, 0]} castShadow><boxGeometry args={[0.6, 2.2, 0.6]} /><meshStandardMaterial color="#facc15" /></mesh>
        </group>
        <group ref={leftLegRef} position={[-0.5, 0, 0]}>
          <mesh position={[0, -1.2, 0]} castShadow><boxGeometry args={[0.8, 2.4, 0.9]} /><meshStandardMaterial color={clothes.pants} /></mesh>
        </group>
        <group ref={rightLegRef} position={[0.5, 0, 0]}>
          <mesh position={[0, -1.2, 0]} castShadow><boxGeometry args={[0.8, 2.4, 0.9]} /><meshStandardMaterial color={clothes.pants} /></mesh>
        </group>
      </group>
    </group>
  );
};

export default Character;
