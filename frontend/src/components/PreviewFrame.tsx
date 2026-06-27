import React, { useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import type { DeviceType } from './DeviceSwitcher';

interface PreviewFrameProps {
  title: string;
  badge?: string;
  themeColor: string; // "red" | "emerald"
  source: 'url' | 'screenshot' | 'figma';
  mode: 'before' | 'after';
  device: DeviceType;
  screenshotB64?: string;
  visualDesc?: string;
  pageUrl?: string;
  childrenHtml?: string;
  childrenCss?: string;
  children?: React.ReactNode;
}

const PreviewFrame: React.FC<PreviewFrameProps> = ({
  title,
  badge,
  themeColor,
  source,
  mode,
  device,
  screenshotB64,
  visualDesc,
  pageUrl,
  childrenHtml,
  childrenCss,
  children
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const imageSrc = screenshotB64
    ? (screenshotB64.startsWith('data:') ? screenshotB64 : `data:image/jpeg;base64,${screenshotB64}`)
    : undefined;

  const widthClasses = {
    desktop: 'w-full max-w-full',
    tablet: 'w-[480px] max-w-full',
    mobile: 'w-[320px] max-w-full'
  };

  const borderClass = themeColor === 'red' ? 'border-red-500/20' : 'border-emerald-500/20';
  const headerBg = themeColor === 'red' ? 'bg-red-500/5' : 'bg-emerald-500/5';
  const dotColor = themeColor === 'red' ? 'bg-red-500' : 'bg-emerald-500';

  const content = (
    <div className={`flex flex-col h-full bg-slate-950 border ${borderClass} rounded-2xl overflow-hidden shadow-2xl transition-all`}>
      {/* Header Bar */}
      <div className={`px-4 py-3 flex items-center justify-between border-b border-white/5 ${headerBg}`}>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
          <span className="text-xs font-semibold text-slate-300">{title}</span>
          {badge && (
            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
              {badge}
            </span>
          )}
        </div>
        <button
          onClick={() => setIsFullscreen(prev => !prev)}
          className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
        >
          {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
        </button>
      </div>

      {/* Frame Viewport View */}
      <div className="flex-1 relative flex items-center justify-center p-4 bg-slate-900/60 overflow-y-auto" style={{ minHeight: isFullscreen ? '70vh' : '360px' }}>
        <div className={`h-full bg-slate-950 border border-white/5 rounded-xl overflow-hidden flex flex-col transition-all ${widthClasses[device]}`} style={{ minHeight: '320px' }}>
          {/* Simulated browser search bar */}
          <div className="px-3 py-1.5 bg-slate-900/80 border-b border-white/5 flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            </div>
            <div className="flex-1 bg-white/5 rounded px-2.5 py-0.5 text-[9px] text-slate-500 truncate font-mono select-none">
              {source === 'url' ? 'https://audited-site.com/' : source === 'figma' ? 'figma.com/file/canvas' : 'local-screenshot-viewport'}
            </div>
          </div>

          {/* Render target content */}
          <div className="flex-1 relative overflow-hidden flex flex-col p-4 justify-between">
            {imageSrc ? (
              <div className="w-full h-full flex items-center justify-center">
                <img src={imageSrc} alt="visual-preview" className="max-w-full max-h-[300px] object-contain rounded-lg" />
              </div>
            ) : source === 'url' && childrenHtml ? (
              <div className="w-full h-full min-h-[300px] rounded-lg overflow-hidden bg-white">
                <iframe
                  srcDoc={`
                    <html>
                      <head>
                        ${pageUrl ? `<base href="${pageUrl}" />` : ''}
                        <script src="https://cdn.tailwindcss.com"></script>
                        <style>
                          body { font-family: sans-serif; padding: 20px; }
                          ${childrenCss || ''}
                        </style>
                      </head>
                      <body>
                        ${childrenHtml}
                      </body>
                    </html>
                  `}
                  title={mode === 'before' ? "Webpage Before Preview" : "Webpage After Preview"}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            ) : source === 'url' && pageUrl ? (
              <div className="w-full h-full min-h-[300px] rounded-lg overflow-hidden bg-white">
                <iframe
                  src={pageUrl}
                  title="Webpage Before Preview"
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-between py-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20" />
                    <div className="space-y-1 flex-1">
                      <div className="h-2 w-20 rounded bg-white/10" />
                      <div className="h-1.5 w-12 rounded bg-white/5" />
                    </div>
                  </div>
                  <div className="h-3 w-3/4 rounded bg-white/10" />
                  <p className="text-[10px] text-slate-400 leading-relaxed italic line-clamp-3">
                    {visualDesc || (mode === 'before' ? 'No layout details available.' : 'Accessible visual improvements applied.')}
                  </p>
                </div>
                
                {mode === 'before' ? (
                  <div className="space-y-2 opacity-65">
                    <div className="h-6 rounded bg-red-500/10 border border-red-500/10" />
                    <div className="h-7 w-24 rounded bg-red-600/40" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="h-6 rounded bg-emerald-500/10 border border-emerald-500/10" />
                    <div className="h-7 w-24 rounded bg-gradient-to-r from-blue-600 to-violet-600 shadow-md shadow-blue-500/20" />
                  </div>
                )}
              </div>
            )}

            {/* Overlays for Visual diff highlights */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/95 flex items-center justify-center p-6 md:p-12 backdrop-blur-md">
        <div className="w-full max-w-5xl h-[85vh]">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default PreviewFrame;
