
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
  activeAccessory?: string | null;
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
];

const Accessory: React.FC<{ type: string | null }> = ({ type }) => {
  if (!type) return null;
  
  if (type === 'red_hat' || type === 'blue_hat') {
    return (
      <group position={[0, 1.2, 0.1]}>
        <mesh castShadow>
          <boxGeometry args={[1.6, 0.4, 1.6]} />
          <meshStandardMaterial color={type.includes('red') ? '#ef4444' : '#3b82f6'} />
        </mesh>
        <mesh position={[0, -0.1, 0.8]} castShadow>
          <boxGeometry args={[1.4, 0.1, 0.8]} />
          <meshStandardMaterial color={type.includes('red') ? '#ef4444' : '#3b82f6'} />
        </mesh>
      </group>
    );
  }

  if (type === 'gold_crown') {
    return (
      <group position={[0, 1.3, 0]}>
        <mesh castShadow>
          <torusGeometry args={[0.8, 0.15, 8, 24]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#facc15" metalness={1} roughness={0} />
        </mesh>
        {[0, 1, 2, 3].map(i => (
          <mesh key={i} rotation={[0, (i / 4) * Math.PI * 2, 0]} position={[0, 0.3, 0.7]} castShadow>
            <coneGeometry args={[0.2, 0.6, 4]} />
            <meshStandardMaterial color="#facc15" metalness={1} />
          </mesh>
        ))}
      </group>
    );
  }

  if (type.includes('cape')) {
    return (
      <mesh position={[0, -0.5, -0.6]} rotation={[0.1, 0, 0]} castShadow>
        <boxGeometry args={[1.8, 3.5, 0.1]} />
        <meshStandardMaterial color={type.includes('dark') ? '#1e293b' : '#ef4444'} />
      </mesh>
    );
  }

  return null;
};

const PlayerFace: React.FC = () => {
  return (
    <group position={[0, 0.6, 0.605]}>
      <mesh position={[-0.28, 0.42, 0.01]} rotation={[0, 0, 0.1]}>
        <boxGeometry args={[0.25, 0.05, 0.02]} />
        <meshBasicMaterial color="#312e81" />
      </mesh>
      <mesh position={[0.28, 0.42, 0.01]} rotation={[0, 0, -0.1]}>
        <boxGeometry args={[0.25, 0.05, 0.02]} />
        <meshBasicMaterial color="#312e81" />
      </mesh>
      {[-0.28, 0.28].map((x, i) => (
        <group key={i} position={[x, 0.15, 0]}>
          <mesh><planeGeometry args={[0.25, 0.35]} /><meshBasicMaterial color="#ffffff" /></mesh>
          <mesh position={[0, -0.02, 0.01]}><planeGeometry args={[0.18, 0.2]} /><meshBasicMaterial color="#3b82f6" /></mesh>
          <mesh position={[0, -0.02, 0.02]}><planeGeometry args={[0.08, 0.1]} /><meshBasicMaterial color="#000000" /></mesh>
          <mesh position={[0.05, 0.08, 0.03]}><planeGeometry args={[0.05, 0.05]} /><meshBasicMaterial color="#ffffff" /></mesh>
        </group>
      ))}
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
  onMove, joystickVector, jumpPressed, isSitting = false, 
  setIsSitting, benchPositions = [], visible = true, 
  isOnTrampoline = false, activeAccessory = null 
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  const { camera } = useThree();
  const [keys, setKeys] = useState<Record<string, boolean>>({});
  const velocityV = useRef(0);
  const isGrounded = useRef(true);
  const targetSitPos = useRef<THREE.Vector3 | null>(null);
  const targetSitRot = useRef<number>(0);

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
      let closest = null;
      let minDist = Infinity;
      benchPositions.forEach(b => {
        const d = groupRef.current!.position.distanceTo(new THREE.Vector3(...b.pos));
        if (d < minDist) { minDist = d; closest = b; }
      });
      if (closest) {
        targetSitPos.current = new THREE.Vector3(closest.pos[0], 1.5, closest.pos[2]);
        targetSitRot.current = closest.rot[1];
        velocityV.current = 0;
        isGrounded.current = true;
      }
    } else if (!isSitting && groupRef.current && targetSitPos.current) {
      const angle = groupRef.current.rotation.y;
      groupRef.current.position.x += Math.sin(angle) * 2.5;
      groupRef.current.position.z += Math.cos(angle) * 2.5;
      groupRef.current.position.y = 0;
      targetSitPos.current = null;
    }
  }, [isSitting, benchPositions]);

  useFrame((state, delta) => {
    if (!groupRef.current || !visible) return;
    const lerpSpeed = 10 * delta;

    if (isSitting && targetSitPos.current) {
      groupRef.current.position.lerp(targetSitPos.current, 12 * delta);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetSitRot.current, 12 * delta);
      if (leftLegRef.current) leftLegRef.current.rotation.x = -Math.PI / 2.2;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.PI / 2.2;
      if (bodyRef.current) bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, 1.25, lerpSpeed);
      onMove?.(groupRef.current.position);
      return;
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
      
      const checkCollision = (nx: number, nz: number) => {
        const limit = 145;
        if (Math.abs(nx) > limit || Math.abs(nz) > limit) return true;
        for (const obs of OBSTACLES) {
          if ('radius' in obs) {
            const d = Math.sqrt((nx - obs.x)**2 + (nz - obs.z)**2);
            if (d < obs.radius + 1.5) return true;
          } else {
            const hw = (obs.w || 0)/2 + 1.5;
            const hd = (obs.d || 0)/2 + 1.5;
            if (nx > obs.x-hw && nx < obs.x+hw && nz > obs.z-hd && nz < obs.z+hd) return true;
          }
        }
        return false;
      };

      if (!checkCollision(nextX, groupRef.current.position.z)) groupRef.current.position.x = nextX;
      if (!checkCollision(groupRef.current.position.x, nextZ)) groupRef.current.position.z = nextZ;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, Math.atan2(direction.x, direction.z), 12 * delta);
    }

    if ((keys['Space'] || jumpPressed) && isGrounded.current) {
      velocityV.current = 15;
      isGrounded.current = false;
    }
    if (!isGrounded.current) {
      velocityV.current -= 35 * delta;
      groupRef.current.position.y += velocityV.current * delta;
      const groundY = isOnTrampoline ? 1.2 : 0;
      if (groupRef.current.position.y <= groundY) {
        groupRef.current.position.y = groundY;
        velocityV.current = 0;
        isGrounded.current = true;
      }
    }

    const time = state.clock.elapsedTime * 14;
    if (isMoving && isGrounded.current) {
      if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(time) * 0.8;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -Math.sin(time) * 0.8;
      if (bodyRef.current) bodyRef.current.position.y = 2.4 + Math.abs(Math.sin(time)) * 0.15; 
    } else {
      const reset = (ref: any) => ref.current && (ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, 0, lerpSpeed));
      reset(leftLegRef); reset(rightLegRef);
      if (bodyRef.current) bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, 2.4, lerpSpeed);
    }
    onMove?.(groupRef.current.position);
  });

  return (
    <group ref={groupRef} position={[0, 0, 80]} visible={visible}>
      <group ref={bodyRef} position={[0, 2.4, 0]}>
        <mesh position={[0, 1.25, 0]} castShadow>
          <boxGeometry args={[2, 2.5, 1]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>
        
        {activeAccessory?.includes('cape') && <Accessory type={activeAccessory} />}

        <group position={[0, 2.5, 0]}>
          <mesh position={[0, 0.6, 0]} castShadow>
            <cylinderGeometry args={[0.7, 0.7, 1.2, 12]} />
            <meshStandardMaterial color="#facc15" />
          </mesh>
          
          {activeAccessory?.includes('hat') || activeAccessory?.includes('crown') ? <Accessory type={activeAccessory} /> : (
            <group position={[0, 1.0, 0]}>
              <mesh position={[0, 0.4, 0]} castShadow><boxGeometry args={[1.7, 0.5, 1.7]} /><meshStandardMaterial color="#451a03" /></mesh>
              <mesh position={[0, 0, -0.6]} castShadow><boxGeometry args={[1.4, 1, 0.4]} /><meshStandardMaterial color="#451a03" /></mesh>
              <mesh position={[0.8, 0, 0]} castShadow><boxGeometry args={[0.3, 1.2, 1.3]} /><meshStandardMaterial color="#451a03" /></mesh>
              <mesh position={[-0.8, 0, 0]} castShadow><boxGeometry args={[0.3, 1.2, 1.3]} /><meshStandardMaterial color="#451a03" /></mesh>
            </group>
          )}
          
          <PlayerFace />
        </group>

        <group ref={leftArmRef} position={[-1.3, 2.3, 0]}>
          <mesh position={[0, -1.1, 0]} castShadow><boxGeometry args={[0.6, 2.2, 0.6]} /><meshStandardMaterial color="#facc15" /></mesh>
        </group>
        <group ref={rightArmRef} position={[1.3, 2.3, 0]}>
          <mesh position={[0, -1.1, 0]} castShadow><boxGeometry args={[0.6, 2.2, 0.6]} /><meshStandardMaterial color="#facc15" /></mesh>
        </group>
        <group ref={leftLegRef} position={[-0.5, 0, 0]}>
          <mesh position={[0, -1.2, 0]} castShadow><boxGeometry args={[0.8, 2.4, 0.9]} /><meshStandardMaterial color="#166534" /></mesh>
        </group>
        <group ref={rightLegRef} position={[0.5, 0, 0]}>
          <mesh position={[0, -1.2, 0]} castShadow><boxGeometry args={[0.8, 2.4, 0.9]} /><meshStandardMaterial color="#166534" /></mesh>
        </group>
      </group>
    </group>
  );
};

export default Player;
