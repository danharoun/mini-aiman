# PWA Icon Instructions

## Required Icons

You need to create two PNG icons for the PWA:

1. **icon-192.png** - 192x192 pixels
2. **icon-512.png** - 512x512 pixels

## Design Suggestions

- Background: Black (#000000) or Cyan (#70c1ff)
- Icon: Holographic/AI themed (e.g., geometric head, circuit brain, hologram symbol)
- Style: Modern, minimal, futuristic

## Quick Generation Options

### Option 1: Use an online generator
- Visit: https://realfavicongenerator.net/
- Upload a square logo/icon
- Download PWA icons

### Option 2: Use ImageMagick (if installed)
```bash
# From a square source image
convert source.png -resize 192x192 icon-192.png
convert source.png -resize 512x512 icon-512.png
```

### Option 3: Use Figma/Canva
- Create 512x512 canvas
- Design your icon
- Export as PNG at 192x192 and 512x512

## Temporary Placeholder

Until you create custom icons, you can use:
- Emoji as placeholder (🤖 or ✨)
- Simple gradient circle
- Text-based logo

Place the files in the `/public` directory:
- `/public/icon-192.png`
- `/public/icon-512.png`





