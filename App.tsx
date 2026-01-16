
import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky, Stars, PerspectiveCamera, Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import World from './components/World';
import UIOverlay from './components/UIOverlay';
import AudioSystem from './components/AudioSystem';
import Shop from './components/Shop';

const CameraManager: React.FC<{ 
  ridingRide: string | null, 
  rideRef: React.MutableRefObject<THREE.Group | null>,
  playerPos: THREE.Vector3
}> = ({ ridingRide, rideRef, playerPos }) => {
  useFrame((state) => {
    if (ridingRide && rideRef.current) {
      const seat = rideRef.current;
      const worldPos = new THREE.Vector3();
      const worldQuat = new THREE.Quaternion();
      seat.getWorldPosition(worldPos);
      seat.getWorldQuaternion(worldQuat);
      
      state.camera.position.lerp(worldPos, 0.2);
      state.camera.quaternion.slerp(worldQuat, 0.2);
    }
  });
  return null;
};

const App: React.FC = () => {
  const [dayTime, setDayTime] = useState(true);
  const [audioStarted, setAudioStarted] = useState(false);
  const [joystick, setJoystick] = useState({ x: 0, y: 0 });
  const [jumpPressed, setJumpPressed] = useState(false);
  const [isSitting, setIsSitting] = useState(false);
  const [nearRide, setNearRide] = useState<string | null>(null);
  const [ridingRide, setRidingRide] = useState<string | null>(null);
  const [nearBench, setNearBench] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  
  // Sistema de Economia
  const [coins, setCoins] = useState(50); // Começa com um pouco de dinheiro
  const [ownedItems, setOwnedItems] = useState<string[]>([]);
  const [activeAccessory, setActiveAccessory] = useState<string | null>(null);

  const orbitRef = useRef<any>(null);
  const [playerPos, setPlayerPos] = useState(new THREE.Vector3(0, 0, 80));
  const ridePOVRef = useRef<THREE.Group>(null);

  // Ganho passivo de moedas
  useEffect(() => {
    const interval = setInterval(() => {
      setCoins(prev => prev + 1);
    }, 5000); // 1 moeda a cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleFirstClick = () => {
      setAudioStarted(true);
      window.removeEventListener('mousedown', handleFirstClick);
      window.removeEventListener('touchstart', handleFirstClick);
    };
    window.addEventListener('mousedown', handleFirstClick);
    window.addEventListener('touchstart', handleFirstClick);
    return () => {
      window.removeEventListener('mousedown', handleFirstClick);
      window.removeEventListener('touchstart', handleFirstClick);
    };
  }, []);

  const handlePlayerMove = (pos: THREE.Vector3) => {
    if (orbitRef.current && !ridingRide) {
      orbitRef.current.target.lerp(new THREE.Vector3(pos.x, pos.y + 4, pos.z), 0.2);
      orbitRef.current.update();
    }
    setPlayerPos(pos.clone());
  };

  const handleToggleRide = () => {
    if (ridingRide) {
      setRidingRide(null);
      setIsSitting(false);
    } else if (nearRide) {
      setRidingRide(nearRide);
      setIsSitting(true);
      setCoins(prev => prev + 10); // Bônus por andar em brinquedos
    }
  };

  return (
    <div className="w-full h-screen bg-sky-400 relative touch-none overflow-hidden select-none font-sans">
      <Canvas 
        shadows 
        dpr={[1, 1.5]}
        gl={{ 
          antialias: true, 
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 10, 20]} fov={60} />
        <OrbitControls 
          ref={orbitRef}
          enabled={!ridingRide && !isShopOpen}
          enablePan={false}
          maxPolarAngle={Math.PI / 2.1}
          minPolarAngle={Math.PI / 6}
          minDistance={12}
          maxDistance={25}
          makeDefault
        />
        
        <CameraManager ridingRide={ridingRide} rideRef={ridePOVRef} playerPos={playerPos} />
        
        <Suspense fallback={null}>
          {audioStarted && <AudioSystem dayTime={dayTime} />}
          
          {dayTime ? (
            <>
              <Sky distance={450000} sunPosition={[100, 80, 100]} />
              <Environment preset="city" />
              <ambientLight intensity={1.5} />
              <directionalLight position={[50, 120, 50]} intensity={2} castShadow shadow-bias={-0.0001} />
            </>
          ) : (
            <>
              <Stars radius={100} depth={50} count={3000} factor={4} />
              <ambientLight intensity={0.4} color="#222244" />
            </>
          )}

          <World 
            joystickVector={joystick} 
            jumpPressed={jumpPressed} 
            isSitting={isSitting}
            setIsSitting={setIsSitting}
            onNearBench={setNearBench}
            onNearRide={setNearRide}
            onPlayerMove={handlePlayerMove}
            ridingRide={ridingRide}
            ridePOVRef={ridePOVRef}
            activeAccessory={activeAccessory}
          />
        </Suspense>
      </Canvas>

      {!audioStarted && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
          <div className="text-center p-8 bg-gray-800 rounded-3xl border border-yellow-500/50 shadow-2xl">
             <h2 className="text-3xl font-black text-yellow-400 mb-2 uppercase italic">BloxPark Interactive</h2>
             <p className="text-white text-sm mb-6 opacity-80 text-center uppercase font-bold tracking-widest">Toque para Jogar</p>
          </div>
        </div>
      )}

      {!isSitting && !ridingRide && !isShopOpen && (
        <div 
          className="absolute bottom-10 left-10 w-32 h-32 bg-white/10 rounded-full border border-white/20 backdrop-blur-sm flex items-center justify-center z-10"
          onTouchMove={(e) => {
            const touch = e.touches[0];
            const rect = e.currentTarget.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const dx = (touch.clientX - centerX) / (rect.width / 2);
            const dy = (touch.clientY - centerY) / (rect.height / 2);
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist > 1) {
              setJoystick({ x: dx / dist, y: -dy / dist });
            } else {
              setJoystick({ x: dx, y: -dy });
            }
          }}
          onTouchEnd={() => setJoystick({ x: 0, y: 0 })}
        >
          <div className="w-12 h-12 bg-yellow-500 rounded-full" style={{ transform: `translate(${joystick.x * 30}px, ${-joystick.y * 30}px)` }} />
        </div>
      )}

      <div className="absolute bottom-12 right-12 flex flex-col gap-4 z-10">
        {(nearRide || ridingRide) && (
          <button 
            className={`w-24 h-24 rounded-full border-4 border-white/40 backdrop-blur-md shadow-2xl flex items-center justify-center active:scale-95 transition-all font-black text-xs uppercase ${ridingRide ? 'bg-red-500/80' : 'bg-yellow-500/80'}`}
            onClick={handleToggleRide}
          >
            {ridingRide ? 'SAIR' : 'ENTRAR'}
          </button>
        )}

        {nearBench && !isSitting && !ridingRide && (
          <button 
            className="w-20 h-20 bg-green-500/70 rounded-full border-4 border-white/30 backdrop-blur-md shadow-xl flex items-center justify-center active:scale-95 font-black text-xs uppercase"
            onClick={() => setIsSitting(true)}
          >
            SENTAR
          </button>
        )}

        {!ridingRide && !isShopOpen && (
          <button 
            className="w-20 h-20 bg-blue-500/50 rounded-full border-4 border-white/30 backdrop-blur-md shadow-xl flex items-center justify-center active:scale-95 font-black text-xs uppercase"
            onTouchStart={() => isSitting ? setIsSitting(false) : setJumpPressed(true)}
            onTouchEnd={() => setJumpPressed(false)}
            onMouseDown={() => isSitting ? setIsSitting(false) : setJumpPressed(true)}
            onMouseUp={() => setJumpPressed(false)}
          >
            {isSitting ? 'LEVANTAR' : 'PULO'}
          </button>
        )}
      </div>

      <UIOverlay 
        dayTime={dayTime} 
        toggleDay={() => setDayTime(!dayTime)} 
        coins={coins} 
        openShop={() => setIsShopOpen(true)}
      />

      {isShopOpen && (
        <Shop 
          coins={coins} 
          setCoins={setCoins} 
          ownedItems={ownedItems} 
          setOwnedItems={setOwnedItems}
          activeAccessory={activeAccessory}
          setActiveAccessory={setActiveAccessory}
          closeShop={() => setIsShopOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
