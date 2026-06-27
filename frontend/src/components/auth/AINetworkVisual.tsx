import React from 'react';
import { motion } from 'framer-motion';
import { useAudit } from '../../context/AuditContext';

interface Node {
  id: number;
  x: number;
  y: number;
  size: number;
  label: string;
}

interface Link {
  from: number;
  to: number;
  speed: number;
}

const nodes: Node[] = [
  { id: 1, x: 100, y: 100, size: 6, label: "Gemini Vision" },
  { id: 2, x: 300, y: 80, size: 8, label: "WCAG 2.2 Auditor" },
  { id: 3, x: 200, y: 200, size: 12, label: "Core UXVerse AI" },
  { id: 4, x: 80, y: 300, size: 7, label: "Crawler Agent" },
  { id: 5, x: 320, y: 280, size: 7, label: "Heuristics Engine" },
  { id: 6, x: 200, y: 340, size: 8, label: "Conversion Lift AI" },
  { id: 7, x: 140, y: 230, size: 5, label: "Persona Agent" },
  { id: 8, x: 260, y: 140, size: 5, label: "Fix Generator" },
  { id: 9, x: 150, y: 130, size: 4, label: "A11y Node" },
  { id: 10, x: 270, y: 250, size: 6, label: "Analytics Engine" },
];

const links: Link[] = [
  { from: 1, to: 3, speed: 8 },
  { from: 2, to: 3, speed: 6 },
  { from: 4, to: 3, speed: 7 },
  { from: 5, to: 3, speed: 9 },
  { from: 6, to: 3, speed: 10 },
  { from: 1, to: 7, speed: 5 },
  { from: 4, to: 7, speed: 6 },
  { from: 7, to: 3, speed: 4 },
  { from: 2, to: 8, speed: 8 },
  { from: 8, to: 3, speed: 5 },
  { from: 9, to: 1, speed: 6 },
  { from: 9, to: 7, speed: 7 },
  { from: 10, to: 5, speed: 8 },
  { from: 10, to: 6, speed: 9 },
  { from: 10, to: 3, speed: 5 },
];

const AINetworkVisual: React.FC = () => {
  const { theme } = useAudit();
  const isDark = theme === 'dark';

  const nodeColor = isDark ? '#a78bfa' : '#8b5cf6'; // Purple
  const coreNodeColor = isDark ? '#3b82f6' : '#1d5cff'; // Blue
  const linkColor = isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(29, 92, 246, 0.08)';
  const pulseColor = isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(29, 92, 246, 0.15)';
  const labelTextColor = isDark ? '#94a3b8' : '#475569';

  return (
    <div className="relative w-full max-w-[400px] aspect-square mx-auto flex items-center justify-center">
      {/* Dynamic Glow Behind AI Core */}
      <div 
        className="absolute w-[200px] h-[200px] rounded-full blur-[40px] pointer-events-none opacity-40 transition-all duration-500"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(59, 130, 246, 0.05) 100%)'
            : 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.03) 100%)',
        }}
      />

      <svg viewBox="0 0 400 400" className="w-full h-full relative z-10 select-none pointer-events-none">
        <defs>
          <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Links / Connections with moving data streams */}
        {links.map((link, idx) => {
          const fromNode = nodes.find(n => n.id === link.from)!;
          const toNode = nodes.find(n => n.id === link.to)!;

          return (
            <g key={`link-${idx}`}>
              {/* Static Background Connection Line */}
              <line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={linkColor}
                strokeWidth={1.5}
              />
              
              {/* Dynamic Animated Data Stream Line */}
              <motion.line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="url(#gradient-line)"
                strokeWidth={2}
                strokeDasharray="10, 25"
                animate={{
                  strokeDashoffset: [-100, 100],
                }}
                transition={{
                  duration: link.speed,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </g>
          );
        })}

        {/* Nodes and Labels */}
        {nodes.map((node) => {
          const isCore = node.id === 3;
          
          return (
            <g key={`node-${node.id}`}>
              {/* Pulse rings around the core controller node */}
              {isCore && (
                <>
                  <motion.circle
                    cx={node.x}
                    cy={node.y}
                    r={node.size + 14}
                    fill="none"
                    stroke={pulseColor}
                    strokeWidth={1}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.circle
                    cx={node.x}
                    cy={node.y}
                    r={node.size + 24}
                    fill="none"
                    stroke={pulseColor}
                    strokeWidth={0.75}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.4, 0.1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  />
                </>
              )}

              {/* Node Circle */}
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={node.size}
                fill={isCore ? coreNodeColor : nodeColor}
                className="cursor-pointer"
                whileHover={{ scale: 1.3 }}
                animate={{
                  y: [node.y, node.y + (node.id % 2 === 0 ? 4 : -4), node.y],
                }}
                transition={{
                  duration: 4 + (node.id % 3),
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Smaller Inner Core Dot */}
              {isCore && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={5}
                  fill="#ffffff"
                />
              )}

              {/* Node Labels (Only for key nodes to keep UI clean) */}
              {[1, 2, 3, 4, 5, 6].includes(node.id) && (
                <motion.text
                  x={node.x}
                  y={node.y - node.size - 8}
                  textAnchor="middle"
                  fill={labelTextColor}
                  fontSize={10}
                  fontWeight={isCore ? "bold" : "medium"}
                  className="font-sans"
                  animate={{
                    y: [node.y - node.size - 8, node.y - node.size - (node.id % 2 === 0 ? 4 : 12), node.y - node.size - 8],
                  }}
                  transition={{
                    duration: 4 + (node.id % 3),
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {node.label}
                </motion.text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default AINetworkVisual;
