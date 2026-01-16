
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

// Global SFX Utility for Mini-Games
export const playMiniGameSound = (type: 'pop' | 'clink' | 'break', position: THREE.Vector3, camera: THREE.Camera) => {
  const audioCtx = THREE.AudioContext.getContext();
  const panner = audioCtx.createPanner();
  
  // Set panner position relative to camera
  panner.panningModel = 'HRTF';
  panner.distanceModel = 'inverse';
  panner.refDistance = 5;
  panner.maxDistance = 100;
  panner.rolloffFactor = 1;
  
  panner.positionX.value = position.x;
  panner.positionY.value = position.y;
  panner.positionZ.value = position.z;

  const masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0.2, audioCtx.currentTime);
  masterGain.connect(audioCtx.destination);
  panner.connect(masterGain);

  const now = audioCtx.currentTime;

  if (type === 'pop') {
    // Balloon Pop: Short sine sweep + noise
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(10, now + 0.1);
    g.gain.setValueAtTime(0.5, now);
    g.gain.linearRampToValueAtTime(0, now + 0.1);
    osc.connect(g);
    g.connect(panner);
    osc.start();
    osc.stop(now + 0.1);
  } else if (type === 'clink') {
    // Ring Toss Clink: High metallic ping
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
    g.gain.setValueAtTime(0.3, now);
    g.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.connect(g);
    g.connect(panner);
    osc.start();
    osc.stop(now + 0.3);
  } else if (type === 'break') {
    // Bottle Break: White noise burst
    const bufferSize = audioCtx.sampleRate * 0.2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.4, now);
    g.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    
    noise.connect(filter);
    filter.connect(g);
    g.connect(panner);
    noise.start();
  }
};

export default AudioSystem;
