'use client';

import React from 'react';
import { 
  getCurrentQuality, 
  saveQualityPreference, 
  QUALITY_DESCRIPTIONS,
  type QualityLevel 
} from '@/lib/quality-settings';

export function QualitySelector() {
  const [quality, setQuality] = React.useState<QualityLevel>('medium');
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    setQuality(getCurrentQuality());
  }, []);

  const handleQualityChange = (newQuality: QualityLevel) => {
    setQuality(newQuality);
    saveQualityPreference(newQuality);
    setIsOpen(false);
    
    // Reload page to apply new settings
    window.location.reload();
  };

  const qualityColors: Record<QualityLevel, string> = {
    'ultra-low': 'bg-red-500',
    'low': 'bg-orange-500',
    'medium': 'bg-yellow-500',
    'high': 'bg-green-500',
    'ultra': 'bg-cyan-500',
  };

  const qualityLabels: Record<QualityLevel, string> = {
    'ultra-low': 'Ultra Low',
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High',
    'ultra': 'Ultra',
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg bg-black/40 px-3 py-2 text-sm text-white backdrop-blur-xl transition-colors hover:bg-black/60"
      >
        <div className={`h-2 w-2 rounded-full ${qualityColors[quality]}`} />
        <span className="font-medium">{qualityLabels[quality]}</span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[190]"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full z-[200] mt-2 w-72 rounded-lg bg-black/90 p-2 shadow-2xl backdrop-blur-xl">
            <div className="mb-2 border-b border-white/10 pb-2">
              <p className="text-xs font-semibold text-white/60">Render Quality</p>
            </div>
            
            {(Object.keys(QUALITY_DESCRIPTIONS) as QualityLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => handleQualityChange(level)}
                className={`flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors ${
                  quality === level
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-white/80 hover:bg-white/5'
                }`}
              >
                <div className={`mt-1 h-3 w-3 flex-shrink-0 rounded-full ${qualityColors[level]}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{qualityLabels[level]}</span>
                    {quality === level && (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-white/50">{QUALITY_DESCRIPTIONS[level]}</p>
                </div>
              </button>
            ))}
            
            <div className="mt-2 border-t border-white/10 pt-2">
              <p className="text-xs text-white/40">
                💡 Page will reload to apply new quality settings
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}





