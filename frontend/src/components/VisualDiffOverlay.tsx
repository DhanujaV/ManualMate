import React from 'react';

interface VisualDiffOverlayProps {
  mode: 'before' | 'after';
}

const VisualDiffOverlay: React.FC<VisualDiffOverlayProps> = ({ mode }) => {
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      {mode === 'before' ? (
        <>
          <div className="absolute top-[10%] left-[10%] w-[80%] h-8 bg-red-600/15 border border-red-500/30 rounded flex items-center justify-center">
            <span className="text-[8px] font-bold text-red-200 px-1 bg-red-900/80 rounded uppercase">Low Contrast Area (Removed)</span>
          </div>
          <div className="absolute top-[50%] left-[25%] w-[50%] h-12 bg-red-600/15 border border-red-500/30 rounded flex items-center justify-center">
            <span className="text-[8px] font-bold text-red-200 px-1 bg-red-900/80 rounded uppercase">Form Input Missing Label (Removed)</span>
          </div>
        </>
      ) : (
        <>
          <div className="absolute top-[10%] left-[10%] w-[80%] h-8 bg-blue-600/15 border border-blue-500/30 rounded flex items-center justify-center">
            <span className="text-[8px] font-bold text-blue-200 px-1 bg-blue-900/80 rounded uppercase">Contrast Corrected (Improved)</span>
          </div>
          <div className="absolute top-[48%] left-[15%] w-[70%] h-16 bg-emerald-600/15 border border-emerald-500/30 rounded flex items-center justify-center">
            <span className="text-[8px] font-bold text-emerald-200 px-1 bg-emerald-900/80 rounded uppercase">Accessible Form Label (Added)</span>
          </div>
        </>
      )}
    </div>
  );
};

export default VisualDiffOverlay;
