import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAudit } from '../context/AuditContext';
import type { PageRecord } from '../context/AuditContext';
import { Globe2, ChevronRight, ChevronDown } from 'lucide-react';

interface TreeNode {
  page: PageRecord;
  children: TreeNode[];
}

function buildTree(pages: PageRecord[]): TreeNode[] {
  const roots: TreeNode[] = [];
  const map: Record<string, TreeNode> = {};

  pages.forEach((p) => { map[p.path] = { page: p, children: [] }; });

  pages.forEach((p) => {
    const parent = p.parent_path;
    if (parent && map[parent]) {
      map[parent].children.push(map[p.path]);
    } else {
      roots.push(map[p.path]);
    }
  });

  return roots;
}

interface TreeNodeViewProps {
  node: TreeNode;
  depth: number;
  onSelect: (page: PageRecord) => void;
}

const scoreColor = (s: number) => s >= 80 ? 'text-emerald-400' : s >= 60 ? 'text-amber-400' : 'text-red-400';
const scoreBorder = (s: number) => s >= 80 ? 'rgba(16,185,129,0.25)' : s >= 60 ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.25)';

const TreeNodeView: React.FC<TreeNodeViewProps> = ({ node, depth, onSelect }) => {
  const [expanded, setExpanded] = useState(true);
  const { page, children } = node;
  const avgScore = Math.round((page.uxScore + page.a11yScore) / 2);
  const issueCount = page.uxIssues.length + page.a11yIssues.length;

  return (
    <div style={{ marginLeft: depth > 0 ? 24 : 0 }}>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: depth * 0.05 }}
        className="flex items-center gap-2 mb-2"
      >
        {/* Expand/collapse */}
        {children.length > 0 ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
          >
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        ) : (
          <div className="w-5" />
        )}

        {/* Page card */}
        <button
          onClick={() => onSelect(page)}
          className="flex-1 flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200 hover:bg-white/[0.04]"
          style={{ border: `1px solid ${scoreBorder(avgScore)}`, background: 'rgba(15,23,42,0.4)' }}
        >
          <Globe2 size={14} className="text-slate-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{page.title}</p>
            <p className="text-[10px] font-mono text-slate-500">{page.path}</p>
          </div>
          <div className="flex gap-4 flex-shrink-0">
            <div className="text-center">
              <p className="text-[9px] text-slate-500">UX</p>
              <p className={`text-sm font-bold ${scoreColor(page.uxScore)}`}>{page.uxScore}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] text-slate-500">A11y</p>
              <p className={`text-sm font-bold ${scoreColor(page.a11yScore)}`}>{page.a11yScore}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] text-slate-500">Issues</p>
              <p className={`text-sm font-bold ${issueCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>{issueCount}</p>
            </div>
          </div>
        </button>
      </motion.div>

      {expanded && children.length > 0 && (
        <div className="relative ml-7 mb-1">
          {/* Connector line */}
          <div
            className="absolute left-0 top-0 bottom-0 w-px"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          />
          {children.map((child) => (
            <TreeNodeView key={child.page.path} node={child} depth={depth + 1} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

const SiteStructure: React.FC = () => {
  const { activeAudit, setSelectedPage, setActiveTab } = useAudit();

  if (!activeAudit) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Globe2 size={48} className="text-slate-600" />
        <p className="text-slate-400 text-lg">Run a website audit to generate insights</p>
        <button
          onClick={() => setActiveTab('auditor')}
          className="bg-gradient-button px-6 py-3 rounded-xl text-sm font-semibold text-white"
        >
          Start an Audit
        </button>
      </div>
    );
  }

  const tree = buildTree(activeAudit.pages);

  const handleSelect = (page: PageRecord) => {
    setSelectedPage(page);
    setActiveTab('details');
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">Website Structure</h1>
        <p className="text-slate-400 text-sm mt-1">
          Click any page to view its detailed audit. <span className="text-slate-500">{activeAudit.pages.length} pages discovered.</span>
        </p>
      </motion.div>

      {/* Legend */}
      <div className="flex gap-5 text-xs text-slate-400">
        {[
          { color: 'bg-emerald-500', label: 'Good (80+)' },
          { color: 'bg-amber-500',   label: 'Fair (60–79)' },
          { color: 'bg-red-500',     label: 'Poor (<60)' },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${color}`} />{label}
          </span>
        ))}
      </div>

      {/* Tree */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 rounded-2xl overflow-y-auto"
        style={{ maxHeight: 560 }}
      >
        {tree.map((node) => (
          <TreeNodeView key={node.page.path} node={node} depth={0} onSelect={handleSelect} />
        ))}
      </motion.div>

      {/* Summary grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {activeAudit.pages.map((page, i) => (
          <motion.button
            key={page.path}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * i }}
            onClick={() => handleSelect(page)}
            className="glass-card glass-card-hover p-4 rounded-xl text-left"
          >
            <p className="text-xs font-semibold text-white truncate">{page.title}</p>
            <p className="text-[10px] font-mono text-slate-500 mt-0.5">{page.path}</p>
            <div className="flex gap-4 mt-3">
              <div><p className="text-[9px] text-slate-500">UX</p><p className={`text-sm font-bold ${scoreColor(page.uxScore)}`}>{page.uxScore}</p></div>
              <div><p className="text-[9px] text-slate-500">A11y</p><p className={`text-sm font-bold ${scoreColor(page.a11yScore)}`}>{page.a11yScore}</p></div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default SiteStructure;
