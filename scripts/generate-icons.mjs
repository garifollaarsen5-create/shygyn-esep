// PWA иконкаларын тәуелсіздіксіз жасайды (таза JS PNG энкодер).
// Дизайн: изумруд градиент фон + көтерілмелі бағандар (шығын диаграммасы).
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public");
mkdirSync(outDir, { recursive: true });

// ---- CRC32 ----
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---- Сурет салу ----
function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}
function draw(size) {
  const rgba = Buffer.alloc(size * size * 4);
  const radius = size * 0.22;

  // Бағандар параметрлері (диаграмма)
  const bars = [
    { h: 0.34, c: [255, 255, 255, 235] },
    { h: 0.52, c: [255, 255, 255, 255] },
    { h: 0.7, c: [230, 180, 80, 255] }, // алтын акцент
  ];
  const barW = size * 0.13;
  const gap = size * 0.07;
  const totalW = bars.length * barW + (bars.length - 1) * gap;
  const startX = (size - totalW) / 2;
  const baseY = size * 0.74;
  const barR = barW * 0.4;

  function inRoundedRect(px, py, x, y, w, h, r) {
    if (px < x || px > x + w || py < y || py > y + h) return false;
    const rx = Math.min(r, w / 2);
    const ry = Math.min(r, h / 2);
    const cx = px < x + rx ? x + rx : px > x + w - rx ? x + w - rx : px;
    const cy = py < y + ry ? y + ry : py > y + h - ry ? y + h - ry : py;
    const dx = px - cx;
    const dy = py - cy;
    return dx * dx + dy * dy <= Math.min(rx, ry) ** 2 || (px >= x + rx && px <= x + w - rx) || (py >= y + ry && py <= y + h - ry);
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      // Фон: тұтас бұрышты тіктөртбұрыш + тік градиент
      if (inRoundedRect(x, y, 0, 0, size, size, radius)) {
        const ty = y / size;
        rgba[i] = lerp(0x1d, 0x0c, ty);     // R: 0x199B → 0x0C
        rgba[i + 1] = lerp(0xc9, 0x76, ty); // G
        rgba[i + 2] = lerp(0x8f, 0x57, ty); // B
        rgba[i + 3] = 255;
      } else {
        rgba[i + 3] = 0; // мөлдір
      }

      // Бағандар
      for (let b = 0; b < bars.length; b++) {
        const bx = startX + b * (barW + gap);
        const bh = bars[b].h * size;
        const by = baseY - bh;
        if (inRoundedRect(x, y, bx, by, barW, bh, barR)) {
          const [r, g, bl, a] = bars[b].c;
          const af = a / 255;
          rgba[i] = lerp(rgba[i], r, af);
          rgba[i + 1] = lerp(rgba[i + 1], g, af);
          rgba[i + 2] = lerp(rgba[i + 2], bl, af);
          rgba[i + 3] = 255;
        }
      }
    }
  }
  return rgba;
}

function write(name, size) {
  const png = encodePNG(size, size, draw(size));
  writeFileSync(join(outDir, name), png);
  console.log(`✓ ${name} (${size}×${size}, ${(png.length / 1024).toFixed(1)} KB)`);
}

write("icon-192.png", 192);
write("icon-512.png", 512);
write("apple-touch-icon.png", 180);

// favicon.svg
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#1dc98f"/><stop offset="1" stop-color="#0c7657"/>
  </linearGradient></defs>
  <rect width="100" height="100" rx="22" fill="url(#g)"/>
  <rect x="26" y="48" width="13" height="26" rx="5" fill="#fff" opacity=".9"/>
  <rect x="44" y="36" width="13" height="38" rx="5" fill="#fff"/>
  <rect x="62" y="26" width="13" height="48" rx="5" fill="#e6b450"/>
</svg>`;
writeFileSync(join(outDir, "favicon.svg"), favicon);
console.log("✓ favicon.svg");
