import type { Idioma } from "../types";

/** Convierte "HH:MM" a minutos desde medianoche. Devuelve null si no es válido. */
export function aMinutos(hhmm: string): number | null {
  if (typeof hhmm !== "string") return null;
  const m = hhmm.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

export function aHHMM(minutos: number): string {
  const total = ((Math.round(minutos) % 1440) + 1440) % 1440;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Duración en minutos entre dos horas. Si la salida es menor, cruza la medianoche. */
export function duracionMinutos(llegada: string, salida: string): number {
  const a = aMinutos(llegada);
  const b = aMinutos(salida);
  if (a === null || b === null) return 0;
  const diff = b - a;
  if (diff === 0) return 0;
  return diff > 0 ? diff : diff + 1440;
}

/** Suma de minutos de una lista de duraciones. */
export function sumarMinutos(minutos: number[]): number {
  return minutos.reduce((acc, m) => acc + (Number.isFinite(m) ? m : 0), 0);
}

/** Convierte minutos a horas+minutos enteros (nunca decimales). */
export function partirHoras(minutos: number): { horas: number; minutos: number } {
  const total = Math.max(0, Math.round(minutos));
  return { horas: Math.floor(total / 60), minutos: total % 60 };
}

/**
 * Formato principal de la app: "26 h 50 min", "3 h", "45 min", "0 min".
 * Siempre horas y minutos enteros; los minutos nunca pasan de 59.
 */
export function formatoHM(minutos: number, idioma: Idioma = "es"): string {
  const { horas, minutos: min } = partirHoras(minutos);
  const h = idioma === "en" ? "h" : "h";
  if (horas === 0 && min === 0) return idioma === "en" ? "0 min" : "0 min";
  if (horas === 0) return `${min} min`;
  if (min === 0) return `${horas} ${h}`;
  return `${horas} ${h} ${String(min).padStart(2, "0")} min`;
}

/** Formato corto para tablas y leyendas: "26:50" (horas:minutos). */
export function formatoCorto(minutos: number): string {
  const { horas, minutos: min } = partirHoras(minutos);
  return `${horas}:${String(min).padStart(2, "0")}`;
}

/** Texto accesible: "26 horas con 50 minutos". */
export function formatoLargo(minutos: number): string {
  const { horas, minutos: min } = partirHoras(minutos);
  if (horas === 0 && min === 0) return "0 minutos";
  const partes: string[] = [];
  if (horas > 0) partes.push(`${horas} ${horas === 1 ? "hora" : "horas"}`);
  if (min > 0) partes.push(`${min} ${min === 1 ? "minuto" : "minutos"}`);
  return partes.join(" con ");
}

export function hoyISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/** "2026-10-14" -> Date local (sin desfase de zona horaria) */
export function fechaLocal(iso: string): Date | null {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

export function formatearFecha(iso: string, idioma: Idioma = "es", largo = false): string {
  const d = fechaLocal(iso);
  if (!d) return iso;
  const loc = idioma === "en" ? "en-US" : "es-MX";
  return d.toLocaleDateString(loc, {
    weekday: largo ? "long" : "short",
    day: "numeric",
    month: largo ? "long" : "short",
    year: "numeric",
  });
}

export function formatearHoraHHMM(
  hhmm: string,
  formato: "12" | "24",
  idioma: Idioma = "es"
): string {
  const min = aMinutos(hhmm);
  if (min === null) return hhmm;
  const h24 = Math.floor(min / 60);
  const m = min % 60;
  if (formato === "24") return `${String(h24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  const sufijo =
    idioma === "en" ? (h24 < 12 ? "AM" : "PM") : h24 < 12 ? "a. m." : "p. m.";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${sufijo}`;
}

/** Día ISO de la semana (0 = domingo) */
export function diaSemana(iso: string): number {
  const d = fechaLocal(iso);
  return d ? d.getDay() : 0;
}

export function mesClave(iso: string): string {
  return iso.slice(0, 7);
}

export function nombreMes(clave: string, idioma: Idioma = "es"): string {
  const d = fechaLocal(`${clave}-01`);
  if (!d) return clave;
  const loc = idioma === "en" ? "en-US" : "es-MX";
  return d.toLocaleDateString(loc, { month: "long", year: "numeric" });
}

export function minutosAHorasTexto(minutos: number): string {
  const { horas, minutos: min } = partirHoras(minutos);
  if (min === 0) return String(horas);
  return `${horas},${String(min).padStart(2, "0")}`;
}
