import { Browser } from "@capacitor/browser";
import { VERSION } from "../version";

const REPO = "irvinMartinez2709/kairos";
const CLAVE_ULTIMO_CHEQUEO = "kairos.actualizaciones.ultima";
/** Versión que el usuario rechazó actualizar (no volver a preguntar por esa versión). */
const CLAVE_RECHAZADA = "kairos.actualizaciones.rechazada";
/** Última versión vistada por el usuario (para detectar actualización manual). */
export const CLAVE_VERSION_VISTA = "kairos.version.vista";

const DIA_MS = 24 * 60 * 60 * 1000;

export interface Actualizacion {
  hay: boolean;
  version?: string;
  url?: string;
  /** true si no se pudo consultar (sin conexión o error de red). */
  fallo?: boolean;
}

function aNumeros(v: string): number[] {
  return v.split(".").map((p) => Number.parseInt(p, 10) || 0);
}

/** true si la versión «a» es más nueva que «b». */
export function versionNueva(a: string, b: string): boolean {
  const na = aNumeros(a);
  const nb = aNumeros(b);
  for (let i = 0; i < Math.max(na.length, nb.length); i++) {
    const d = (na[i] || 0) - (nb[i] || 0);
    if (d !== 0) return d > 0;
  }
  return false;
}

/** Consulta la última release pública del repo en GitHub. */
export async function buscarActualizacion(): Promise<Actualizacion> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { hay: false, fallo: true };
  }
  try {
    const ctrl = new AbortController();
    const reloj = window.setTimeout(() => ctrl.abort(), 10000);
    const r = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
      headers: { Accept: "application/vnd.github+json" },
      signal: ctrl.signal,
    });
    window.clearTimeout(reloj);
    if (!r.ok) return { hay: false, fallo: true };
    const j = (await r.json()) as {
      tag_name?: string;
      html_url?: string;
      assets?: Array<{ name: string; browser_download_url: string }>;
    };
    const tag = (j.tag_name || "").replace(/^v/i, "").trim();
    if (!tag || !versionNueva(tag, VERSION)) return { hay: false };
    const apk = (j.assets || []).find((a) => /^kairos-.*\.apk$/i.test(a.name));
    return { hay: true, version: tag, url: apk?.browser_download_url || j.html_url };
  } catch {
    return { hay: false, fallo: true };
  }
}

/** Abre el navegador para descargar el APK (Android no permite instalación silenciosa). */
export async function abrirDescarga(url: string): Promise<void> {
  try {
    await Browser.open({ url });
  } catch {
    window.open(url, "_blank");
  }
}

/** ¿Toca el chequeo automático de hoy? (una vez al día y solo en línea) */
export function chequeoDiarioPendiente(): boolean {
  try {
    if (typeof navigator !== "undefined" && !navigator.onLine) return false;
    const ultima = Number(localStorage.getItem(CLAVE_ULTIMO_CHEQUEO) || 0);
    return Date.now() - ultima >= DIA_MS;
  } catch {
    return false;
  }
}

/** Marca que ya se hizo el chequeo automático de hoy. */
export function marcarChequeo(): void {
  try {
    localStorage.setItem(CLAVE_ULTIMO_CHEQUEO, String(Date.now()));
  } catch {
    /* sin almacenamiento */
  }
}

/** ¿El usuario rechazó actualizar a esta versión? */
export function versionRechazada(version: string): boolean {
  try {
    return localStorage.getItem(CLAVE_RECHAZADA) === version;
  } catch {
    return false;
  }
}

/** Guarda la versión que el usuario rechazó (para no insistir). */
export function marcarRechazada(version: string): void {
  try {
    localStorage.setItem(CLAVE_RECHAZADA, version);
  } catch {
    /* sin almacenamiento */
  }
}

/**
 * Registra la versión que ve el usuario. Si cambió, significa que instaló una
 * versión nueva por cuenta propia: devuelve true para reactivar los avisos.
 */
export function registrarVersionVista(): boolean {
  try {
    const vista = localStorage.getItem(CLAVE_VERSION_VISTA);
    localStorage.setItem(CLAVE_VERSION_VISTA, VERSION);
    return vista !== null && vista !== VERSION;
  } catch {
    return false;
  }
}
