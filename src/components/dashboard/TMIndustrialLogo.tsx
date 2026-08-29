import React from 'react';

interface TMIndustrialLogoProps {
  className?: string;
  showSubtitle?: boolean;
}

export const TMLogoEmblem: React.FC<{ className?: string }> = ({
  className = 'h-10 w-10',
}) => {
  return (
    <div className={`relative overflow-hidden shrink-0 inline-block select-none shadow-xs rounded-[2px] ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full block"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="TM Logo"
      >
        {/* Outer Red Frame */}
        <rect x="0" y="0" width="100" height="100" fill="#B91C1C" />
        {/* Crisp White Background */}
        <rect x="4.5" y="4.5" width="91" height="91" fill="#F8F9FA" />
        
        {/* 't' top solid red block */}
        <rect x="24" y="4.5" width="18" height="19.5" fill="#B91C1C" />
        
        {/* 't' horizontal crossbar */}
        <rect x="24" y="40" width="18" height="2" fill="#B91C1C" />
        
        {/* 't' vertical inner stem line */}
        <rect x="24" y="40" width="2" height="38" fill="#B91C1C" />
        
        {/* 'm' vertical divider line 1 */}
        <rect x="58" y="24" width="2" height="71.5" fill="#B91C1C" />
        
        {/* 'm' vertical divider line 2 */}
        <rect x="76" y="24" width="2" height="71.5" fill="#B91C1C" />
      </svg>
    </div>
  );
};

export const TMIndustrialLogo: React.FC<TMIndustrialLogoProps> = ({
  className = '',
  showSubtitle = true,
}) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official TM Monogram Emblem */}
      <div className="relative">
        <TMLogoEmblem className="h-10 w-10 sm:h-11 sm:w-11" />
        {/* Real-time telemetry pulse beacon */}
        <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white ring-2 ring-white shadow-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </span>
      </div>

      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <span className="font-extrabold tracking-tight text-base sm:text-lg text-slate-900 uppercase">
            TM Industrial Solution
          </span>
          <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 rounded">
            CMS
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[11px] text-slate-500 font-medium tracking-wide">
            Condition Monitoring & Reliability Intelligence
          </span>
        )}
      </div>
    </div>
  );
};

