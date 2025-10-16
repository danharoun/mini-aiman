'use client';

import { useState, useEffect } from 'react';
import { detectDeviceCapabilities } from '@/lib/performance-utils';

export function PerformanceIndicator() {
  const [fps, setFps] = useState(60);
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    // Only show on mobile
    const capabilities = detectDeviceCapabilities();
    setShow(capabilities.isMobile);
    
    // FPS counter
    let frameCount = 0;
    let lastTime = performance.now();
    
    function countFrame() {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(countFrame);
    }
    
    const rafId = requestAnimationFrame(countFrame);
    
    return () => cancelAnimationFrame(rafId);
  }, []);
  
  if (!show) return null;
  
  const fpsColor = fps >= 50 ? 'text-green-400' : fps >= 30 ? 'text-yellow-400' : 'text-red-400';
  
  return (
    <div className="fixed top-16 right-4 z-[200] backdrop-blur-xl bg-black/40 rounded-lg px-3 py-1.5 text-xs font-mono">
      <span className="text-white/60">FPS: </span>
      <span className={fpsColor}>{fps}</span>
    </div>
  );
}


