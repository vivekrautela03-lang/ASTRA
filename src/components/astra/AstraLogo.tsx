import React from 'react';

interface AstraLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  align?: 'left' | 'center';
  className?: string;
}

export const AstraLogo: React.FC<AstraLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  align = 'center',
  className = ''
}) => {
  const alignClass = align === 'left' ? 'items-start text-left' : 'items-center text-center';

  if (size === 'sm') {
    return (
      <div className={`flex flex-col ${alignClass} select-none bg-transparent ${className}`}>
        <span className="font-extrabold text-sm tracking-[0.28em] text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-[#00BFFF] filter drop-shadow-[0_0_12px_rgba(0,191,255,0.4)]">
          ASTRA
        </span>
        {showSubtitle && (
          <span className="text-[7.5px] font-mono tracking-[0.24em] text-cyan-300/80 uppercase font-semibold">
            AI PERSONAL ASSISTANT
          </span>
        )}
      </div>
    );
  }

  if (size === 'lg') {
    return (
      <div className={`flex flex-col ${alignClass} select-none bg-transparent ${className}`}>
        <span className="font-extrabold text-3xl tracking-[0.38em] text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-[#00BFFF] filter drop-shadow-[0_0_20px_rgba(0,191,255,0.45)]">
          ASTRA
        </span>
        {showSubtitle && (
          <span className="text-xs font-mono tracking-[0.32em] text-cyan-300/90 uppercase font-semibold mt-1">
            AI PERSONAL ASSISTANT
          </span>
        )}
      </div>
    );
  }

  // Default 'md'
  return (
    <div className={`flex flex-col ${alignClass} select-none bg-transparent ${className}`}>
      <span className="font-extrabold text-xl tracking-[0.32em] text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-[#00BFFF] filter drop-shadow-[0_0_16px_rgba(0,191,255,0.4)]">
        ASTRA
      </span>
      {showSubtitle && (
        <span className="text-[9px] font-mono tracking-[0.28em] text-cyan-300/85 uppercase font-semibold mt-0.5">
          AI PERSONAL ASSISTANT
        </span>
      )}
    </div>
  );
};

export default AstraLogo;
