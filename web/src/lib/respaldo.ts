import type { Config, Datos, Tema } from "../types";
import { normalizarDatos } from "./almacen";
import { guardarFotoConId, leerFoto } from "./fotos";
import { guardarOCompartir, type ResultadoGuardar } from "./archivos";

export const VERSION_RESPALDO = 1;

export async function construirRespaldo(
  datos: Datos,
  config: Config,
  tema: Tema
): Promise<string> {
  const fotos: Record<string, string> = {};
  for (const registro of datos.registros) {
    for (const id of registro.fotos) {
      const data = await leerFoto(id);
      if (data) fotos[id] = data;
    }
  }
  return JSON.stringify(
    {
      app: "Kairos",
      version: VERSION_RESPALDO,
      fecha: new Date().toISOString(),
      datos,
      config,
      tema,
      fotos,
    },
    null,
    2
  );
}

/** Guarda el respaldo en el dispositivo (hoja nativa de Android) o lo descarga. */
export function guardarRespaldo(nombre: string, contenido: string): Promise<ResultadoGuardar> {
  return guardarOCompartir({
    nombre,
    contenido,
    tipo: "application/json",
    titulo: "Kairós",
    texto: "Respaldo de datos de Kairós",
  });
}

export interface RespaldoImportado {
  ok: boolean;
  datos?: Datos;
  config?: Partial<Config>;
  tema?: Tema;
  fotos: number;
  mensaje: string;
}

export async function importarRespaldo(texto: string): Promise<RespaldoImportado> {
  try {
    const obj = JSON.parse(texto);
    if (!obj || typeof obj !== "object") {
      return { ok: false, fotos: 0, mensaje: "El archivo no tiene el formato esperado." };
    }
    const bruto = "datos" in obj ? obj.datos : obj;
    if (!bruto || typeof bruto !== "object" || !Array.isArray(bruto.actividades)) {
      return { ok: false, fotos: 0, mensaje: "No se encontraron actividades en el archivo." };
    }
    const datos = normalizarDatos(bruto);

    let fotos = 0;
    if (obj.fotos && typeof obj.fotos === "object") {
      for (const [id, data] of Object.entries(obj.fotos as Record<string, unknown>)) {
        if (typeof data === "string" && data.startsWith("data:")) {
          await guardarFotoConId(id, data);
          fotos += 1;
        }
      }
    }

    const config = obj.config && typeof obj.config === "object" ? (obj.config as Partial<Config>) : undefined;
    const tema = obj.tema === "dark" || obj.tema === "light" ? (obj.tema as Tema) : undefined;

    return {
      ok: true,
      datos,
      config,
      tema,
      fotos,
      mensaje: `Se importaron ${datos.actividades.length} actividades y ${datos.registros.length} registros.`,
    };
  } catch {
    return { ok: false, fotos: 0, mensaje: "El archivo no es un JSON válido." };
  }
}
