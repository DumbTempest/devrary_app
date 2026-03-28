"use client";

import { motion } from "framer-motion";
import { useState } from "react";

// Cloud SVG Component - Ultra Detailed Volumetric 3D effect
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
      <defs>
        {/* Multiple radial gradients for complex lighting */}
        <radialGradient id={`cloudGrad1-${x}-${y}`} cx="40%" cy="30%">
          <stop offset="0%" style={{ stopColor: "rgba(255, 255, 255, 1)" }} />
          <stop offset="30%" style={{ stopColor: "rgba(255, 255, 255, 0.95)" }} />
          <stop offset="60%" style={{ stopColor: "rgba(255, 255, 255, 0.75)" }} />
          <stop offset="100%" style={{ stopColor: "rgba(220, 235, 250, 0.4)" }} />
        </radialGradient>

        <radialGradient id={`cloudGrad2-${x}-${y}`} cx="35%" cy="35%">
          <stop offset="0%" style={{ stopColor: "rgba(255, 255, 255, 0.98)" }} />
          <stop offset="40%" style={{ stopColor: "rgba(255, 255, 255, 0.8)" }} />
          <stop offset="100%" style={{ stopColor: "rgba(200, 225, 245, 0.3)" }} />
        </radialGradient>

        <radialGradient id={`cloudShadow-${x}-${y}`} cx="30%" cy="40%">
          <stop offset="0%" style={{ stopColor: "rgba(150, 180, 220, 0.5)" }} />
          <stop offset="70%" style={{ stopColor: "rgba(120, 160, 210, 0.25)" }} />
          <stop offset="100%" style={{ stopColor: "rgba(100, 140, 190, 0.1)" }} />
        </radialGradient>

        {/* Complex shadow filter */}
        <filter id={`cloudShadow-${x}-${y}Filter`}>
          <feGaussianBlur in="SourceGraphic" stdDeviation={3 * scale} />
          <feOffset dx={1.5 * scale} dy={3 * scale} result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.35" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Soft glow filter for atmospheric effect */}
        <filter id={`cloudGlow-${x}-${y}`}>
          <feGaussianBlur in="SourceGraphic" stdDeviation={1.5 * scale} />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.5" />
          </feComponentTransfer>
        </filter>
      </defs>

      {/* Ultra-distant base shadow layer */}
      <circle cx={20 * scale} cy={y + 12 * scale} r={30 * scale} fill="rgba(150, 170, 200, 0.2)" filter={`url(#cloudGlow-${x}-${y})`} />
      <circle cx={50 * scale} cy={y + 14 * scale} r={40 * scale} fill="rgba(140, 165, 200, 0.22)" filter={`url(#cloudGlow-${x}-${y})`} />
      <circle cx={75 * scale} cy={y + 12 * scale} r={30 * scale} fill="rgba(150, 170, 200, 0.2)" filter={`url(#cloudGlow-${x}-${y})`} />

      {/* Deep shadow pass - creates depth */}
      <circle cx={10 * scale} cy={y + 8 * scale} r={33 * scale} fill={`url(#cloudShadow-${x}-${y})`} opacity="0.6" />
      <circle cx={42 * scale} cy={y + 10 * scale} r={44 * scale} fill={`url(#cloudShadow-${x}-${y})`} opacity="0.65" />
      <circle cx={72 * scale} cy={y + 8 * scale} r={33 * scale} fill={`url(#cloudShadow-${x}-${y})`} opacity="0.6" />

      {/* Mid-tone base clouds - main body structure */}
      <circle cx={0} cy={y} r={35 * scale} fill={`url(#cloudGrad1-${x}-${y})`} opacity="0.92" />
      <circle cx={40 * scale} cy={y} r={48 * scale} fill={`url(#cloudGrad2-${x}-${y})`} opacity="0.95" />
      <circle cx={80 * scale} cy={y} r={35 * scale} fill={`url(#cloudGrad1-${x}-${y})`} opacity="0.92" />

      {/* Additional detail clouds for texture */}
      <circle cx={15 * scale} cy={y + 3 * scale} r={28 * scale} fill="rgba(240, 248, 255, 0.6)" opacity="0.7" />
      <circle cx={55 * scale} cy={y + 2 * scale} r={35 * scale} fill="rgba(245, 250, 255, 0.65)" opacity="0.75" />
      <circle cx={68 * scale} cy={y + 4 * scale} r={26 * scale} fill="rgba(240, 248, 255, 0.58)" opacity="0.68" />

      {/* Primary top highlight layer - bright white lit areas */}
      <circle cx={10 * scale} cy={y - 12 * scale} r={28 * scale} fill="rgba(255, 255, 255, 0.95)" opacity="0.85" />
      <circle cx={42 * scale} cy={y - 14 * scale} r={32 * scale} fill="rgba(255, 255, 255, 0.98)" opacity="0.9" />
      <circle cx={68 * scale} cy={y - 10 * scale} r={25 * scale} fill="rgba(255, 255, 255, 0.92)" opacity="0.85" />

      {/* Secondary highlight - softer light reflection */}
      <circle cx={5 * scale} cy={y - 8 * scale} r={22 * scale} fill="rgba(255, 255, 255, 0.85)" opacity="0.6" />
      <circle cx={38 * scale} cy={y - 10 * scale} r={26 * scale} fill="rgba(255, 255, 255, 0.88)" opacity="0.65" />
      <circle cx={72 * scale} cy={y - 6 * scale} r={20 * scale} fill="rgba(255, 255, 255, 0.82)" opacity="0.55" />

      {/* Side edge highlights for dimension */}
      <circle cx={-8 * scale} cy={y - 3 * scale} r={24 * scale} fill="rgba(255, 255, 255, 0.75)" opacity="0.5" />
      <circle cx={88 * scale} cy={y - 3 * scale} r={21 * scale} fill="rgba(255, 255, 255, 0.72)" opacity="0.45" />

      {/* Very fine top edge detail - crisp light */}
      <circle cx={20 * scale} cy={y - 16 * scale} r={18 * scale} fill="rgba(255, 255, 255, 0.9)" opacity="0.4" />
      <circle cx={45 * scale} cy={y - 18 * scale} r={20 * scale} fill="rgba(255, 255, 255, 0.92)" opacity="0.45" />
      <circle cx={65 * scale} cy={y - 14 * scale} r={16 * scale} fill="rgba(255, 255, 255, 0.88)" opacity="0.35" />

      {/* Volumetric atmospheric glow around edges */}
      <circle cx={-12 * scale} cy={y} r={28 * scale} fill="rgba(220, 240, 255, 0.3)" opacity="0.3" />
      <circle cx={92 * scale} cy={y} r={26 * scale} fill="rgba(220, 240, 255, 0.28)" opacity="0.28" />
    </motion.g>
  );
}

export default function AnimatedSkyNoBirds() {
  const [cloudsVisible, setCloudsVisible] = useState(true);

  return (
    <div 
      className="fixed inset-0 w-full h-full overflow-hidden -z-10 cursor-pointer"
      onClick={() => setCloudsVisible(false)}
    >
      {/* Light blue gradient sky - realistic sky blue at top */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-600 via-blue-400 to-blue-100" />

      {/* Animated clouds SVG */}
      <motion.svg 
        className="absolute inset-0 w-full h-full" 
        viewBox="0 0 1400 800" 
        preserveAspectRatio="xMidYMid slice"
        initial={{ opacity: 1 }}
        animate={{ opacity: cloudsVisible ? 1 : 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
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
      </motion.svg>

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
