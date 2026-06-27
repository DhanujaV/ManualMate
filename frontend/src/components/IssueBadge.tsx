import React from 'react';
import { AlertTriangle, XCircle, Info } from 'lucide-react';

interface IssueBadgeProps {
  severity: 'Critical' | 'Warning' | 'Minor';
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

const IssueBadge: React.FC<IssueBadgeProps> = ({ severity, showLabel = true, size = 'md' }) => {
  const config = {
    Critical: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      text: 'text-red-400',
      icon: XCircle,
      dot: 'bg-red-500'
    },
    Warning: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      icon: AlertTriangle,
      dot: 'bg-amber-500'
    },
    Minor: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-400',
      icon: Info,
      dot: 'bg-blue-500'
    },
  };

  const { bg, border, text, icon: Icon } = config[severity];
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  const iconSize = size === 'sm' ? 10 : 12;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${bg} ${border} ${text} ${padding}`}>
      <Icon size={iconSize} />
      {showLabel && severity}
    </span>
  );
};

export default IssueBadge;
