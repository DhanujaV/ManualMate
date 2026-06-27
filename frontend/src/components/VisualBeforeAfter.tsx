import React, { useState, useEffect } from 'react';
import { GitCompare, Columns, Eye, Plus, Minus } from 'lucide-react';
import DeviceSwitcher from './DeviceSwitcher';
import type { DeviceType } from './DeviceSwitcher';
import BeforePreviewFrame from './BeforePreviewFrame';
import AfterPreviewFrame from './AfterPreviewFrame';

interface VisualBeforeAfterProps {
  activeAudit: any;
  selectedPage: any;
}

type PreviewTab = 'visual' | 'diff' | 'side';

const VisualBeforeAfter: React.FC<VisualBeforeAfterProps> = ({ activeAudit, selectedPage }) => {
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [previewTab, setPreviewTab] = useState<PreviewTab>('side');

  if (!selectedPage) return null;

  const { beforeAfter } = selectedPage;
  const source = activeAudit?.source || 'url';

  const allIssues = [...(selectedPage.uxIssues || []), ...(selectedPage.a11yIssues || [])];
  const [selectedIssueId, setSelectedIssueId] = useState<string>(allIssues[0]?.id || '');

  // Viewport shared zoom/pan state
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const activeBox = selectedPage.screenshotBoxes?.find((b: any) => b.issue_id === selectedIssueId);

  // Auto-calculate zoom & position when dimensions or issue selection changes
  useEffect(() => {
    if (activeBox) {
      const pctX = (activeBox.x + activeBox.width / 2) / dimensions.width;
      const pctY = (activeBox.y + activeBox.height / 2) / dimensions.height;
      const scaleX = dimensions.width / (activeBox.width * 1.5);
      const scaleY = dimensions.height / (activeBox.height * 1.5);
      const S = Math.max(1.2, Math.min(4.5, Math.min(scaleX, scaleY)));

      setScale(S);
      setOffset({
        x: (0.5 - pctX) * 100,
        y: (0.5 - pctY) * 100
      });
    } else {
      setScale(1);
      setOffset({ x: 0, y: 0 });
    }
  }, [selectedIssueId, dimensions.width, dimensions.height]);

  const handleDimensionsLoad = (w: number, h: number) => {
    if (w !== dimensions.width || h !== dimensions.height) {
      setDimensions({ width: w, height: h });
    }
  };

  // Drag-to-pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    const container = e.currentTarget.getBoundingClientRect();
    const pctX = (dx / container.width) * 100;
    const pctY = (dy / container.height) * 100;

    setOffset(prev => ({
      x: prev.x + pctX,
      y: prev.y + pctY
    }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom controls
  const handleZoomIn = () => setScale(prev => Math.min(6, prev + 0.25));
  const handleZoomOut = () => setScale(prev => Math.max(1, prev - 0.25));
  const handleReset = () => {
    if (activeBox) {
      const pctX = (activeBox.x + activeBox.width / 2) / dimensions.width;
      const pctY = (activeBox.y + activeBox.height / 2) / dimensions.height;
      const scaleX = dimensions.width / (activeBox.width * 1.5);
      const scaleY = dimensions.height / (activeBox.height * 1.5);
      const S = Math.max(1.2, Math.min(4.5, Math.min(scaleX, scaleY)));
      setScale(S);
      setOffset({
        x: (0.5 - pctX) * 100,
        y: (0.5 - pctY) * 100
      });
    } else {
      setScale(1);
      setOffset({ x: 0, y: 0 });
    }
  };

  const zoomControls = (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-900/90 border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-3 backdrop-blur shadow-lg z-20">
      <button onClick={handleZoomOut} className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-all">
        <Minus size={14} />
      </button>
      <span className="text-[10px] font-mono text-slate-300 min-w-[36px] text-center select-none">
        {Math.round(scale * 100)}%
      </span>
      <button onClick={handleZoomIn} className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-all">
        <Plus size={14} />
      </button>
      <div className="w-px h-3 bg-white/10" />
      <button onClick={handleReset} className="p-1 hover:bg-white/10 rounded text-[10px] text-slate-400 hover:text-white transition-all font-semibold">
        Reset
      </button>
    </div>
  );

  const previewTabs: { id: PreviewTab; label: string; icon: React.ElementType }[] = [
    { id: 'side', label: 'Side-by-Side', icon: Columns },
    { id: 'diff', label: 'Visual Diff', icon: GitCompare },
    { id: 'visual', label: 'Visual Preview', icon: Eye }
  ];

  return (
    <div className="glass-card p-6 rounded-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            {previewTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setPreviewTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    previewTab === tab.id
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 hover:text-white border border-transparent'
                  }`}
                >
                  <Icon size={12} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {allIssues.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Active Issue:</span>
              <select
                value={selectedIssueId}
                onChange={(e) => setSelectedIssueId(e.target.value)}
                className="bg-slate-900/80 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500/50"
              >
                {allIssues.map((issue) => (
                  <option key={issue.id} value={issue.id}>
                    [{issue.severity}] {issue.description.substring(0, 50)}...
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <DeviceSwitcher device={device} setDevice={setDevice} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Render BEFORE */}
        {(previewTab === 'side' || previewTab === 'diff') && (
          <BeforePreviewFrame
            url={selectedPage.url}
            screenshotB64={selectedPage.screenshot_b64}
            beforeHtml={beforeAfter?.before?.html}
            beforeCss={beforeAfter?.before?.css}
            html={selectedPage.html}
            device={device}
            scale={scale}
            offset={offset}
            activeBox={activeBox}
            dimensions={dimensions}
            onDimensionsLoad={handleDimensionsLoad}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            zoomControls={zoomControls}
          />
        )}

        {/* Render AFTER */}
        {(previewTab === 'side' || previewTab === 'diff' || previewTab === 'visual') && (
          <AfterPreviewFrame
            url={selectedPage.url}
            source={source}
            originalHtml={selectedPage.html}
            beforeHtml={beforeAfter?.before?.html}
            afterHtml={beforeAfter?.after?.html}
            afterCss={beforeAfter?.after?.css}
            device={device}
            screenshotB64={selectedPage.screenshot_b64}
            scale={scale}
            offset={offset}
            activeBox={activeBox}
            dimensions={dimensions}
            onDimensionsLoad={handleDimensionsLoad}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            zoomControls={zoomControls}
          />
        )}
      </div>
    </div>
  );
};

export default VisualBeforeAfter;
