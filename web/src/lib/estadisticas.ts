import type { Actividad, Datos, TipoActividad } from "../types";
import { aportaLabor, aportaVoluntariado } from "../types";
import { duracionMinutos } from "./horas";

export interface FilaActividad {
  actividad: Actividad;
  minutos: number;
  registros: number;
  ultimaFecha: string;
}

export interface Totales {
  voluntariado: number;
  labor: number;
  totalRegistros: number;
  totalActividades: number;
  totalGeneral: number;
}

export function minutosDeRegistro(registro: { llegada: string; salida: string }): number {
  return duracionMinutos(registro.llegada, registro.salida);
}

export function resumenActividades(datos: Datos): FilaActividad[] {
  const filas = new Map<string, FilaActividad>();
  for (const a of datos.actividades) {
    filas.set(a.id, { actividad: a, minutos: 0, registros: 0, ultimaFecha: "" });
  }
  for (const r of datos.registros) {
    const fila = filas.get(r.actividadId);
    if (!fila) continue;
    fila.minutos += minutosDeRegistro(r);
    fila.registros += 1;
    if (r.fecha > fila.ultimaFecha) fila.ultimaFecha = r.fecha;
  }
  return [...filas.values()].sort((x, y) => y.minutos - x.minutos);
}

export function minutosDeActividad(datos: Datos, actividadId: string): number {
  return datos.registros
    .filter((r) => r.actividadId === actividadId)
    .reduce((acc, r) => acc + minutosDeRegistro(r), 0);
}

export function totales(datos: Datos): Totales {
  let voluntariado = 0;
  let labor = 0;
  let totalGeneral = 0;
  const minutosPorActividad = new Map<string, number>();
  for (const r of datos.registros) {
    const m = minutosDeRegistro(r);
    totalGeneral += m;
    minutosPorActividad.set(r.actividadId, (minutosPorActividad.get(r.actividadId) || 0) + m);
  }
  for (const a of datos.actividades) {
    const m = minutosPorActividad.get(a.id) || 0;
    if (aportaVoluntariado(a.tipo)) voluntariado += m;
    if (aportaLabor(a.tipo)) labor += m;
  }
  return {
    voluntariado,
    labor,
    totalRegistros: datos.registros.length,
    totalActividades: datos.actividades.length,
    totalGeneral,
  };
}

export interface PorcionGrafica {
  id: string;
  nombre: string;
  color: string;
  minutos: number;
  esFaltante: boolean;
}

/**
 * Porciones del gráfico de pastel para un tipo de horas.
 * Cada actividad aporta su color; el resto hasta la meta se pinta como "faltante".
 */
export function porciones(
  datos: Datos,
  tipo: Exclude<TipoActividad, "ambos">,
  metaMinutos: number,
  colorFaltante: string
): { porciones: PorcionGrafica[]; total: number; meta: number; faltan: number } {
  const filas = resumenActividades(datos).filter((f) =>
    tipo === "voluntariado"
      ? aportaVoluntariado(f.actividad.tipo)
      : aportaLabor(f.actividad.tipo)
  );
  const total = filas.reduce((acc, f) => acc + f.minutos, 0);
  const meta = Math.max(0, metaMinutos);
  const faltan = Math.max(0, meta - total);

  const lista: PorcionGrafica[] = filas
    .filter((f) => f.minutos > 0)
    .map((f) => ({
      id: f.actividad.id,
      nombre: f.actividad.nombre,
      color: f.actividad.color,
      minutos: f.minutos,
      esFaltante: false,
    }));

  if (faltan > 0) {
    lista.push({
      id: "faltante",
      nombre: "",
      color: colorFaltante,
      minutos: faltan,
      esFaltante: true,
    });
  }

  return { porciones: lista, total, meta, faltan };
}

export function registrosPorMes(datos: Datos): { clave: string; minutos: number }[] {
  const mapa = new Map<string, number>();
  for (const r of datos.registros) {
    const clave = r.fecha.slice(0, 7);
    mapa.set(clave, (mapa.get(clave) || 0) + minutosDeRegistro(r));
  }
  return [...mapa.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([clave, minutos]) => ({ clave, minutos }));
}
