
import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface PlayerProps {
  onMove?: (pos: THREE.Vector3) => void;
  joystickVector?: { x: number; y: number };
  jumpPressed?: boolean;
  isSitting?: boolean;
  setIsSitting?: (val: boolean) => void;
  benchPositions?: { pos: [number, number, number], rot: [number, number, number] }[];
  visible?: boolean;
  isOnTrampoline?: boolean;
}

const OBSTACLES = [
  { x: -40, z: -20, radius: 18 },
  { x: 40, z: -20, radius: 15 },
  { x: 0, z: -70, radius: 25 },
  { x: 30, z: 75, w: 10, d: 8 },
  { x: -30, z: 75, w: 10, d: 8 },
  { x: -25, z: 45, w: 9, d: 6 },
  { x: 25, z: 45, w: 9, d: 6 },
  { x: 0, z: 95, w: 20, d: 5 },
  { x: 0, z: 20, radius: 11 },
];

const PlayerFace: React.FC = () => {
  return (
    <group position={[0, -0.05, 0.605]}>
      {/* Sobrancelhas */}
      <mesh position={[-0.28, 0.42, 0.01]} rotation={[0, 0, 0.1]}>
        <boxGeometry args={[0.25, 0.05, 0.02]} />
        <meshBasicMaterial color="#312e81" />
      </mesh>
      <mesh position={[0.28, 0.42, 0.01]} rotation={[0, 0, -0.1]}>
        <boxGeometry args={[0.25, 0.05, 0.02]} />
        <meshBasicMaterial color="#312e81" />
      </mesh>

      {/* Olhos Detalhados */}
      {[-0.28, 0.28].map((x, i) => (
        <group key={i} position={[x, 0.15, 0]}>
          {/* Fundo Branco */}
          <mesh>
            <planeGeometry args={[0.25, 0.35]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Íris Azul */}
          <mesh position={[0, -0.02, 0.01]}>
            <planeGeometry args={[0.18, 0.2]} />
            <meshBasicMaterial color="#3b82f6" />
          </mesh>
          {/* Pupila */}
          <mesh position={[0, -0.02, 0.02]}>
            <planeGeometry args={[0.08, 0.1]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          {/* Brilho do Olhar */}
          <mesh position={[0.05, 0.08, 0.03]}>
            <planeGeometry args={[0.05, 0.05]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}

      {/* Boca com Volume 3D (Lábios) */}
      <group position={[0, -0.25, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <torusGeometry args={[0.18, 0.04, 12, 24, Math.PI]} />
          <meshStandardMaterial color="#991b1b" roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
};

const Player: React.FC<PlayerProps> = ({ 
  onMove, 
  joystickVector, 
  jumpPressed, 
  isSitting = false, 
  setIsSitting,
  benchPositions = [],
  visible = true,
  isOnTrampoline = false
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);

  const { camera } = useThree();
  const [keys, setKeys] = useState<Record<string, boolean>>({});
  
  const velocityV = useRef(0);
  const isGrounded = useRef(true);
  const gravity = -35;
  const jumpStrength = 15;
  const trampolineBoost = 28;

  const sitData = useRef<{ pos: THREE.Vector3, rot: number } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => setKeys(s => ({ ...s, [e.code]: true }));
    const handleKeyUp = (e: KeyboardEvent) => setKeys(s => ({ ...s, [e.code]: false }));
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (isSitting && groupRef.current) {
      let closestBench = null;
      let minDist = Infinity;
      const pPos = groupRef.current.position;
      for (const b of benchPositions) {
        const bVec = new THREE.Vector3(...b.pos);
        const d = pPos.distanceTo(bVec);
        if (d < minDist) { minDist = d; closestBench = b; }
      }
      if (closestBench) {
        const targetPos = new THREE.Vector3(...closestBench.pos);
        targetPos.y = 0.5; 
        groupRef.current.position.copy(targetPos);
        groupRef.current.rotation.y = closestBench.rot[1];
        sitData.current = { pos: targetPos.clone(), rot: closestBench.rot[1] };
      }
    } else { sitData.current = null; }
  }, [isSitting, benchPositions]);

  const checkCollision = (newX: number, newZ: number): boolean => {
    const mapLimit = 145;
    if (Math.abs(newX) > mapLimit || Math.abs(newZ) > mapLimit) return true;
    const playerRadius = 1.5;
    for (const obs of OBSTACLES) {
      if ('radius' in obs) {
        const dx = newX - obs.x;
        const dz = newZ - obs.z;
        if (Math.sqrt(dx * dx + dz * dz) < (obs.radius + playerRadius)) return true;
      } else {
        const halfW = (obs.w || 0) / 2 + playerRadius;
        const halfD = (obs.d || 0) / 2 + playerRadius;
        if (newX > obs.x - halfW && newX < obs.x + halfW && newZ > obs.z - halfD && newZ < obs.z + halfD) return true;
      }
    }
    return false;
  };

  useFrame((state, delta) => {
    if (!groupRef.current || !visible) return;

    if (isSitting && sitData.current) {
      groupRef.current.position.copy(sitData.current.pos);
      groupRef.current.rotation.y = sitData.current.rot;
      if (leftLegRef.current) { leftLegRef.current.rotation.x = -Math.PI / 2; leftLegRef.current.position.z = 0.5; }
      if (rightLegRef.current) { rightLegRef.current.rotation.x = -Math.PI / 2; rightLegRef.current.position.z = 0.5; }
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0.2;
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0.2;
      onMove?.(groupRef.current.position);
      return;
    }

    if (isOnTrampoline && isGrounded.current) {
      velocityV.current = trampolineBoost;
      isGrounded.current = false;
    }

    if ((keys['Space'] || jumpPressed) && isGrounded.current) {
      velocityV.current = jumpStrength;
      isGrounded.current = false;
    }

    if (!isGrounded.current) {
      velocityV.current += gravity * delta;
      groupRef.current.position.y += velocityV.current * delta;
      
      const groundY = isOnTrampoline ? 1.2 : 0;
      if (groupRef.current.position.y <= groundY) {
        groupRef.current.position.y = groundY;
        velocityV.current = isOnTrampoline ? trampolineBoost : 0;
        isGrounded.current = isOnTrampoline ? false : true;
      }
    }

    const moveSpeed = 16;
    const direction = new THREE.Vector3();
    if (keys['KeyW'] || keys['ArrowUp']) direction.z -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) direction.z += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) direction.x -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) direction.x += 1;
    if (joystickVector && (joystickVector.x !== 0 || joystickVector.y !== 0)) {
      direction.x = joystickVector.x;
      direction.z = -joystickVector.y;
    }

    const isMoving = direction.length() > 0.1;
    if (isMoving) {
      const camYRotation = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ').y;
      direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), camYRotation);
      const nextX = groupRef.current.position.x + direction.x * moveSpeed * delta;
      const nextZ = groupRef.current.position.z + direction.z * moveSpeed * delta;
      if (!checkCollision(nextX, groupRef.current.position.z)) groupRef.current.position.x = nextX;
      if (!checkCollision(groupRef.current.position.x, nextZ)) groupRef.current.position.z = nextZ;
      const targetRotation = Math.atan2(direction.x, direction.z);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation, 12 * delta);
    }

    const time = state.clock.elapsedTime * 14;
    if (isMoving && isGrounded.current) {
      if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(time) * 0.9;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.sin(time) * 0.9;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -Math.sin(time) * 0.9;
      if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(time) * 0.9;
      groupRef.current.position.y = Math.abs(Math.sin(time)) * 0.2 + (isOnTrampoline ? 1.2 : 0);
    } else if (!isGrounded.current) {
        if (leftLegRef.current) leftLegRef.current.rotation.x = 0.2;
        if (rightLegRef.current) rightLegRef.current.rotation.x = -0.2;
    } else {
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0;
    }

    onMove?.(groupRef.current.position);
  });

  return (
    <group ref={groupRef} position={[0, 0, 80]} visible={visible}>
      <mesh position={[0, 3.5, 0]} castShadow>
        <boxGeometry args={[2, 2.5, 1]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      <group position={[0, 5.3, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.7, 0.7, 1.2, 12]} />
          <meshStandardMaterial color="#facc15" />
        </mesh>
        <group position={[0, 0.4, 0]}>
          <mesh position={[0, 0.4, 0]} castShadow>
            <boxGeometry args={[1.7, 0.5, 1.7]} />
            <meshStandardMaterial color="#451a03" />
          </mesh>
          <mesh position={[0, 0, -0.6]} castShadow>
            <boxGeometry args={[1.4, 1, 0.4]} />
            <meshStandardMaterial color="#451a03" />
          </mesh>
          <mesh position={[0.8, 0, 0]} castShadow>
            <boxGeometry args={[0.3, 1.2, 1.3]} />
            <meshStandardMaterial color="#451a03" />
          </mesh>
          <mesh position={[-0.8, 0, 0]} castShadow>
            <boxGeometry args={[0.3, 1.2, 1.3]} />
            <meshStandardMaterial color="#451a03" />
          </mesh>
        </group>
        <PlayerFace />
      </group>
      <mesh ref={leftArmRef} position={[-1.3, 3.5, 0]} castShadow>
        <boxGeometry args={[0.6, 2.2, 0.6]} />
        <meshStandardMaterial color="#facc15" />
      </mesh>
      <mesh ref={rightArmRef} position={[1.3, 3.5, 0]} castShadow>
        <boxGeometry args={[0.6, 2.2, 0.6]} />
        <meshStandardMaterial color="#facc15" />
      </mesh>
      <mesh ref={leftLegRef} position={[-0.5, 1.2, 0]} castShadow><boxGeometry args={[0.8, 2.4, 0.9]} /><meshStandardMaterial color="#166534" /></mesh>
      <mesh ref={rightLegRef} position={[0.5, 1.2, 0]} castShadow><boxGeometry args={[0.8, 2.4, 0.9]} /><meshStandardMaterial color="#166534" /></mesh>
    </group>
  );
};

export default Player;
