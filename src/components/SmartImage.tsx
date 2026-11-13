import React, { useState } from 'react';

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  className = '',
  fallbackLabel,
  onClick,
  style,
}) => {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        onClick={onClick}
        style={style}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-primary-fixed/70 via-surface-container to-secondary-fixed/70 text-primary p-2 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <span className="material-symbols-outlined text-2xl opacity-80">checkroom</span>
        {fallbackLabel && (
          <span className="text-[10px] font-semibold mt-1 line-clamp-2 text-on-surface-variant">
            {fallbackLabel}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onClick={onClick}
      style={style}
      className={className}
      onError={() => setFailed(true)}
    />
  );
};
