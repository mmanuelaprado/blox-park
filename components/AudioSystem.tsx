
import React, { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

const AudioSystem: React.FC<{ dayTime: boolean }> = ({ dayTime }) => {
  const { camera } = useThree();
  const listenerRef = useRef<THREE.AudioListener>(new THREE.AudioListener());

  useEffect(() => {
    camera.add(listenerRef.current);
    return () => {
      camera.remove(listenerRef.current);
    };
  }, [camera]);

  return null;
};

// Hook para criar um som de motor/ambiente posicional
export const useRideAudio = (isActive: boolean, type: 'motor' | 'music' | 'coaster') => {
  const { camera } = useThree();
  const soundRef = useRef<THREE.PositionalAudio | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    const audioCtx = THREE.AudioContext.getContext();
    const listener = camera.children.find(c => c instanceof THREE.AudioListener) as THREE.AudioListener;
    
    if (!listener) return;

    const sound = new THREE.PositionalAudio(listener);
    sound.setRefDistance(10);
    sound.setMaxDistance(100);
    soundRef.current = sound;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gainRef.current = gain;
    
    sound.setNodeSource(gain as any);

    return () => {
      if (oscRef.current) oscRef.current.stop();
      sound.disconnect();
    };
  }, [camera]);

  useEffect(() => {
    const audioCtx = THREE.AudioContext.getContext();
    const now = audioCtx.currentTime;

    if (isActive) {
      const osc = audioCtx.createOscillator();
      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();

      if (type === 'motor') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(60, now);
        lfo.frequency.setValueAtTime(0.5, now);
        lfoGain.gain.setValueAtTime(10, now);
        gainRef.current?.gain.exponentialRampToValueAtTime(0.1, now + 1);
      } else if (type === 'music') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, now);
        lfo.frequency.setValueAtTime(2, now);
        lfoGain.gain.setValueAtTime(50, now);
        gainRef.current?.gain.exponentialRampToValueAtTime(0.05, now + 1);
      } else if (type === 'coaster') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(40, now);
        lfo.frequency.setValueAtTime(8, now);
        lfoGain.gain.setValueAtTime(20, now);
        gainRef.current?.gain.exponentialRampToValueAtTime(0.15, now + 0.5);
      }

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      osc.connect(gainRef.current!);
      
      osc.start();
      lfo.start();
      oscRef.current = osc;
    } else {
      gainRef.current?.gain.exponentialRampToValueAtTime(0.001, now + 1);
      setTimeout(() => {
        if (oscRef.current) {
          oscRef.current.stop();
          oscRef.current = null;
        }
      }, 1000);
    }
  }, [isActive, type]);

  return soundRef;
};

export const playMiniGameSound = (type: 'pop' | 'clink' | 'break', position: THREE.Vector3, camera: THREE.Camera) => {
  const audioCtx = THREE.AudioContext.getContext();
  const panner = audioCtx.createPanner();
  panner.panningModel = 'HRTF';
  panner.positionX.value = position.x;
  panner.positionY.value = position.y;
  panner.positionZ.value = position.z;

  const masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0.2, audioCtx.currentTime);
  masterGain.connect(audioCtx.destination);
  panner.connect(masterGain);

  const now = audioCtx.currentTime;
  if (type === 'pop') {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(10, now + 0.1);
    g.gain.setValueAtTime(0.5, now);
    g.gain.linearRampToValueAtTime(0, now + 0.1);
    osc.connect(g); g.connect(panner);
    osc.start(); osc.stop(now + 0.1);
  } else if (type === 'clink') {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);
    g.gain.setValueAtTime(0.3, now);
    g.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.connect(g); g.connect(panner);
    osc.start(); osc.stop(now + 0.3);
  }
};

export default AudioSystem;
