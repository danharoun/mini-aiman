/**
 * Load TalkingHead library dynamically from CDN
 * This approach uses script tags to load ES modules
 */

let loadPromise: Promise<void> | null = null;
let isLoaded = false;

export function loadTalkingHead(): Promise<void> {
  // Return cached promise if already loading
  if (loadPromise) {
    return loadPromise;
  }

  // Return resolved promise if already loaded
  if (isLoaded && typeof window !== 'undefined' && (window as any).TalkingHead) {
    return Promise.resolve();
  }

  loadPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Cannot load TalkingHead: window is undefined'));
      return;
    }

    // Check if already loaded
    if ((window as any).TalkingHead) {
      isLoaded = true;
      resolve();
      return;
    }

    // Create a unique ID for this load attempt
    const loadId = `talkinghead-load-${Date.now()}`;

    // Create script element with import map
    const importMapScript = document.createElement('script');
    importMapScript.type = 'importmap';
    importMapScript.textContent = JSON.stringify({
      imports: {
        three: 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js/+esm',
        'three/addons/': 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/',
        talkinghead:
          'https://cdn.jsdelivr.net/gh/met4citizen/TalkingHead@1.6/modules/talkinghead.mjs',
      },
    });

    // Create module script to load TalkingHead and THREE.js
    const moduleScript = document.createElement('script');
    moduleScript.type = 'module';
    moduleScript.id = loadId;
    moduleScript.textContent = `
      import { TalkingHead } from 'talkinghead';
      import * as THREE from 'three';
      window.TalkingHead = TalkingHead;
      window.THREE = THREE;
      window.dispatchEvent(new CustomEvent('${loadId}-loaded'));
    `;

    // Set up event listener
    const handleLoad = () => {
      console.log('✅ TalkingHead library loaded successfully');
      console.log('✅ THREE.js loaded:', !!(window as any).THREE);
      isLoaded = true;
      window.removeEventListener(`${loadId}-loaded`, handleLoad);
      resolve();
    };

    const handleError = (error: ErrorEvent) => {
      console.error('❌ Failed to load TalkingHead library:', error);
      window.removeEventListener(`${loadId}-loaded`, handleLoad);
      window.removeEventListener('error', handleError);
      reject(new Error('Failed to load TalkingHead library'));
    };

    window.addEventListener(`${loadId}-loaded`, handleLoad);
    window.addEventListener('error', handleError, { once: true });

    // Append scripts to head
    try {
      // Check if import map already exists
      const existingImportMap = document.querySelector('script[type="importmap"]');
      if (!existingImportMap) {
        document.head.appendChild(importMapScript);
      }
      document.head.appendChild(moduleScript);

      // Timeout after 30 seconds
      setTimeout(() => {
        if (!isLoaded) {
          handleError(new ErrorEvent('timeout'));
        }
      }, 30000);
    } catch (err) {
      console.error('Error appending scripts:', err);
      reject(err);
    }
  });

  return loadPromise;
}

/**
 * Check if TalkingHead is loaded
 */
export function isTalkingHeadLoaded(): boolean {
  return isLoaded && typeof window !== 'undefined' && (window as any).TalkingHead !== undefined;
}

/**
 * Get TalkingHead class (will throw if not loaded)
 */
export function getTalkingHead(): any {
  if (!isTalkingHeadLoaded()) {
    throw new Error('TalkingHead library is not loaded. Call loadTalkingHead() first.');
  }
  return (window as any).TalkingHead;
}

