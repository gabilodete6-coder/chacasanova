import fs from 'fs';
import sharp from 'sharp';

// High-fidelity master vector calibrated to match the 40x40 uploaded PNG reference
// Rendered at 400x400 then downsampled to exact 40x40 master PNG with Lanczos3
const svg400 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <g fill="#000000">
    <!-- G: Classic Bodoni Bowl -->
    <path d="
      M 148 45
      C 138 45, 122 52, 106 64
      C 72 88, 44 126, 28 170
      C 18 198, 16 216, 16 226
      C 16 248, 24 266, 40 280
      C 60 298, 88 304, 122 304
      C 142 304, 158 298, 172 290
      L 172 274
      C 158 282, 142 286, 124 286
      C 96 286, 76 278, 62 264
      C 50 250, 44 234, 44 218
      C 44 186, 56 148, 74 116
      C 92 82, 118 62, 142 60
      L 138 86
      L 154 86
      Z
    " />

    <!-- G: Upright Stem with Horizontal Top Crossbar -->
    <path d="
      M 126 132
      L 174 132
      L 174 140
      C 164 141, 158 146, 156 156
      L 156 250
      C 150 254, 144 256, 138 256
      C 132 256, 128 252, 126 246
      L 126 156
      C 124 146, 118 141, 108 140
      L 108 132
      Z
    " />

    <!-- W: First Diagonal Downstroke (thick) -->
    <polygon points="138,140 165,140 205,248 180,248" />

    <!-- W: Second Diagonal Hairline Upstroke (thin) -->
    <polygon points="196,248 208,248 244,165 234,165" />

    <!-- W: Fourth Stroke (Right leg with top serif) -->
    <path d="
      M 316 132
      L 364 132
      L 364 140
      C 354 141, 348 147, 344 158
      L 288 246
      L 274 246
      L 332 158
      C 328 147, 322 141, 316 140
      Z
    " />

    <!-- Calligraphic Arch & Swash Tail -->
    <path d="
      M 122 98
      C 144 88, 170 76, 196 76
      C 226 76, 252 88, 274 114
      C 292 136, 304 168, 314 206
      C 324 248, 336 290, 350 330
      C 360 354, 372 370, 384 378
      C 374 376, 362 366, 350 350
      C 334 326, 322 288, 310 244
      C 298 204, 284 168, 268 138
      C 248 114, 226 100, 198 94
      C 174 88, 148 94, 122 98
      Z
    " />
  </g>
</svg>`;

async function buildFavicons() {
  // 1. Generate master 40x40 PNG buffer
  const master40Buffer = await sharp(Buffer.from(svg400))
    .resize(40, 40, { kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();

  const targets = ['public', 'dist'];

  for (const dir of targets) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 1. Primary PNG: master 40x40 PNG
    fs.writeFileSync(`${dir}/favicon.png`, master40Buffer);

    // 2. 32x32 PNG (for browser tabs)
    await sharp(master40Buffer)
      .resize(32, 32, { kernel: sharp.kernel.lanczos3 })
      .png()
      .toFile(`${dir}/favicon-32x32.png`);

    // 3. 16x16 PNG (for compact tabs / bookmarks)
    await sharp(master40Buffer)
      .resize(16, 16, { kernel: sharp.kernel.lanczos3 })
      .png()
      .toFile(`${dir}/favicon-16x16.png`);

    // 4. 48x48 PNG / ICO fallback
    await sharp(master40Buffer)
      .resize(48, 48, { kernel: sharp.kernel.lanczos3 })
      .png()
      .toFile(`${dir}/favicon.ico`);

    // 5. 180x180 Apple Touch Icon
    await sharp(Buffer.from(svg400))
      .resize(180, 180, { kernel: sharp.kernel.lanczos3 })
      .png()
      .toFile(`${dir}/apple-touch-icon.png`);

    // 6. 192x192 PNG (PWA / Android)
    await sharp(Buffer.from(svg400))
      .resize(192, 192, { kernel: sharp.kernel.lanczos3 })
      .png()
      .toFile(`${dir}/favicon-192x192.png`);

    // 7. 512x512 PNG (PWA / High-res)
    await sharp(Buffer.from(svg400))
      .resize(512, 512, { kernel: sharp.kernel.lanczos3 })
      .png()
      .toFile(`${dir}/favicon-512x512.png`);

    // Also update favicon.svg with the un-deformed geometry
    fs.writeFileSync(`${dir}/favicon.svg`, svg400);

    console.log(`Generated all favicon assets in /${dir}`);
  }
}

buildFavicons().catch(err => {
  console.error('Build error:', err);
  process.exit(1);
});
