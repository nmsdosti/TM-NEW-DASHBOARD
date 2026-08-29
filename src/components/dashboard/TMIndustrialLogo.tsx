import React from 'react';

interface TMIndustrialLogoProps {
  className?: string;
  showSubtitle?: boolean;
}

export const TMIndustrialLogo: React.FC<TMIndustrialLogoProps> = ({
  className = '',
  showSubtitle = true,
}) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Precision Engineered TM Monogram Emblem */}
      <div className="relative flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 text-white shadow-md shadow-blue-500/20 border border-blue-500/30 shrink-0">
        <svg
          viewBox="0 0 40 40"
          className="w-7 h-7 fill-current"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Stylized geometric T & M */}
          <path
            d="M6 9H20V13H15V29H11V13H6V9Z"
            fill="currentColor"
          />
          <path
            d="M20 9H24L28.5 20L33 9H37V29H33V17.5L29.5 26.5H27.5L24 17.5V29H20V9Z"
            fill="#60a5fa"
          />
        </svg>
        {/* Real-time telemetry pulse beacon */}
        <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white ring-2 ring-white shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </span>
      </div>

      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <span className="font-extrabold tracking-tight text-base sm:text-lg text-slate-900 uppercase">
            TM Industrial Solution
          </span>
          <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded">
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
