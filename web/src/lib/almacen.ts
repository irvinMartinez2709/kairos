import type { Actividad, Config, Datos, Metas, Registro, Tema } from "../types";
import { normalizarTipo } from "../types";

const CLAVE_DATOS = "kairos.datos.v1";
const CLAVE_CONFIG = "kairos.config.v1";
const CLAVE_TEMA = "kairos.tema.v1";
const CLAVE_SEMILLA = "kairos.semilla.v1";
const VERSION_DATOS = 1;

export const META_DEFECTO: Metas = { voluntariado: 0, labor: 0 };

export const CONFIG_DEFECTO: Config = {
  color: "marino",
  emojis: "color",
  idioma: "es",
  formatoHora: "12",
  colorVol: "#12A365",
  colorLab: "#123C63",
  colorRestante: "#DBE3ED",
  notificaciones: false,
  horaRecordatorio: "19:00",
  diasRecordatorio: [1, 2, 3, 4, 5, 6, 7],
  modoRecordatorio: "semanal",
  fechaRecordatorio: "",
  avisarActualizaciones: true,
  confirmarSalida: true,
};

export function nuevoId(prefijo = "id"): string {
  return `${prefijo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const ACTIVIDAD_ECOMURAL: Actividad = {
  id: "act-ecomural",
  nombre: "Ecomural los milagros de Jesús",
  descripcion:
    "Mural ecológico comunitario en la colonia Los Milagros de Jesús. Pintura, siembra y limpieza del espacio.",
  tipo: "voluntariado",
  color: "#12A365",
  icono: "🎨",
  lugar: "Los Milagros de Jesús",
  creada: "2026-10-14T09:00:00.000Z",
};

const REGISTROS_ECOMURAL: Array<{
  fecha: string;
  llegada: string;
  salida: string;
  notas?: string;
}> = [
  { fecha: "2026-10-14", llegada: "09:00", salida: "12:00", notas: "Primer día: trazo y preparación de la pared." },
  { fecha: "2026-10-16", llegada: "09:00", salida: "14:00", notas: "Fondo del mural y mezcla de colores." },
  { fecha: "2026-10-19", llegada: "09:15", salida: "12:00", notas: "Pintura de la base y siembra de plantas." },
  { fecha: "2026-10-21", llegada: "08:55", salida: "12:00", notas: "Detalles de la vegetación." },
  { fecha: "2026-10-23", llegada: "09:00", salida: "14:00", notas: "Avance de figuras principales." },
  { fecha: "2026-10-24", llegada: "09:30", salida: "14:00", notas: "Retoques y limpieza del área." },
  { fecha: "2026-10-28", llegada: "09:00", salida: "12:30", notas: "Inauguración y entrega del mural." },
];

export function datosIniciales(): Datos {
  const registros: Registro[] = REGISTROS_ECOMURAL.map((r, i) => ({
    id: `reg-ecomural-${i + 1}`,
    actividadId: ACTIVIDAD_ECOMURAL.id,
    fecha: r.fecha,
    llegada: r.llegada,
    salida: r.salida,
    notas: r.notas || "",
    fotos: [],
    creado: `${r.fecha}T${r.salida}:00.000Z`,
  }));

  return {
    actividades: [ACTIVIDAD_ECOMURAL],
    registros,
    metas: { ...META_DEFECTO },
  };
}

function idValido(v: unknown): string {
  return typeof v === "string" && v.length > 0 ? v : nuevoId("id");
}

function normalizarActividad(a: unknown): Actividad | null {
  if (!a || typeof a !== "object") return null;
  const x = a as Partial<Actividad>;
  const nombre = typeof x.nombre === "string" ? x.nombre.trim() : "";
  if (!nombre) return null;
  return {
    id: idValido(x.id),
    nombre,
    descripcion: typeof x.descripcion === "string" ? x.descripcion : "",
    tipo: normalizarTipo(x.tipo),
    color: typeof x.color === "string" && x.color ? x.color : "#12A365",
    icono: typeof x.icono === "string" ? x.icono : "🌱",
    lugar: typeof x.lugar === "string" ? x.lugar : "",
    creada: typeof x.creada === "string" ? x.creada : new Date().toISOString(),
  };
}

function normalizarRegistro(r: unknown): Registro | null {
  if (!r || typeof r !== "object") return null;
  const x = r as Partial<Registro>;
  if (typeof x.actividadId !== "string" || !x.actividadId) return null;
  if (typeof x.fecha !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(x.fecha)) return null;
  return {
    id: idValido(x.id),
    actividadId: x.actividadId,
    fecha: x.fecha,
    llegada: typeof x.llegada === "string" ? x.llegada : "09:00",
    salida: typeof x.salida === "string" ? x.salida : "12:00",
    notas: typeof x.notas === "string" ? x.notas : "",
    fotos: Array.isArray(x.fotos) ? x.fotos.filter((f): f is string => typeof f === "string") : [],
    creado: typeof x.creado === "string" ? x.creado : new Date().toISOString(),
  };
}

export function normalizarDatos(bruto: unknown): Datos {
  const obj = (bruto || {}) as Partial<Datos> & { registros?: unknown };
  const actividades = Array.isArray(obj.actividades)
    ? obj.actividades.map(normalizarActividad).filter((a): a is Actividad => a !== null)
    : [];
  const ids = new Set(actividades.map((a) => a.id));
  const registros = Array.isArray(obj.registros)
    ? obj.registros
        .map(normalizarRegistro)
        .filter((r): r is Registro => r !== null && ids.has(r.actividadId))
    : [];
  const metas = obj.metas;
  return {
    actividades,
    registros,
    metas: {
      voluntariado:
        metas && Number.isFinite(metas.voluntariado) && metas.voluntariado > 0
          ? Math.round(metas.voluntariado)
          : 0,
      labor:
        metas && Number.isFinite(metas.labor) && metas.labor > 0 ? Math.round(metas.labor) : 0,
    },
  };
}

export function leerDatos(): Datos {
  try {
    const raw = localStorage.getItem(CLAVE_DATOS);
    if (!raw) {
      const base = datosIniciales();
      guardarDatos(base);
      localStorage.setItem(CLAVE_SEMILLA, "1");
      return base;
    }
    const parsed = JSON.parse(raw);
    const bruto = parsed && typeof parsed === "object" && "datos" in parsed ? parsed.datos : parsed;
    return normalizarDatos(bruto);
  } catch {
    return { actividades: [], registros: [], metas: { ...META_DEFECTO } };
  }
}

export function guardarDatos(d: Datos): void {
  try {
    localStorage.setItem(CLAVE_DATOS, JSON.stringify({ v: VERSION_DATOS, datos: d }));
  } catch {
    /* sin almacenamiento */
  }
}

/** Valida y deduplica los días de la semana (1=domingo … 7=sábado). Vacío → todos. */
function normalizarDias(dias: unknown): number[] {
  if (!Array.isArray(dias)) return [...CONFIG_DEFECTO.diasRecordatorio];
  const unicos = [...new Set(dias.filter((d): d is number => Number.isInteger(d) && d >= 1 && d <= 7))];
  unicos.sort((a, b) => a - b);
  return unicos.length ? unicos : [...CONFIG_DEFECTO.diasRecordatorio];
}

export function leerConfig(): Config {
  try {
    const raw = localStorage.getItem(CLAVE_CONFIG);
    if (!raw) return { ...CONFIG_DEFECTO };
    const c = JSON.parse(raw) as Partial<Config>;
    return {
      ...CONFIG_DEFECTO,
      ...c,
      color: typeof c.color === "string" && c.color ? c.color : CONFIG_DEFECTO.color,
      emojis:
        c.emojis === "mono" || c.emojis === "ninguno" ? c.emojis : CONFIG_DEFECTO.emojis,
      idioma: c.idioma === "en" ? "en" : "es",
      formatoHora: c.formatoHora === "24" ? "24" : "12",
      colorVol: typeof c.colorVol === "string" ? c.colorVol : CONFIG_DEFECTO.colorVol,
      colorLab: typeof c.colorLab === "string" ? c.colorLab : CONFIG_DEFECTO.colorLab,
      colorRestante:
        typeof c.colorRestante === "string" ? c.colorRestante : CONFIG_DEFECTO.colorRestante,
      notificaciones: c.notificaciones === true,
      horaRecordatorio:
        typeof c.horaRecordatorio === "string" ? c.horaRecordatorio : CONFIG_DEFECTO.horaRecordatorio,
      diasRecordatorio: normalizarDias(c.diasRecordatorio),
      modoRecordatorio: c.modoRecordatorio === "fecha" ? "fecha" : "semanal",
      fechaRecordatorio:
        typeof c.fechaRecordatorio === "string" ? c.fechaRecordatorio : CONFIG_DEFECTO.fechaRecordatorio,
      avisarActualizaciones: c.avisarActualizaciones !== false,
      confirmarSalida: c.confirmarSalida !== false,
    };
  } catch {
    return { ...CONFIG_DEFECTO };
  }
}

export function guardarConfig(c: Config): void {
  try {
    localStorage.setItem(CLAVE_CONFIG, JSON.stringify(c));
  } catch {
    /* noop */
  }
}

export function leerTema(): Tema {
  try {
    const t = localStorage.getItem(CLAVE_TEMA);
    return t === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function guardarTema(t: Tema): void {
  try {
    localStorage.setItem(CLAVE_TEMA, t);
  } catch {
    /* noop */
  }
}

export function borrarTodo(incluirSemilla = true): void {
  localStorage.removeItem(CLAVE_DATOS);
  localStorage.removeItem(CLAVE_CONFIG);
  localStorage.removeItem(CLAVE_TEMA);
  if (incluirSemilla) localStorage.removeItem(CLAVE_SEMILLA);
}

export { CLAVE_DATOS, CLAVE_CONFIG, CLAVE_TEMA, CLAVE_SEMILLA };
