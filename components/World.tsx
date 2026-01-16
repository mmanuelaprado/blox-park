
import React, { useState } from 'react';
import * as THREE from 'three';
import FerrisWheel from './FerrisWheel';
import Carousel from './Carousel';
import RollerCoaster from './RollerCoaster';
import Path from './Path';
import Trees from './Trees';
import Character from './Character';
import Bench from './Bench';
import FoodStall from './FoodStall';
import MiniGameStall from './MiniGameStall';
import Player from './Player';
import Trampoline from './Trampoline';
import Swing from './Swing';
import Slide from './Slide';
import Spinner from './Spinner';
import EntranceSign from './EntranceSign';

interface WorldProps {
  joystickVector?: { x: number; y: number };
  jumpPressed?: boolean;
  isSitting?: boolean;
  setIsSitting?: (val: boolean) => void;
  onNearBench?: (val: boolean) => void;
  onNearRide?: (val: string | null) => void;
  onPlayerMove?: (pos: THREE.Vector3) => void;
  ridingRide?: string | null;
  ridePOVRef?: React.MutableRefObject<THREE.Group | null>;
  activeAccessory?: string | null;
}

const BENCH_POSITIONS: { pos: [number, number, number], rot: [number, number, number] }[] = [
  { pos: [-10, 0, 60], rot: [0, Math.PI / 2, 0] },
  { pos: [10, 0, 60], rot: [0, -Math.PI / 2, 0] },
  { pos: [-18, 0, 20], rot: [0, 0, 0] },
  { pos: [18, 0, 20], rot: [0, 0, 0] },
  { pos: [0, 0, 5], rot: [0, 0, 0] },
  { pos: [-40, 0, 10], rot: [0, 0, 0] },
  { pos: [40, 0, 10], rot: [0, 0, 0] }
];

const TRAMPOLINE_POS: [number, number, number] = [-30, 0, 90];
const SWING_POS: [number, number, number] = [30, 0, 90];

const World: React.FC<WorldProps> = ({ 
  joystickVector, jumpPressed, isSitting = false, setIsSitting, 
  onNearBench, onNearRide, onPlayerMove, ridingRide, ridePOVRef, activeAccessory
}) => {
  const [activeRides, setActiveRides] = useState({
    ferris: false, carousel: false, roller: false, swing: false
  });
  const [isOnTrampoline, setIsOnTrampoline] = useState(false);

  const checkProximity = (charPos: THREE.Vector3) => {
    onPlayerMove?.(charPos);
    const trampPos = new THREE.Vector3(...TRAMPOLINE_POS);
    setIsOnTrampoline(charPos.distanceTo(trampPos) < 6);

    const ferrisPos = new THREE.Vector3(-40, 0, -20);
    const carouselPos = new THREE.Vector3(40, 0, -20);
    const rollerPos = new THREE.Vector3(0, 0, -70);
    const swingPos = new THREE.Vector3(...SWING_POS);

    const distFerris = charPos.distanceTo(ferrisPos);
    const distCarousel = charPos.distanceTo(carouselPos);
    const distRoller = charPos.distanceTo(rollerPos);
    const distSwing = charPos.distanceTo(swingPos);

    if (distFerris < 15) onNearRide?.('ferris');
    else if (distCarousel < 15) onNearRide?.('carousel');
    else if (distRoller < 20) onNearRide?.('roller');
    else if (distSwing < 10) onNearRide?.('swing');
    else onNearRide?.(null);

    let isNearAnyBench = false;
    for (const b of BENCH_POSITIONS) {
      if (charPos.distanceTo(new THREE.Vector3(...b.pos)) < 6) { isNearAnyBench = true; break; }
    }
    onNearBench?.(isNearAnyBench);

    setActiveRides({ 
      ferris: distFerris < 60, carousel: distCarousel < 60, 
      roller: distRoller < 80, swing: distSwing < 40 
    });
  };

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#3a6321" />
      </mesh>

      <Player 
        onMove={checkProximity} 
        joystickVector={joystickVector} 
        jumpPressed={jumpPressed}
        isSitting={isSitting}
        setIsSitting={setIsSitting}
        benchPositions={BENCH_POSITIONS}
        visible={!ridingRide}
        isOnTrampoline={isOnTrampoline}
        activeAccessory={activeAccessory}
      />

      <Character position={[-15, 0, 50]} id="noob1" benchPositions={BENCH_POSITIONS} />
      <Character position={[20, 0, 30]} id="noob2" benchPositions={BENCH_POSITIONS} />
      <Character position={[0, 0, -30]} id="noob3" benchPositions={BENCH_POSITIONS} />
      <Character position={[50, 0, 80]} id="noob4" benchPositions={BENCH_POSITIONS} />

      {BENCH_POSITIONS.map((b, i) => (
        <Bench key={i} position={b.pos} rotation={b.rot} onClick={() => setIsSitting?.(true)} />
      ))}

      <EntranceSign />
      <Trampoline position={TRAMPOLINE_POS} />
      <Swing position={SWING_POS} rotation={[0, Math.PI / 4, 0]} isRiding={ridingRide === 'swing'} ridePOVRef={ridePOVRef} />
      <Slide position={[60, 0, 40]} rotation={[0, -Math.PI / 2, 0]} />
      <Spinner position={[-60, 0, 40]} />

      <FoodStall position={[-25, 0, 45]} type="pizza" />
      <FoodStall position={[25, 0, 45]} type="icecream" />

      <FerrisWheel position={[-40, 0, -20]} isActive={activeRides.ferris} isRiding={ridingRide === 'ferris'} ridePOVRef={ridePOVRef} />
      <Carousel position={[40, 0, -20]} isActive={activeRides.carousel} isRiding={ridingRide === 'carousel'} ridePOVRef={ridePOVRef} />
      <RollerCoaster position={[0, 0, -70]} isActive={activeRides.roller} isRiding={ridingRide === 'roller'} ridePOVRef={ridePOVRef} />

      <Path />
      <Trees />
    </group>
  );
};

export default World;
