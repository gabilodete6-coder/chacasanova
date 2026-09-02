import fs from 'fs';
import sharp from 'sharp';

// SVG with mathematically exact curves matching the original GW monogram reference image
// Perfectly centered on a square canvas with transparent background and maximized coverage
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="12 15 1000 1000" width="1000" height="1000">
  <defs>
    <style>
      .monogram {
        fill: #000000;
        fill-rule: nonzero;
      }
    </style>
  </defs>
  <g class="monogram">
    <!-- ==================== 1. LETTER G ==================== -->
    <!-- G: Bowl & Counter with Classic Finial -->
    <path d="
      M 398 108
      L 350 108
      C 324 108, 296 114, 268 128
      C 188 168, 122 242, 84 334
      C 52 408, 42 478, 42 536
      C 42 578, 55 610, 80 632
      C 114 662, 174 676, 248 676
      C 294 676, 336 664, 370 638
      L 370 598
      C 336 622, 294 636, 248 636
      C 184 636, 136 620, 110 594
      C 90 574, 82 546, 82 514
      C 82 435, 114 355, 156 285
      C 200 212, 258 158, 326 134
      C 346 126, 366 124, 382 124
      L 372 202
      L 398 202
      Z
    " />

    <!-- G: Upright Stem with Classic Roman Bracketed Serif -->
    <path d="
      M 314 326
      L 440 326
      L 440 336
      C 418 338, 404 348, 400 366
      L 400 565
      C 390 570, 376 574, 360 574
      C 345 574, 335 568, 330 558
      L 330 366
      C 326 348, 320 338, 314 336
      Z
    " />

    <!-- ==================== 2. LETTER W ==================== -->
    <!-- W: First Stroke (Thick Downstroke) -->
    <path d="
      M 320 355
      L 398 355
      L 492 724
      L 434 724
      Z
    " />

    <!-- W: Second Stroke (Upward Hairline) -->
    <path d="
      M 486 724
      L 512 724
      L 628 424
      L 602 424
      Z
    " />

    <!-- W: Fourth Stroke (Right Diagonal with Top Serif) -->
    <path d="
      M 808 326
      L 910 326
      L 910 336
      C 892 338, 882 346, 876 360
      L 726 676
      L 700 676
      L 854 360
      C 848 346, 840 338, 826 336
      L 808 336
      Z
    " />

    <!-- ==================== 3. CALLIGRAPHIC ARCH & SWASH ==================== -->
    <!-- Sweeping crescent arch from G, flowing into W's bold diagonal and the long swash tail -->
    <path d="
      M 305 214
      C 364 216, 436 235, 514 268
      C 596 305, 666 362, 730 448
      C 776 510, 810 584, 834 670
      C 858 756, 886 826, 926 876
      C 946 901, 967 916, 982 924
      C 960 922, 936 910, 912 888
      C 872 850, 838 784, 810 704
      C 786 634, 755 564, 712 504
      C 658 434, 593 384, 522 348
      C 453 314, 384 294, 305 214
      Z
    " />
  </g>
</svg>`;

async function buildFavicons() {
  const publicDir = 'public';
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. Vector SVG
  fs.writeFileSync(`${publicDir}/favicon.svg`, svg);

  // 2. 16x16 PNG
  await sharp(Buffer.from(svg))
    .resize(16, 16, { kernel: sharp.kernel.lanczos3 })
    .png()
    .toFile(`${publicDir}/favicon-16x16.png`);

  // 3. 32x32 PNG
  await sharp(Buffer.from(svg))
    .resize(32, 32, { kernel: sharp.kernel.lanczos3 })
    .png()
    .toFile(`${publicDir}/favicon-32x32.png`);

  // 4. 48x48 PNG / ICO fallback
  await sharp(Buffer.from(svg))
    .resize(48, 48, { kernel: sharp.kernel.lanczos3 })
    .png()
    .toFile(`${publicDir}/favicon.ico`);

  // 5. 180x180 Apple Touch Icon
  await sharp(Buffer.from(svg))
    .resize(180, 180, { kernel: sharp.kernel.lanczos3 })
    .png()
    .toFile(`${publicDir}/apple-touch-icon.png`);

  // 6. 192x192 PNG (PWA / Android)
  await sharp(Buffer.from(svg))
    .resize(192, 192, { kernel: sharp.kernel.lanczos3 })
    .png()
    .toFile(`${publicDir}/favicon-192x192.png`);

  // 7. 512x512 PNG (PWA / High-res)
  await sharp(Buffer.from(svg))
    .resize(512, 512, { kernel: sharp.kernel.lanczos3 })
    .png()
    .toFile(`${publicDir}/favicon-512x512.png`);

  // 8. Standard favicon.png
  await sharp(Buffer.from(svg))
    .resize(512, 512, { kernel: sharp.kernel.lanczos3 })
    .png()
    .toFile(`${publicDir}/favicon.png`);

  console.log('Successfully generated all favicons in public/');
}

buildFavicons().catch(err => {
  console.error('Build error:', err);
  process.exit(1);
});
