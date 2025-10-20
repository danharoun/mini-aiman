'use client';

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HolographicControlsProps {
  isEnabled: boolean;
  color: string;
  onToggle: () => void;
  onColorChange: (color: string) => void;
  disabled?: boolean;
}

export function HolographicControls({
  isEnabled,
  color,
  onToggle,
  onColorChange,
  disabled = false,
}: HolographicControlsProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <div className="flex items-center gap-2">
      {/* Holographic Toggle Button */}
      <Button
        variant={isEnabled ? 'default' : 'outline'}
        size="sm"
        onClick={onToggle}
        disabled={disabled}
        className={cn(
          'transition-all',
          isEnabled && 'bg-cyan-500 hover:bg-cyan-600 text-white',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        title="Toggle holographic effect"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        {disabled ? 'Processing...' : isEnabled ? 'Hologram ON' : 'Hologram OFF'}
      </Button>

      {/* Color Picker (shows when holographic is enabled) */}
      {isEnabled && (
        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="h-8 w-8 rounded border-2 border-white/20 cursor-pointer transition-transform hover:scale-110"
            style={{ backgroundColor: color }}
            title="Change holographic color"
            aria-label="Change holographic color"
          />
          
          {showColorPicker && (
            <div className="absolute bottom-full mb-2 right-0 p-2 bg-gray-900 rounded-lg border border-white/10 shadow-xl z-50">
              <input
                type="color"
                value={color}
                onChange={(e) => onColorChange(e.target.value)}
                className="w-32 h-24 cursor-pointer rounded"
              />
              <p className="text-xs text-white/70 mt-2 text-center font-mono">{color}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}





