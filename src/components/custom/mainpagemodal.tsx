"use client";

import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";

type MainPageModalProps = {
  onHoverChange: (isHoveringBook: boolean) => void;
  onCursorMove: (x: number, y: number) => void;
  onHoveredBookChange: (bookKey: string | null) => void;
};

export default function MainPageModal({
  onHoverChange,
  onCursorMove,
  onHoveredBookChange,
}: MainPageModalProps) {
  const { scene } = useGLTF("/models/bookshelf.glb");
  const modelRef = useRef<THREE.Group>(null);
  const hoveredBookGroupRef = useRef<THREE.Group | null>(null);
  const bookBasePositions = useRef(new Map<THREE.Group, THREE.Vector3>());
  const bookGroupsRef = useRef(new Set<THREE.Group>());
  const bookHitMeshesRef = useRef<THREE.Mesh[]>([]);
  const raycasterRef = useRef(new THREE.Raycaster());
  const isHoveringBookRef = useRef(false);
  const hoveredBookKeyRef = useRef<string | null>(null);

  const findBookGroup = (object: THREE.Object3D | null): THREE.Group | null => {
    let current: THREE.Object3D | null = object;
    while (current && current.parent) {
      if (bookGroupsRef.current.has(current as THREE.Group)) {
        return current as THREE.Group;
      }
      current = current.parent;
    }
    return null;
  };

  useEffect(() => {
    if (!modelRef.current) return;

    bookGroupsRef.current.clear();
    bookBasePositions.current.clear();
    bookHitMeshesRef.current = [];

    modelRef.current.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh || !mesh.name.endsWith("_1")) return;

      bookHitMeshesRef.current.push(mesh);

      const parentGroup = mesh.parent;
      if (!parentGroup || parentGroup.type !== "Group") return;

      const group = parentGroup as THREE.Group;
      if (!bookGroupsRef.current.has(group)) {
        bookGroupsRef.current.add(group);
        bookBasePositions.current.set(group, group.position.clone());
      }
    });

    return () => {
      document.body.style.cursor = "default";
    };
  }, [scene]);

  useFrame((state) => {
    const popOutDistance = 0.06;
    const animationSpeed = 0.045;

    raycasterRef.current.setFromCamera(state.pointer, state.camera);
    const intersections = raycasterRef.current.intersectObjects(
      bookHitMeshesRef.current,
      false
    );

    hoveredBookGroupRef.current = intersections.length
      ? findBookGroup(intersections[0].object)
      : null;

    const hoveredBookKey = hoveredBookGroupRef.current
      ? hoveredBookGroupRef.current.uuid
      : null;

    if (hoveredBookKey !== hoveredBookKeyRef.current) {
      hoveredBookKeyRef.current = hoveredBookKey;
      onHoveredBookChange(hoveredBookKey);
    }

    const isHoveringBook = !!hoveredBookGroupRef.current;
    document.body.style.cursor = isHoveringBook ? "pointer" : "default";

    if (isHoveringBook !== isHoveringBookRef.current) {
      isHoveringBookRef.current = isHoveringBook;
      onHoverChange(isHoveringBook);
    }

    bookBasePositions.current.forEach((basePosition, bookGroup) => {
      const targetPosition = basePosition.clone();

      if (hoveredBookGroupRef.current === bookGroup) {
        const bookWorldPosition = new THREE.Vector3();
        bookGroup.getWorldPosition(bookWorldPosition);

        const cameraDirectionWorld = new THREE.Vector3()
          .subVectors(state.camera.position, bookWorldPosition)
          .setY(0)
          .normalize()
          .multiplyScalar(popOutDistance);

        const parent = bookGroup.parent;
        if (parent) {
          const parentWorldQuaternion = new THREE.Quaternion();
          parent.getWorldQuaternion(parentWorldQuaternion);

          const localDelta = cameraDirectionWorld.applyQuaternion(
            parentWorldQuaternion.invert()
          );

          localDelta.x = 0;
          localDelta.y = 0;
          targetPosition.add(localDelta);
        }
      }

      bookGroup.position.lerp(targetPosition, animationSpeed);
    });
  });

  return (
    <group
      ref={modelRef}
      scale={2.5}
      rotation={[0, Math.PI, 0]}
      onPointerMove={(e: ThreeEvent<PointerEvent>) => {
        onCursorMove(e.clientX, e.clientY);
      }}
      onPointerLeave={() => {
        hoveredBookGroupRef.current = null;
        hoveredBookKeyRef.current = null;
        onHoveredBookChange(null);
        if (isHoveringBookRef.current) {
          isHoveringBookRef.current = false;
          onHoverChange(false);
        }
      }}
    >
      <primitive object={scene} />
    </group>
  );
}
