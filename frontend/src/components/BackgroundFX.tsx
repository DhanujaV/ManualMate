import React from 'react';
import { motion } from 'framer-motion';

export const BackgroundFX: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#060814]">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#060814_85%)]" />
      
      {/* Floating blurred orb 1 */}
      <motion.div
        animate={{
          x: [0, 60, -30, 0],
          y: [0, -50, 70, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/4 left-1/4 w-[380px] h-[380px] rounded-full bg-blue-600/10 dark:bg-blue-500/8 blur-[100px]"
      />
      
      {/* Floating blurred orb 2 */}
      <motion.div
        animate={{
          x: [0, -80, 50, 0],
          y: [0, 60, -40, 0],
          scale: [1, 0.9, 1.05, 1],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute bottom-1/4 right-1/4 w-[420px] h-[420px] rounded-full bg-violet-600/10 dark:bg-violet-500/8 blur-[110px]"
      />

      {/* Floating blurred orb 3 */}
      <motion.div
        animate={{
          x: [0, 40, -40, 0],
          y: [0, 50, -60, 0],
          scale: [1, 1.05, 0.9, 1],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4
        }}
        className="absolute top-1/2 left-2/3 w-[300px] h-[300px] rounded-full bg-emerald-500/5 dark:bg-emerald-500/4 blur-[90px]"
      />

      {/* Grid line grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.007)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.007)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* Noise Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
    </div>
  );
};

export default BackgroundFX;
