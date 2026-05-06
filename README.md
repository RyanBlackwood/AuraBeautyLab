# Aura Beauty Lab — Final Build v4.0

Complete React + Vite frontend for Aura Beauty Lab.

## Run locally
```bash
npm install
npm run dev
```

## Deploy to GitHub Pages
Configured for `https://ryanblackwood.github.io/AuraBeautyLab/`.

```bash
npm install
npm run build
cp -r dist/* .
git add .
git commit -m "Deploy Aura Beauty Lab final build"
git push origin main
```

Do not commit `node_modules/`; `.gitignore` is included.

## Features
- Premium responsive landing page
- Final nail designer
- Photoreal-inspired hand renderer with SVG gradients/textures
- Live shape/color/finish/length updates
- Price estimate and saved look
- Client/prep notes
- AR try-on modal with camera, flip camera, MediaPipe tracking attempt, and manual draggable fallback
- Booking-ready CTA section
