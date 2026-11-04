export type Tema = "light" | "dark";
export type TipoActividad = "voluntariado" | "labor" | "ambos";
export type Idioma = "es" | "en";

export interface Actividad {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: TipoActividad;
  color: string;
  icono: string;
  lugar: string;
  creada: string;
}

export interface Registro {
  id: string;
  actividadId: string;
  fecha: string;
  llegada: string;
  salida: string;
  notas: string;
  fotos: string[];
  creado: string;
}

export interface Metas {
  voluntariado: number;
  labor: number;
}

export interface Datos {
  actividades: Actividad[];
  registros: Registro[];
  metas: Metas;
}

export interface Config {
  color: string;
  emojis: "color" | "mono" | "ninguno";
  idioma: Idioma;
  formatoHora: "12" | "24";
  colorVol: string;
  colorLab: string;
  colorRestante: string;
  notificaciones: boolean;
  horaRecordatorio: string;
  confirmarSalida: boolean;
}

export interface PresetColor {
  id: string;
  nombre: string;
  light: string;
  dark: string;
}

export const COLOR_PRESETS: PresetColor[] = [
  { id: "marino", nombre: "Azul marino", light: "#123C63", dark: "#7ABAF0" },
  { id: "esmeralda", nombre: "Esmeralda", light: "#0E9B62", dark: "#34D399" },
  { id: "azul", nombre: "Azul", light: "#2563EB", dark: "#60A5FA" },
  { id: "morado", nombre: "Morado", light: "#7C3AED", dark: "#A78BFA" },
  { id: "rosa", nombre: "Rosa", light: "#DB2777", dark: "#F472B6" },
  { id: "naranja", nombre: "Naranja", light: "#EA580C", dark: "#FB923C" },
  { id: "teal", nombre: "Turquesa", light: "#0D9488", dark: "#2DD4BF" },
  { id: "ambar", nombre: "Ámbar", light: "#B45309", dark: "#FBBF24" },
  { id: "gris", nombre: "Grafito", light: "#475569", dark: "#94A3B8" },
];

export const COLORES_ACTIVIDAD = [
  "#12A365",
  "#123C63",
  "#2563EB",
  "#7C3AED",
  "#DB2777",
  "#EA580C",
  "#0D9488",
  "#CA8A04",
  "#DC2626",
  "#4B5563",
  "#0891B2",
  "#65A30D",
];

export const ICONOS_ACTIVIDAD = [
  "🌱",
  "🎨",
  "♻️",
  "🤝",
  "📚",
  "🏥",
  "🐾",
  "🏗️",
  "🍲",
  "🧹",
  "🎓",
  "❤️",
];

export function tipoEtiqueta(tipo: TipoActividad): string {
  if (tipo === "voluntariado") return "Voluntariado";
  if (tipo === "labor") return "Labor social";
  return "Voluntariado y labor social";
}

export function normalizarTipo(v: unknown): TipoActividad {
  return v === "labor" || v === "ambos" ? v : "voluntariado";
}

export function aportaVoluntariado(tipo: TipoActividad): boolean {
  return tipo === "voluntariado" || tipo === "ambos";
}

export function aportaLabor(tipo: TipoActividad): boolean {
  return tipo === "labor" || tipo === "ambos";
}
