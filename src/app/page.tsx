"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import Navbar from "@/components/custom/navbar";
import AnimatedSkyNoBirds from "@/components/custom/animated-sky-no-birds";
import { AnimatePresence, motion } from "framer-motion";
import * as THREE from "three";

/* ---------------- MODEL ---------------- */

type ModelProps = {
  onHoverChange: (isHoveringBook: boolean) => void;
  onCursorMove: (x: number, y: number) => void;
  onHoveredBookChange: (bookKey: string | null) => void;
};

function Model({ onHoverChange, onCursorMove, onHoveredBookChange }: ModelProps) {
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

    // Identify only real book groups via meshes named with the "_1" outer-book pattern.
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

  // Animate hovered book group slightly outward and return all others smoothly.
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

          // Keep movement along shelf depth only, so books come out instead of drifting up/sideways.
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
      onPointerMove={(e: any) => {
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

/* ---------------- PAGE ---------------- */

export default function Home() {
  const { data: session, status } = useSession();
  const [isHoveringBook, setIsHoveringBook] = useState(false);
  const [showThoughtBubble, setShowThoughtBubble] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [hoveredBookKey, setHoveredBookKey] = useState<string | null>(null);
  const [activeQuote, setActiveQuote] = useState({
    command: "git status",
    description: "Shows changed, staged, and untracked files in your working tree.",
  });

  const developerQuotes = [
    {
      command: "git status -sb",
      description: "Short branch-aware status with staged/unstaged file changes.",
    },
    {
      command: "git diff",
      description: "Shows unstaged line-by-line changes in tracked files.",
    },
    {
      command: "git add <file>",
      description: "Stages selected file changes for the next commit.",
    },
    {
      command: "git commit -m \"message\"",
      description: "Creates a commit from staged changes with a message.",
    },
    {
      command: "git checkout -b feature/name",
      description: "Creates a new branch and switches to it immediately.",
    },
    {
      command: "git pull --rebase origin main",
      description: "Updates your branch with remote changes while keeping history linear.",
    },
    {
      command: "git push -u origin HEAD",
      description: "Pushes current branch and sets upstream tracking.",
    },
    {
      command: "gh pr create --fill",
      description: "Creates a pull request using commit details automatically.",
    },
    {
      command: "gh issue list",
      description: "Lists repository issues from GitHub CLI.",
    },
    {
      command: "gh run watch",
      description: "Streams GitHub Actions workflow run status live.",
    },
    {
      command: "git stash push -m \"wip\"",
      description: "Temporarily stores local modifications without committing.",
    },
    {
      command: "git reset --soft HEAD~1",
      description: "Moves HEAD back one commit while keeping changes staged.",
    },
  ];

  const pickRandomQuote = (current: { command: string; description: string }) => {
    if (developerQuotes.length === 1) return developerQuotes[0];

    let next = current;
    while (next.command === current.command) {
      next = developerQuotes[Math.floor(Math.random() * developerQuotes.length)];
    }
    return next;
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (isHoveringBook) {
      timer = setTimeout(() => {
        setShowThoughtBubble(true);
      }, 500);
    } else {
      setShowThoughtBubble(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isHoveringBook]);

  useEffect(() => {
    if (!hoveredBookKey) return;

    // Change snippet whenever hovering a different book.
    setActiveQuote((current) => pickRandomQuote(current));
  }, [hoveredBookKey]);

  useEffect(() => {
    if (!showThoughtBubble || !hoveredBookKey) return;

    // Keep snippets fresh while hovering the same book.
    const rotateTimer = setInterval(() => {
      setActiveQuote((current) => pickRandomQuote(current));
    }, 3200);

    return () => {
      clearInterval(rotateTimer);
    };
  }, [showThoughtBubble, hoveredBookKey]);

  return (
    <>
      <AnimatedSkyNoBirds />
      <AnimatePresence>
        {showThoughtBubble && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed z-70 pointer-events-none"
            style={{
              left: `clamp(210px, ${cursorPosition.x}px, calc(100vw - 210px))`,
              top: `clamp(96px, ${cursorPosition.y}px, calc(100vh - 28px))`,
            }}
          >
            <div className="relative">
              <div
                className="absolute left-1/2 -translate-x-1/2 -translate-y-full -top-6 w-96 px-5 py-4 rounded-3xl bg-linear-to-b from-white to-slate-50 border-2 border-black shadow-[6px_6px_0px_0px_#222222]"
              >
                <p className="text-[12px] leading-snug text-[#111827] font-semibold whitespace-pre-line font-mono bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 mb-2">
                  {activeQuote.command}
                </p>
                <p className="text-sm leading-snug text-[#222222] font-medium">
                  {activeQuote.description}
                </p>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 -translate-y-5 w-5 h-5 rounded-full bg-white border-2 border-black shadow-sm" />
              <div className="absolute left-1/2 -translate-x-1/2 -translate-y-2.5 w-3 h-3 rounded-full bg-white border-2 border-black shadow-sm" />
              <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white border border-black shadow-sm" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-screen w-full p-10 font-tektur overflow-hidden"
      >
        <Navbar />

      <div className="grid grid-cols-2 gap-16 items-start">

        {/* LEFT CARD */}
        <motion.div
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="ml-20 mt-20"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Card
              className="
                bg-[#F5E7C6]
                border-4 border-[#222222]
                rounded-[40px]
                shadow-[12px_12px_0px_0px_#222222]
                p-12
                max-w-xl
              "
            >
              <h1 className="text-5xl font-bold mb-6 text-[#222222]">
                Devrary
              </h1>

              <p className="text-xl mb-10 text-[#222222]">
  Discover coding concepts inside a structured virtual library. 
  Walk through domains, browse languages, and open curated resources 
  designed to make learning clear and accessible.
</p>

              <Link href="/room">
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    className="
                      bg-[#FF6D1F]
                      text-white
                      border-4 border-[#222222]
                      rounded-2xl
                      shadow-[6px_6px_0px_0px_#222222]
                      font-bold
                      px-10 py-5
                      active:translate-x-1
                      active:translate-y-1
                      active:shadow-none
                      transition-all
                    "
                  >
                    Start learning
                  </Button>
                </motion.div>
              </Link>
            </Card>
          </motion.div>
        </motion.div>

        {/* RIGHT MODEL AREA */}
        <motion.div
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="h-[650px] w-full relative"
        >
          <Link href="/room">
          <Canvas
            className="w-full h-full"
            camera={{ position: [3, 3, 4], fov: 50 }}
            onPointerMissed={() => {
              document.body.style.cursor = "default";
            }}
          >
            <ambientLight intensity={1} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} />

            <Suspense fallback={null}>
              <Model
                onHoverChange={setIsHoveringBook}
                onCursorMove={(x, y) => setCursorPosition({ x, y })}
                onHoveredBookChange={setHoveredBookKey}
              />
            </Suspense>

            <OrbitControls enableZoom={true} enableRotate={false} enablePan={false} />
          </Canvas>
          </Link>
        </motion.div>

      </div>
    </motion.main>
    </>
  );
}
