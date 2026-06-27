import React, { useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import type { DeviceType } from './DeviceSwitcher';

interface BeforePreviewFrameProps {
  url?: string;
  screenshotB64?: string;
  beforeHtml?: string;
  beforeCss?: string;
  html?: string;
  device: DeviceType;
  // Shared zoom/crop props
  scale?: number;
  offset?: { x: number; y: number };
  activeBox?: any;
  dimensions?: { width: number; height: number };
  onDimensionsLoad?: (w: number, h: number) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseMove?: (e: React.MouseEvent) => void;
  onMouseUp?: () => void;
  zoomControls?: React.ReactNode;
}

function resolveRelativeUrls(html: string, baseUrl?: string): string {
  if (!baseUrl) return html;
  const isFullPage = /<!DOCTYPE|<html|<body/i.test(html);
  if (!isFullPage) return html;

  try {
    const urlObj = new URL(baseUrl);
    const origin = urlObj.origin;

    let resolved = html.replace(/(src|href|srcset)=["']\/([^"']+)["']/g, (match, attr, path) => {
      if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return match;
      return `${attr}="${origin}/${path}"`;
    });

    resolved = resolved.replace(/url\(["']?\/([^"')]+)["']?\)/g, (match, path) => {
      if (path.startsWith('http://') || path.startsWith('https://')) return match;
      return `url("${origin}/${path}")`;
    });

    return resolved;
  } catch (err) {
    return html;
  }
}

const BeforePreviewFrame: React.FC<BeforePreviewFrameProps> = ({
  url,
  screenshotB64,
  beforeHtml,
  beforeCss,
  html,
  device,
  scale = 1,
  offset = { x: 0, y: 0 },
  activeBox,
  dimensions = { width: 1200, height: 800 },
  onDimensionsLoad,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  zoomControls
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const widthClasses = {
    desktop: 'w-full max-w-full',
    tablet: 'w-[480px] max-w-full',
    mobile: 'w-[320px] max-w-full'
  };

  const imageSrc = screenshotB64
    ? (screenshotB64.startsWith('data:') ? screenshotB64 : `data:image/jpeg;base64,${screenshotB64}`)
    : undefined;

  let finalHtml = '';
  const htmlToRender = html || beforeHtml;
  if (htmlToRender) {
    const resolvedHtml = resolveRelativeUrls(htmlToRender, url);
    finalHtml = `
      <html>
        <head>
          ${url ? `<base href="${url}" />` : ''}
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { font-family: sans-serif; padding: 20px; background: white; color: #0f172a; }
            ${beforeCss || ''}
          </style>
        </head>
        <body>
          ${resolvedHtml}
        </body>
      </html>
    `;
  }

  const content = (
    <div className="flex flex-col h-full bg-slate-950 border border-red-500/20 rounded-2xl overflow-hidden shadow-2xl transition-all">
      {/* Header Bar */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-white/5 bg-red-500/5 bg-slate-900/40">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="text-xs font-semibold text-slate-300">Current Design (Before)</span>
        </div>
        <button
          onClick={() => setIsFullscreen(prev => !prev)}
          className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
        >
          {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
        </button>
      </div>

      {/* Viewport Frame */}
      <div className="flex-1 relative flex items-center justify-center p-4 bg-slate-900/60 overflow-y-auto" style={{ minHeight: isFullscreen ? '70vh' : '360px' }}>
        <div className={`h-full bg-slate-950 border border-white/5 rounded-xl overflow-hidden flex flex-col transition-all ${widthClasses[device]}`} style={{ minHeight: '320px' }}>
          {/* Address Bar */}
          <div className="px-3 py-1.5 bg-slate-900/80 border-b border-white/5 flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            </div>
            <div className="flex-1 bg-white/5 rounded px-2.5 py-0.5 text-[9px] text-slate-500 truncate font-mono select-none">
              {url || 'local-preview'}
            </div>
          </div>

          {/* Render target content */}
          {imageSrc ? (
            <div className="flex-1 relative flex flex-col bg-slate-950 overflow-hidden">
              <div
                className="relative overflow-hidden w-full aspect-[16/9] flex items-center justify-center cursor-move flex-1"
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    transform: `scale(${scale}) translate(${offset.x}%, ${offset.y}%)`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.1s ease',
                  }}
                >
                  <img
                    src={imageSrc}
                    alt="Original Website Preview"
                    className="w-full h-full object-contain pointer-events-none"
                    onLoad={(e) => {
                      if (onDimensionsLoad) {
                        onDimensionsLoad(e.currentTarget.naturalWidth || 1200, e.currentTarget.naturalHeight || 800);
                      }
                    }}
                  />
                  {activeBox && (
                    <div
                      style={{
                        position: 'absolute',
                        left: `${(activeBox.x / dimensions.width) * 100}%`,
                        top: `${(activeBox.y / dimensions.height) * 100}%`,
                        width: `${(activeBox.width / dimensions.width) * 100}%`,
                        height: `${(activeBox.height / dimensions.height) * 100}%`,
                        border: '3px solid #ef4444',
                        boxShadow: '0 0 15px rgba(239, 68, 68, 0.6)',
                        background: 'rgba(239, 68, 68, 0.12)',
                        pointerEvents: 'none',
                        borderRadius: '6px',
                        transition: 'all 0.15s ease'
                      }}
                    />
                  )}
                </div>
              </div>
              {zoomControls}
            </div>
          ) : htmlToRender ? (
            <div className="flex-1 bg-white">
              <iframe
                srcDoc={finalHtml}
                title="Website Before Snapshot"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          ) : url ? (
            <div className="flex-1 bg-white">
              <iframe
                src={url}
                title="Website Before Live"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 p-6 bg-slate-900/60">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400">Loading website preview...</p>
            </div>
          )}
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

export default BeforePreviewFrame;
