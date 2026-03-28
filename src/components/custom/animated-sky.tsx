"use client";

import { motion } from "framer-motion";

// Bird SVG Component
function Bird({ x, y, duration, delay }: { x: number; y: number; duration: number; delay: number }) {
  return (
    <motion.g
      animate={{ x: [0, 200, 400], opacity: [0, 1, 0] }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{ transform: `translate(${x}px, ${y}px)` }}
    >
      <path
        d="M 0 0 Q 5 -3 10 0 M 10 0 Q 8 2 6 0 M 6 0 Q 4 -2 2 0"
        stroke="rgba(0, 0, 0, 0.6)"
        strokeWidth="0.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.g>
  );
}

// Cloud SVG Component
function Cloud({ x, y, scale, duration, delay }: { x: number; y: number; scale: number; duration: number; delay: number }) {
  return (
    <motion.g
      animate={{ x: [x, x + 150, x] }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <circle cx={0} cy={y} r={35 * scale} fill="rgba(255, 255, 255, 0.8)" />
      <circle cx={40 * scale} cy={y} r={45 * scale} fill="rgba(255, 255, 255, 0.85)" />
      <circle cx={80 * scale} cy={y} r={35 * scale} fill="rgba(255, 255, 255, 0.8)" />
      <circle cx={25 * scale} cy={y - 20 * scale} r={30 * scale} fill="rgba(255, 255, 255, 0.75)" />
      <circle cx={55 * scale} cy={y - 22 * scale} r={32 * scale} fill="rgba(255, 255, 255, 0.75)" />
    </motion.g>
  );
}

export default function AnimatedSky() {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden -z-10">
      {/* Light blue gradient sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-200 via-blue-100 to-cyan-50" />

      {/* Animated clouds SVG */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1400 800" preserveAspectRatio="xMidYMid slice">
        {/* Far away clouds - slow movement */}
        <Cloud x={100} y={80} scale={0.7} duration={30} delay={0} />
        <Cloud x={500} y={100} scale={0.8} duration={32} delay={-5} />
        <Cloud x={900} y={60} scale={0.75} duration={28} delay={-10} />
        <Cloud x={1200} y={120} scale={0.7} duration={31} delay={-3} />

        {/* Mid-distance clouds */}
        <Cloud x={150} y={250} scale={1} duration={25} delay={-8} />
        <Cloud x={600} y={280} scale={1.1} duration={27} delay={-2} />
        <Cloud x={1000} y={240} scale={0.95} duration={26} delay={-6} />

        {/* Closer clouds - faster movement */}
        <Cloud x={80} y={450} scale={1.3} duration={20} delay={-4} />
        <Cloud x={550} y={480} scale={1.2} duration={22} delay={0} />
        <Cloud x={1050} y={460} scale={1.25} duration={21} delay={-7} />

        {/* Flying birds */}
        <Bird x={50} y={180} duration={15} delay={0} />
        <Bird x={400} y={220} duration={18} delay={-3} />
        <Bird x={800} y={150} duration={16} delay={-5} />
        <Bird x={1100} y={300} duration={17} delay={-2} />
        <Bird x={200} y={380} duration={19} delay={-4} />
        <Bird x={700} y={350} duration={15} delay={-1} />
      </svg>

      {/* Soft sun glow */}
      <motion.div
        className="absolute top-20 right-32 w-48 h-48 rounded-full bg-yellow-200 blur-3xl pointer-events-none"
        animate={{
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Subtle overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-blue-50/30 pointer-events-none" />
    </div>
  );
}
