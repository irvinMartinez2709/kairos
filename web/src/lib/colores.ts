import type { Config, Tema } from "../types";
import { COLOR_PRESETS } from "../types";

type RGB = [number, number, number];

export function esColorHex(s: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(s.trim()) || /^#[0-9a-fA-F]{3}$/.test(s.trim());
}

export function hexARgb(hex: string): RGB {
  let h = hex.trim().replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  if (isNaN(n) || h.length !== 6) return [18, 60, 99];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbAHex(r: RGB): string {
  const s = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${s(r[0])}${s(r[1])}${s(r[2])}`;
}

export function mezclarHex(a: string, b: string, t: number): string {
  const x = hexARgb(a);
  const y = hexARgb(b);
  return rgbAHex([
    x[0] + (y[0] - x[0]) * t,
    x[1] + (y[1] - x[1]) * t,
    x[2] + (y[2] - x[2]) * t,
  ]);
}

export function luminancia(hex: string): number {
  const [r, g, b] = hexARgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Ajusta un color para que se lea bien en el tema actual. */
export function colorLegible(hex: string, tema: Tema): string {
  if (!esColorHex(hex)) return hex;
  const lum = luminancia(hex);
  if (tema === "dark" && lum < 0.18) return mezclarHex(hex, "#FFFFFF", 0.42);
  if (tema === "dark" && lum > 0.55) return mezclarHex(hex, "#1A2740", 0.68);
  if (tema === "light" && lum > 0.72) return mezclarHex(hex, "#000000", 0.35);
  return hex;
}

export function textoSobre(hex: string): string {
  return luminancia(hex) > 0.55 ? "#0B1626" : "#FFFFFF";
}

export function acentoDe(color: string, tema: Tema): string {
  if (esColorHex(color)) return colorLegible(color, tema);
  const p = COLOR_PRESETS.find((c) => c.id === color);
  if (!p) return tema === "dark" ? "#7ABAF0" : "#123C63";
  return tema === "dark" ? p.dark : p.light;
}

function str(r: RGB): string {
  return `${Math.round(r[0])} ${Math.round(r[1])} ${Math.round(r[2])}`;
}

/** Aplica acento + colores de gráficas a toda la app mediante variables CSS. */
export function aplicarPaleta(config: Config, tema: Tema): void {
  const html = document.documentElement;
  const acc = hexARgb(acentoDe(config.color, tema));
  const oscuro = tema === "dark";

  const base = oscuro
    ? {
        fondo: [12, 21, 38] as RGB,
        card: [20, 32, 52] as RGB,
        soft: [27, 42, 66] as RGB,
        borde: [40, 57, 84] as RGB,
        tinta: [238, 244, 252] as RGB,
        subtinta: [154, 172, 196] as RGB,
        onacc: [8, 16, 30] as RGB,
        blanco: [255, 255, 255] as RGB,
      }
    : {
        fondo: [238, 243, 248] as RGB,
        card: [255, 255, 255] as RGB,
        soft: [239, 244, 250] as RGB,
        borde: [213, 224, 236] as RGB,
        tinta: [17, 30, 46] as RGB,
        subtinta: [88, 104, 126] as RGB,
        onacc: [255, 255, 255] as RGB,
        blanco: [255, 255, 255] as RGB,
      };

  const mezcla = (a: RGB, b: RGB, t: number): RGB => [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];

  const vars: Record<string, RGB> = {
    "--c-acc": acc,
    "--c-acc-fuerte": oscuro ? mezcla(acc, base.blanco, 0.25) : mezcla(acc, base.fondo, 0.3),
    "--c-acc-suave": oscuro ? mezcla(acc, base.card, 0.82) : mezcla(acc, base.blanco, 0.88),
    "--c-fondo": mezcla(base.fondo, acc, oscuro ? 0.08 : 0.05),
    "--c-card": base.card,
    "--c-soft": mezcla(base.soft, acc, oscuro ? 0.08 : 0.1),
    "--c-borde": mezcla(base.borde, acc, oscuro ? 0.12 : 0.14),
    "--c-tinta": base.tinta,
    "--c-subtinta": base.subtinta,
    "--c-onacc": base.onacc,
    "--c-vol": hexARgb(colorLegible(config.colorVol, tema)),
    "--c-lab": hexARgb(colorLegible(config.colorLab, tema)),
    "--c-restante": hexARgb(colorLegible(config.colorRestante, tema)),
  };

  for (const [k, v] of Object.entries(vars)) html.style.setProperty(k, str(v));
}

export function colorVar(nombre: string): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue(nombre).trim();
  return v ? `rgb(${v.split(/\s+/).join(",")})` : "#123C63";
}
