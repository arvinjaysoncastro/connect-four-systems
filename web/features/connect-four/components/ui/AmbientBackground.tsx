'use client';

import { GoldenLightTrail } from './GoldenLightTrail';

interface AmbientBackgroundProps {
  gridSize?: number;
  lightCount?: number;
  enableGrain?: boolean;
  grainOpacity?: number;
  enableGradient?: boolean;
  gradientOpacity?: number;
  className?: string;
}

export function AmbientBackground({
  gridSize = 64,
  lightCount = 13,
  enableGrain = true,
  grainOpacity = 0.091320,
  enableGradient = true,
  gradientOpacity = 0.16,
  className = '',
}: AmbientBackgroundProps) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`}>
      {enableGradient && (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(60% 40% at 50% 30%, rgba(19, 78, 74, ${gradientOpacity}), transparent 60%)`,
          }}
        />
      )}

      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(17, 24, 39, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(17, 24, 39, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`,
        }}
      />

      {enableGrain && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.25' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
            backgroundRepeat: 'repeat',
            opacity: grainOpacity,
            mixBlendMode: 'multiply',
          }}
          aria-hidden="true"
        />
      )}

      <GoldenLightTrail gridSize={gridSize} lightCount={lightCount} />
    </div>
  );
}
