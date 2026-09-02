import fs from 'fs';
import sharp from 'sharp';

// Build the SVG path for the exact intertwined GW monogram
function buildSvg(strokeBoost = 0) {
  // viewBox is 0 0 1000 1000
  // Monogram bounds roughly:
  // x: 45 to 982 (~937 width)
  // y: 105 to 925 (~820 height)
  // Center is around (513, 515), perfectly centered!
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
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
    <!-- G: Outer curve and inner counter with Didot/Bodoni finial at top-right -->
    <path d="
      M 396 106
      L 350 106
      C 328 106, 305 110, 280 120
      C 200 152, 135 215, 88 305
      C 48 382, 38 460, 38 535
      C 38 575, 48 610, 72 638
      C 105 675, 160 696, 230 696
      C 278 696, 322 682, 355 656
      L 355 628
      C 322 648, 280 660, 230 660
      C 175 660, 130 642, 102 612
      C 82 590, 74 560, 74 525
      C 74 445, 108 365, 150 290
      C 190 220, 245 168, 310 142
      C 330 134, 350 132, 370 132
      L 370 200
      L 396 200
      Z
    " />

    <!-- G: Upright Vertical Stem with Classical Top Serif -->
    <path d="
      M 314 326
      L 438 326
      L 438 335
      C 420 336, 404 346, 400 365
      L 400 575
      C 392 578, 380 580, 365 580
      C 350 580, 340 575, 334 568
      L 334 365
      C 330 346, 324 336, 314 335
      Z
    " />

    <!-- ==================== 2. LETTER W ==================== -->
    <!-- W: First diagonal (thick downstroke, descending to bottom vertex) -->
    <path d="
      M 318 355
      L 388 355
      L 490 722
      L 438 722
      Z
    " />

    <!-- W: Second diagonal (thin upstroke) -->
    <path d="
      M 488 722
      L 504 722
      L 612 425
      L 596 425
      Z
    " />

    <!-- W: Fourth diagonal (right diagonal with top serif) -->
    <!-- Top serif on the right stem of W -->
    <path d="
      M 808 326
      L 906 326
      L 906 335
      C 892 336, 882 344, 876 358
      L 720 672
      L 704 672
      L 856 358
      C 850 344, 842 336, 826 335
      L 808 335
      Z
    " />

    <!-- ==================== 3. CALLIGRAPHIC ARCH & SWASH ==================== -->
    <!-- Sweeping crescent arch from G, crossing through center and flowing into the long swash tail -->
    <path d="
      M 305 214
      C 360 216, 430 234, 508 268
      C 590 304, 660 360, 724 445
      C 770 508, 804 582, 828 668
      C 852 754, 882 825, 922 875
      C 942 900, 964 916, 982 924
      C 960 922, 936 910, 912 888
      C 872 850, 838 785, 810 705
      C 786 635, 755 565, 712 505
      C 660 435, 595 385, 524 350
      C 455 316, 385 295, 305 214
      Z
    " />
  </g>
</svg>`;
}

async function previewAscii() {
  const svg = buildSvg();
  const { data, info } = await sharp(Buffer.from(svg))
    .resize(60, 30)
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log('--- ASCII PREVIEW (60x30) ---');
  for (let y = 0; y < info.height; y++) {
    let line = '';
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * info.channels;
      const alpha = info.channels === 4 ? data[idx + 3] : 255;
      const r = data[idx];
      const isFilled = alpha > 100 && r < 128;
      line += isFilled ? '█' : ' ';
    }
    console.log(line);
  }
}

previewAscii();
