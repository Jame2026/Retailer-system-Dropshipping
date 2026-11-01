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
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: {
      dropship: 'text-[11px] leading-tight font-extrabold tracking-tight',
      core: 'text-[12px] leading-none font-black',
      sub: 'text-[7px] leading-[9px] font-bold tracking-widest',
    },
    md: {
      dropship: 'text-xs leading-tight font-extrabold tracking-tight',
      core: 'text-sm leading-none font-black',
      sub: 'text-[8px] leading-[10px] font-bold tracking-widest',
    },
    lg: {
      dropship: 'text-base leading-tight font-extrabold tracking-tight',
      core: 'text-lg leading-none font-black',
      sub: 'text-[9px] leading-[11px] font-bold tracking-widest',
    },
    xl: {
      dropship: 'text-2xl leading-tight font-extrabold tracking-tight',
      core: 'text-3xl leading-none font-black',
      sub: 'text-xs leading-[14px] font-bold tracking-widest',
    },
  };

  const tSize = textSizes[size];

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <img
          src="/dropship-logo-emblem.png"
          alt="Dropship Core Logo"
          className={`${iconSizes[size]} object-contain drop-shadow-2xs`}
        />
        {showText && (
          <div className="mt-2 flex flex-col items-center">
            <span className={`${tSize.dropship} text-[#1F1C18] uppercase`}>DROPSHIP</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`${tSize.core} text-[#139A77] tracking-tight`}>CORE</span>
              <div className="flex flex-col text-left">
                <span className={`${tSize.sub} text-[#1F1C18] uppercase`}>STORE</span>
                <span className={`${tSize.sub} text-[#1F1C18] uppercase`}>MANAGER</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src="/dropship-logo-emblem.png"
        alt="Dropship Core Logo"
        className={`${iconSizes[size]} object-contain shrink-0 drop-shadow-2xs`}
      />

      {showText && (
        <div className="flex flex-col text-left select-none">
          <span className={`${tSize.dropship} text-[#1F1C18] uppercase`}>DROPSHIP</span>
          <div className="flex items-center gap-1.5">
            <span className={`${tSize.core} text-[#139A77] tracking-tight`}>CORE</span>
            <div className="flex flex-col text-left">
              <span className={`${tSize.sub} text-[#1F1C18] uppercase`}>STORE</span>
              <span className={`${tSize.sub} text-[#1F1C18] uppercase`}>MANAGER</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

