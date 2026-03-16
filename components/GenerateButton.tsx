import React from 'react';

interface GenerateButtonProps {
  onClick?: () => void;
  isGenerating?: boolean;
}

export default function GenerateButton({ onClick, isGenerating = false }: GenerateButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isGenerating}
      className={`
        w-full py-4 rounded-xl font-orbitron font-bold text-lg tracking-wider uppercase transition-all duration-300
        ${isGenerating 
          ? 'bg-[#1a1a1a] text-[#888] cursor-not-allowed border border-[#333]' 
          : 'bg-[#D4AF37] text-black hover:bg-[#F1C40F] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:-translate-y-1'
        }
      `}
    >
      {isGenerating ? (
        <span className="flex items-center justify-center gap-2">
          <span className="animate-spin">⚡</span> GENERATING...
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <span>⚡</span> GENERATE ART
        </span>
      )}
    </button>
  );
}
