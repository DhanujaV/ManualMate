import React from 'react';
import { motion } from 'framer-motion';

interface AuthCardProps {
  children: React.ReactNode;
}

const AuthCard: React.FC<AuthCardProps> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25, scale: 0.98 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
      }}
      transition={{ 
        duration: 0.6, 
        ease: [0.16, 1, 0.3, 1] 
      }}
      className="w-full"
    >
      <motion.div
        animate={{ 
          y: [-3, 3, -3],
        }}
        transition={{ 
          duration: 7, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="glass-card w-full max-w-[480px] p-6 sm:p-10 rounded-3xl overflow-hidden border border-white/[0.08] relative"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Glow corner elements inside card */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 w-full">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AuthCard;
