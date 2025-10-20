#!/usr/bin/env node

/**
 * Generate simple placeholder icons for PWA
 * Run: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// SVG icon template (holographic theme)
const createIconSVG = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Black background -->
  <rect width="${size}" height="${size}" fill="#000000"/>
  
  <!-- Cyan gradient circle -->
  <defs>
    <radialGradient id="hologram" cx="50%" cy="50%">
      <stop offset="0%" style="stop-color:#70c1ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#00a3ff;stop-opacity:0.5" />
    </radialGradient>
  </defs>
  
  <!-- Main circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/3}" fill="url(#hologram)" opacity="0.9"/>
  
  <!-- Inner rings -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/4}" fill="none" stroke="#70c1ff" stroke-width="${size/40}" opacity="0.6"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size/5}" fill="none" stroke="#70c1ff" stroke-width="${size/50}" opacity="0.4"/>
  
  <!-- Center dot -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/15}" fill="#ffffff" opacity="0.8"/>
  
  <!-- Scanlines effect -->
  ${Array.from({length: Math.floor(size/20)}, (_, i) => 
    `<line x1="0" y1="${i*20}" x2="${size}" y2="${i*20}" stroke="#70c1ff" stroke-width="1" opacity="0.1"/>`
  ).join('\n  ')}
</svg>
`;

// Save SVG to public folder
const publicDir = path.join(__dirname, '..', 'public');

// Generate 192x192
const icon192 = createIconSVG(192);
fs.writeFileSync(path.join(publicDir, 'icon-192.svg'), icon192.trim());
console.log('✅ Generated icon-192.svg');

// Generate 512x512
const icon512 = createIconSVG(512);
fs.writeFileSync(path.join(publicDir, 'icon-512.svg'), icon512.trim());
console.log('✅ Generated icon-512.svg');

console.log('\n📝 Next steps:');
console.log('1. Convert SVG to PNG using an online tool:');
console.log('   - https://svgtopng.com/');
console.log('   - https://cloudconvert.com/svg-to-png');
console.log('\n2. Or use ImageMagick (if installed):');
console.log('   convert public/icon-192.svg public/icon-192.png');
console.log('   convert public/icon-512.svg public/icon-512.png');
console.log('\n3. Delete SVG files after conversion (optional)');





