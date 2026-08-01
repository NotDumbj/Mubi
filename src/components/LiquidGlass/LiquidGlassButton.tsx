import React, { useId } from 'react';
import './LiquidGlassButton.css';

interface LiquidGlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  scale?: number;
  children: React.ReactNode;
}

export const LiquidGlassButton: React.FC<LiquidGlassButtonProps> = ({
  isActive = false,
  scale = 60,
  children,
  className = '',
  ...props
}) => {
  const filterId = useId().replace(/:/g, '');

  return (
    <>
      <button
        type="button"
        className={`liquid-glass-btn ${isActive ? 'active' : ''} ${className}`}
        {...props}
      >
        {/* Kokonut UI Multi-Layer Liquid Glass Inner Shadow Overlay */}
        <div className="liquid-glass-shadow-layer" />

        {/* Kokonut UI Refraction Blur Filter Layer */}
        <div
          className="liquid-glass-refraction-layer"
          style={{ backdropFilter: `url("#${filterId}")` }}
        />

        {/* Content */}
        <span className="liquid-glass-content">{children}</span>
      </button>

      {/* Kokonut UI SVG Turbulence Displacement Filter */}
      <svg aria-hidden="true" className="liquid-glass-svg-filter" focusable={false}>
        <defs>
          <filter
            colorInterpolationFilters="sRGB"
            height="200%"
            id={filterId}
            width="200%"
            x="-50%"
            y="-50%"
          >
            <feTurbulence
              baseFrequency="0.04 0.04"
              numOctaves="1"
              result="turbulence"
              seed="2"
              type="fractalNoise"
            />
            <feGaussianBlur in="turbulence" result="blurredNoise" stdDeviation="2" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="blurredNoise"
              result="displaced"
              scale={scale}
              xChannelSelector="R"
              yChannelSelector="B"
            />
            <feGaussianBlur in="displaced" result="finalBlur" stdDeviation="2" />
            <feComposite in="finalBlur" in2="finalBlur" operator="over" />
          </filter>
        </defs>
      </svg>
    </>
  );
};

export default LiquidGlassButton;
