import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

/**
 * Genera los iconos de Android (legacy + adaptativos) directamente en
 * android/app/src/main/res a partir del logo transparente de Kairós.
 *
 * Uso (desde web/):  npm install --no-save sharp && node scripts/generar-iconos.mjs
 * En CI se ejecuta DESPUÉS de `npx cap add android` + `npx cap sync`.
 */

const SRC = path.resolve("public/iconos/icono-transparente-512.png");
const ANDROID = path.resolve("android/app/src/main/res");

// Color de fondo del icono (navy de la marca) y proporción del logo.
const BG = { r: 18, g: 60, b: 99 }; // #123C63
const BG_HEX = "#123C63";
const PROP_LEGACY = 0.66; // logo dentro de la tesela redondeada
const PROP_FOREGROUND = 0.58; // zona segura del icono adaptativo (66/108 dp)

// Base grande: se escala UNA vez y de ahí solo se reduce (mejor calidad).
const BASE = await sharp(SRC)
  .ensureAlpha()
  .resize(1024, 1024, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

const DENSIDADES = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
// Canvas del ícono adaptativo por densidad (108dp base): mdpi=108 … xxxhdpi=432
const CANVAS = { mdpi: 108, hdpi: 162, xhdpi: 216, xxhdpi: 324, xxxhdpi: 432 };

async function logoCentral(tam) {
  const lado = Math.max(8, Math.round(tam));
  return sharp(BASE)
    .resize(lado, lado, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

// Ícono legacy: tesela navy con esquinas redondeadas (squircle) + logo centrado.
async function legacy(tam) {
  const lado = Math.round(tam * PROP_LEGACY);
  const logo = await logoCentral(lado);
  const mascara = Buffer.from(
    `<svg width="${tam}" height="${tam}"><rect width="${tam}" height="${tam}" rx="${Math.round(tam * 0.22)}" fill="white"/></svg>`
  );
  return sharp({
    create: { width: tam, height: tam, channels: 4, background: { ...BG, alpha: 1 } },
  })
    .composite([{ input: logo, top: Math.round((tam - lado) / 2), left: Math.round((tam - lado) / 2) }])
    .composite([{ input: mascara, blend: "dest-in" }])
    .png()
    .toBuffer();
}

// Foreground adaptativo: logo centrado sobre lienzo transparente.
async function foreground(canvas) {
  const lado = Math.round(canvas * PROP_FOREGROUND);
  const logo = await logoCentral(lado);
  return sharp({
    create: { width: canvas, height: canvas, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: logo, top: Math.round((canvas - lado) / 2), left: Math.round((canvas - lado) / 2) }])
    .png()
    .toBuffer();
}

// Color de fondo del icono adaptativo
fs.mkdirSync(path.join(ANDROID, "values"), { recursive: true });
fs.writeFileSync(
  path.join(ANDROID, "values", "ic_launcher_background.xml"),
  `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">${BG_HEX}</color>
</resources>`
);

for (const d of Object.keys(DENSIDADES)) {
  const dir = path.join(ANDROID, `mipmap-${d}`);
  fs.mkdirSync(dir, { recursive: true });
  for (const f of fs.readdirSync(dir)) {
    if (/^ic_launcher/.test(f)) fs.rmSync(path.join(dir, f), { force: true });
  }
}

for (const [d, tam] of Object.entries(DENSIDADES)) {
  const dir = path.join(ANDROID, `mipmap-${d}`);
  const leg = await legacy(tam);
  const fg = await foreground(CANVAS[d]);
  await sharp(leg).toFile(path.join(dir, "ic_launcher.png"));
  await sharp(leg).toFile(path.join(dir, "ic_launcher_round.png"));
  await sharp(fg).toFile(path.join(dir, "ic_launcher_foreground.png"));
  console.log(`mipmap-${d}: legacy ${tam}px, foreground ${CANVAS[d]}px`);
}

const xml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>`;
const anydpi = path.join(ANDROID, "mipmap-anydpi-v26");
fs.mkdirSync(anydpi, { recursive: true });
fs.writeFileSync(path.join(anydpi, "ic_launcher.xml"), xml);
fs.writeFileSync(path.join(anydpi, "ic_launcher_round.xml"), xml);

console.log("Iconos de Kairós escritos en android/app/src/main/res");
