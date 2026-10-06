import sharp from "sharp";

const svg = (maskable) => `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${maskable ? 0 : 96}" fill="#0b2e22"/>
  <g ${maskable ? 'transform="translate(64 64) scale(0.75)"' : ""}>
    <g fill="#c9a227">
      <rect x="156" y="156" width="200" height="200" transform="rotate(45 256 256)"/>
      <rect x="156" y="156" width="200" height="200"/>
    </g>
    <circle cx="256" cy="256" r="70" fill="#0b2e22"/>
    <circle cx="256" cy="256" r="46" fill="#c9a227"/>
    <circle cx="276" cy="244" r="40" fill="#0b2e22"/>
  </g>
</svg>`;

const out = async (name, size, maskable) => {
  await sharp(Buffer.from(svg(maskable))).resize(size, size).png().toFile(`public/${name}`);
};

await out("icon-192.png", 192, false);
await out("icon-512.png", 512, false);
await out("icon-maskable-512.png", 512, true);
await out("apple-touch-icon.png", 180, false);
console.log("✅ تم توليد الأيقونات");