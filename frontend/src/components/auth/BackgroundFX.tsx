import React from 'react';
import { motion } from 'framer-motion';
import { useAudit } from '../../context/AuditContext';

const BackgroundFX: React.FC = () => {
  const { theme } = useAudit();
  const isDark = theme === 'dark';

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden -z-10 bg-slate-950 transition-colors duration-500"
         style={{ backgroundColor: isDark ? '#040612' : '#f8fafc' }}>
      
      {/* Mesh Gradient Background Layer */}
      <div 
        className="absolute inset-0 opacity-40 transition-opacity duration-1000"
        style={{
          backgroundImage: isDark
            ? 'radial-gradient(at 0% 0%, rgba(29, 78, 216, 0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(139, 92, 246, 0.12) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(6, 182, 212, 0.1) 0px, transparent 50%)'
            : 'radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.08) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(139, 92, 246, 0.06) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(6, 182, 212, 0.05) 0px, transparent 50%)',
        }}
      />

      {/* Floating Blurred Orbs */}
      <div className="absolute inset-0 filter blur-[80px] sm:blur-[120px] pointer-events-none overflow-hidden">
        {/* Orb 1: Blue / Cyan */}
        <motion.div
          animate={{
            x: [0, 80, -40, 0],
            y: [0, -60, 50, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] rounded-full"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, rgba(29, 78, 216, 0.05) 100%)'
              : 'radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, rgba(59, 130, 246, 0.03) 100%)',
          }}
        />

        {/* Orb 2: Purple */}
        <motion.div
          animate={{
            x: [0, -90, 50, 0],
            y: [0, 80, -40, 0],
            scale: [1, 0.9, 1.15, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] rounded-full"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, rgba(236, 72, 153, 0.03) 100%)'
              : 'radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, rgba(244, 114, 182, 0.02) 100%)',
          }}
        />

        {/* Orb 3: Indigo / Violet */}
        <motion.div
          animate={{
            x: [0, 60, -80, 0],
            y: [0, 90, -50, 0],
            scale: [1, 1.1, 0.85, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute top-1/2 left-1/3 w-[200px] h-[200px] sm:w-[350px] sm:h-[350px] rounded-full"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.02) 100%)'
              : 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.01) 100%)',
          }}
        />
      </div>

      {/* Subtle Noise Texture Overlay */}
      <div 
        className="absolute inset-0 mix-blend-overlay pointer-events-none transition-opacity duration-300"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          opacity: isDark ? 0.018 : 0.012,
        }}
      />
    </div>
  );
};

export default BackgroundFX;
