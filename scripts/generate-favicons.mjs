import fs from 'fs';
import sharp from 'sharp';

// Minimalist, high-contrast house ("casinha") favicon icon
// Designed specifically for extreme legibility at small sizes (16x16, 32x32)
// Features:
// - Perfectly centered in a 32x32 square coordinate system with balanced 2px safe margins
// - Transparent background
// - Thick, bold silhouette with distinctive roof eaves overhang and arched doorway cutout
// - High contrast deep neutral black (#18181B)
// - Zero text, zero letters
const houseSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <path fill-rule="evenodd" clip-rule="evenodd" fill="#18181B" d="
    M 15.2 4.6
    C 15.6 4.3, 16.4 4.3, 16.8 4.6
    L 30.2 15.8
    C 30.7 16.2, 30.5 17, 29.8 17
    H 26
    V 28.2
    C 26 28.6, 25.6 29, 25.2 29
    H 6.8
    C 6.4 29, 6 28.6, 6 28.2
    V 17
    H 2.2
    C 1.5 17, 1.3 16.2, 1.8 15.8
    L 15.2 4.6
    Z
    M 12 22
    A 4 4 0 0 1 20 22
    V 29
    H 12
    Z
  " />
</svg>`;

async function buildFavicons() {
  const targets = ['public', 'dist'];

  for (const dir of targets) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 1. Vector SVG
    fs.writeFileSync(`${dir}/favicon.svg`, houseSvg);

    // 2. 16x16 PNG (compact browser tabs / bookmarks)
    await sharp(Buffer.from(houseSvg))
      .resize(16, 16, { kernel: sharp.kernel.lanczos3 })
      .png()
      .toFile(`${dir}/favicon-16x16.png`);

    // 3. 32x32 PNG (standard browser tabs on desktop)
    await sharp(Buffer.from(houseSvg))
      .resize(32, 32, { kernel: sharp.kernel.lanczos3 })
      .png()
      .toFile(`${dir}/favicon-32x32.png`);

    // 4. 48x48 PNG / ICO fallback
    await sharp(Buffer.from(houseSvg))
      .resize(48, 48, { kernel: sharp.kernel.lanczos3 })
      .png()
      .toFile(`${dir}/favicon.ico`);

    // 5. 180x180 Apple Touch Icon
    await sharp(Buffer.from(houseSvg))
      .resize(180, 180, { kernel: sharp.kernel.lanczos3 })
      .png()
      .toFile(`${dir}/apple-touch-icon.png`);

    // 6. 192x192 PNG (Android / PWA)
    await sharp(Buffer.from(houseSvg))
      .resize(192, 192, { kernel: sharp.kernel.lanczos3 })
      .png()
      .toFile(`${dir}/favicon-192x192.png`);

    // 7. 512x512 PNG (High-resolution icon)
    await sharp(Buffer.from(houseSvg))
      .resize(512, 512, { kernel: sharp.kernel.lanczos3 })
      .png()
      .toFile(`${dir}/favicon-512x512.png`);

    // 8. Standard fallback favicon.png
    await sharp(Buffer.from(houseSvg))
      .resize(512, 512, { kernel: sharp.kernel.lanczos3 })
      .png()
      .toFile(`${dir}/favicon.png`);

    console.log(`Successfully generated new house favicons in ${dir}/`);
  }
}

buildFavicons().catch(err => {
  console.error('Error generating favicons:', err);
  process.exit(1);
});
