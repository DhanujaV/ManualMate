import React from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface DeviceSwitcherProps {
  device: DeviceType;
  setDevice: (device: DeviceType) => void;
}

const DeviceSwitcher: React.FC<DeviceSwitcherProps> = ({ device, setDevice }) => {
  const modes: { id: DeviceType; icon: React.ElementType; label: string }[] = [
    { id: 'desktop', icon: Monitor, label: 'Desktop' },
    { id: 'tablet', icon: Tablet, label: 'Tablet' },
    { id: 'mobile', icon: Smartphone, label: 'Mobile' }
  ];

  return (
    <div className="flex gap-1.5 p-1 rounded-xl bg-slate-900 border border-white/5">
      {modes.map((mode) => {
        const Icon = mode.icon;
        return (
          <button
            key={mode.id}
            onClick={() => setDevice(mode.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              device === mode.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon size={12} />
            {mode.label}
          </button>
        );
      })}
    </div>
  );
};

export default DeviceSwitcher;
