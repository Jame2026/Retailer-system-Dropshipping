import React from 'react';

export interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'horizontal' | 'stacked';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  variant = 'horizontal',
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  const textSizes = {
    sm: {
      dropship: 'text-[11px] leading-tight font-extrabold tracking-tight',
      core: 'text-[12px] leading-none font-black',
      sub: 'text-[7px] leading-[9px] font-bold tracking-wider',
    },
    md: {
      dropship: 'text-xs leading-tight font-extrabold tracking-tight',
      core: 'text-sm leading-none font-black',
      sub: 'text-[8px] leading-[10px] font-bold tracking-wider',
    },
    lg: {
      dropship: 'text-sm leading-tight font-extrabold tracking-tight',
      core: 'text-base leading-none font-black',
      sub: 'text-[8px] leading-[10px] font-bold tracking-wider',
    },
    xl: {
      dropship: 'text-xl leading-tight font-extrabold tracking-tight',
      core: 'text-2xl leading-none font-black',
      sub: 'text-[11px] leading-[13px] font-bold tracking-wider',
    },
  };

  const tSize = textSizes[size];

  const IconElement = (
    <img
      src="/dropship-logo-emblem.png"
      alt="Dropship Core Logo"
      className={`${iconSizes[size]} object-contain shrink-0`}
      onError={(e) => {
        // Fallback to SVG if image fails to load
        e.currentTarget.style.display = 'none';
      }}
    />
  );

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        {IconElement}
        {showText && (
          <div className="mt-2 flex flex-col items-center">
            <span className={`${tSize.dropship} text-[#111827] uppercase`}>DROPSHIP</span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`${tSize.core} text-[#0E8478] tracking-tight`}>CORE</span>
              <div className="flex flex-col text-left">
                <span className={`${tSize.sub} text-[#4B5563] uppercase`}>STORE</span>
                <span className={`${tSize.sub} text-[#4B5563] uppercase`}>MANAGER</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {IconElement}
      {showText && (
        <div className="flex flex-col text-left select-none">
          <span className={`${tSize.dropship} text-[#111827] uppercase`}>DROPSHIP</span>
          <div className="flex items-center gap-1.5">
            <span className={`${tSize.core} text-[#0E8478] tracking-tight`}>CORE</span>
            <div className="flex flex-col text-left">
              <span className={`${tSize.sub} text-[#4B5563] uppercase font-bold`}>STORE</span>
              <span className={`${tSize.sub} text-[#4B5563] uppercase font-bold`}>MANAGER</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
