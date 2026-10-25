import React from 'react';

interface DestinationGraphicProps {
  destination: string;
  className?: string;
  variant?: 'banner' | 'card' | 'thumbnail';
}

export const DestinationGraphic: React.FC<DestinationGraphicProps> = ({
  destination,
  className = '',
  variant = 'card',
}) => {
  const destLower = destination.toLowerCase();

  // Determine scenic theme based on destination
  let theme = 'coastal';
  if (destLower.includes('alps') || destLower.includes('mountain') || destLower.includes('moritz') || destLower.includes('zermatt')) {
    theme = 'alpine';
  } else if (destLower.includes('japan') || destLower.includes('tokyo') || destLower.includes('kyoto') || destLower.includes('asian')) {
    theme = 'oriental';
  } else if (destLower.includes('safari') || destLower.includes('serengeti') || destLower.includes('africa') || destLower.includes('kenya')) {
    theme = 'savanna';
  } else if (destLower.includes('paris') || destLower.includes('rome') || destLower.includes('london') || destLower.includes('culture')) {
    theme = 'cultural';
  }

  const heightClass = variant === 'banner' ? 'h-52' : variant === 'thumbnail' ? 'h-24' : 'h-40';

  if (theme === 'alpine') {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-br from-slate-800 via-sky-950 to-slate-900 flex items-center justify-center ${heightClass} ${className}`}>
        {/* Mountain Silhouette SVG */}
        <svg viewBox="0 0 400 200" preserveAspectRatio="none" className="absolute inset-0 w-full h-full opacity-40">
          <polygon points="0,200 70,80 150,150 240,40 330,130 400,70 400,200" fill="#0284c7" />
          <polygon points="0,200 110,90 190,160 280,60 360,140 400,100 400,200" fill="#0f172a" />
          {/* Snow peaks */}
          <polygon points="240,40 220,70 260,70" fill="#f8fafc" />
          <polygon points="70,80 55,105 85,105" fill="#f8fafc" />
          <polygon points="400,70 385,95 400,95" fill="#f8fafc" />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        <div className="relative z-10 px-4 text-center">
          <span className="text-xs uppercase tracking-widest text-sky-300 font-mono">Alpine High Altitude</span>
          <p className="text-white font-semibold text-sm sm:text-base mt-0.5 truncate">{destination}</p>
        </div>
      </div>
    );
  }

  if (theme === 'oriental') {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-br from-red-950 via-slate-900 to-stone-900 flex items-center justify-center ${heightClass} ${className}`}>
        {/* Pagoda & Sun SVG */}
        <svg viewBox="0 0 400 200" preserveAspectRatio="none" className="absolute inset-0 w-full h-full opacity-35">
          <circle cx="280" cy="70" r="45" fill="#e11d48" opacity="0.4" />
          {/* Pagoda tier silhouettes */}
          <polygon points="120,70 140,55 160,70" fill="#0f172a" />
          <polygon points="110,95 140,75 170,95" fill="#0f172a" />
          <polygon points="100,120 140,100 180,120" fill="#0f172a" />
          <rect x="132" y="120" width="16" height="80" fill="#0f172a" />
          <polygon points="0,200 80,150 200,190 320,140 400,180 400,200" fill="#1c1917" />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        <div className="relative z-10 px-4 text-center">
          <span className="text-xs uppercase tracking-widest text-amber-300 font-mono">Cultural Heritage & Zen</span>
          <p className="text-white font-semibold text-sm sm:text-base mt-0.5 truncate">{destination}</p>
        </div>
      </div>
    );
  }

  if (theme === 'savanna') {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-br from-amber-950 via-stone-900 to-amber-900 flex items-center justify-center ${heightClass} ${className}`}>
        {/* Savanna sunset acacia SVG */}
        <svg viewBox="0 0 400 200" preserveAspectRatio="none" className="absolute inset-0 w-full h-full opacity-40">
          <circle cx="200" cy="110" r="60" fill="#f59e0b" opacity="0.6" />
          {/* Acacia silhouette */}
          <path d="M 80,200 Q 85,130 90,110 C 70,90 60,80 40,85 C 30,75 90,65 110,80 C 130,65 160,70 150,85 C 130,85 105,95 95,115 Q 92,140 85,200 Z" fill="#1c1917" />
          <rect x="0" y="170" width="400" height="30" fill="#1c1917" />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        <div className="relative z-10 px-4 text-center">
          <span className="text-xs uppercase tracking-widest text-amber-300 font-mono">Wilderness & Wildlife</span>
          <p className="text-white font-semibold text-sm sm:text-base mt-0.5 truncate">{destination}</p>
        </div>
      </div>
    );
  }

  // Default Coastal & Mediterranean
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-teal-900 via-cyan-950 to-slate-900 flex items-center justify-center ${heightClass} ${className}`}>
      {/* Coastal waves and yacht SVG */}
      <svg viewBox="0 0 400 200" preserveAspectRatio="none" className="absolute inset-0 w-full h-full opacity-40">
        <path d="M 0,140 Q 100,110 200,140 T 400,140 L 400,200 L 0,200 Z" fill="#0284c7" />
        <path d="M 0,165 Q 120,145 240,165 T 400,165 L 400,200 L 0,200 Z" fill="#0369a1" />
        {/* Yacht silhouette */}
        <polygon points="170,125 210,125 220,135 160,135" fill="#f8fafc" />
        <polygon points="190,95 190,123 205,123" fill="#f8fafc" />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
      <div className="relative z-10 px-4 text-center">
        <span className="text-xs uppercase tracking-widest text-cyan-300 font-mono">Coastal & Yacht Expeditions</span>
        <p className="text-white font-semibold text-sm sm:text-base mt-0.5 truncate">{destination}</p>
      </div>
    </div>
  );
};
