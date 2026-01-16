
import React, { useLayoutEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';

const Trees: React.FC = () => {
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const foliageLowerRef = useRef<THREE.InstancedMesh>(null);
  const foliageUpperRef = useRef<THREE.InstancedMesh>(null);

  const treePositions: [number, number, number][] = useMemo(() => [
    [-15, 0, 40], [15, 0, 40], [-15, 0, 60], [15, 0, 60],
    [-45, 0, -10], [45, 0, -10], [-40, 0, -40], [40, 0, -40],
    [-10, 0, -40], [10, 0, -40], [-60, 0, 20], [60, 0, 20],
    [-70, 0, 80], [70, 0, 80], [0, 0, 120], [-30, 0, 110], [30, 0, 110]
  ], []);

  useLayoutEffect(() => {
    const tempObject = new THREE.Object3D();

    treePositions.forEach((pos, i) => {
      // Configurar troncos
      tempObject.position.set(pos[0], pos[1] + 2.5, pos[2]);
      tempObject.scale.set(1, 1, 1);
      tempObject.updateMatrix();
      trunkRef.current?.setMatrixAt(i, tempObject.matrix);

      // Configurar folhagem inferior
      tempObject.position.set(pos[0], pos[1] + 6, pos[2]);
      tempObject.scale.set(1, 1, 1);
      tempObject.updateMatrix();
      foliageLowerRef.current?.setMatrixAt(i, tempObject.matrix);

      // Configurar folhagem superior
      tempObject.position.set(pos[0], pos[1] + 9, pos[2]);
      tempObject.scale.set(1, 1, 1);
      tempObject.updateMatrix();
      foliageUpperRef.current?.setMatrixAt(i, tempObject.matrix);
    });

    trunkRef.current!.instanceMatrix.needsUpdate = true;
    foliageLowerRef.current!.instanceMatrix.needsUpdate = true;
    foliageUpperRef.current!.instanceMatrix.needsUpdate = true;
  }, [treePositions]);

  return (
    <group>
      {/* Troncos */}
      <instancedMesh ref={trunkRef} args={[null as any, null as any, treePositions.length]} castShadow>
        <boxGeometry args={[1, 5, 1]} />
        <meshStandardMaterial color="#78350f" />
      </instancedMesh>

      {/* Folhagem Inferior */}
      <instancedMesh ref={foliageLowerRef} args={[null as any, null as any, treePositions.length]} castShadow>
        <boxGeometry args={[4, 4, 4]} />
        <meshStandardMaterial color="#166534" />
      </instancedMesh>

      {/* Folhagem Superior */}
      <instancedMesh ref={foliageUpperRef} args={[null as any, null as any, treePositions.length]} castShadow>
        <boxGeometry args={[2.5, 2.5, 2.5]} />
        <meshStandardMaterial color="#16a34a" />
      </instancedMesh>
    </group>
  );
};

export default Trees;
