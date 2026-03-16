'use client';

import React from 'react';

// On définit les types ici directement au lieu de les importer
type AspectRatio = '1:1' | '4:3' | '16:9' | '9:16';

interface AspectRatioSelectorProps {
  value: string;
  onChange: (value: AspectRatio) => void;
}

const ratios: { label: string; value: AspectRatio; icon: string }[] = [
  { label: '1:1', value: '1:1', icon: '正' },
  { label: '4:3', value: '4:3', icon: '📺' },
  { label: '16:9', value: '16:9', icon: '🎬' },
  { label: '9:16', value: '9:16', icon: '📱' },
];

export default function AspectRatioSelector({ value, onChange }: AspectRatioSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">
        Aspect Ratio
      </label>
      <div className="grid grid-cols-4 gap-3">
        {ratios.map((ratio) => (
          <button
            key={ratio.value}
            onClick={() => onChange(ratio.value)}
            className={`
              flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200
              ${value === ratio.value 
                ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]' 
                : 'border-white/5 bg-white/5 text-gray-400 hover:border-white/20'
              }
            `}
          >
            <span className="text-xl">{ratio.icon}</span>
            <span className="text-xs font-bold">{ratio.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
