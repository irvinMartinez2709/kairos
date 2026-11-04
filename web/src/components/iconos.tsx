type NombreIcono =
  | "inicio"
  | "lista"
  | "ajustes"
  | "mas"
  | "reloj"
  | "calendario"
  | "foto"
  | "basura"
  | "lapiz"
  | "descargar"
  | "subir"
  | "check"
  | "cerrar"
  | "atras"
  | "flecha"
  | "meta"
  | "grafica"
  | "compartir"
  | "ayuda"
  | "info"
  | "buscar"
  | "campana"
  | "sol"
  | "luna"
  | "alberca";

const RUTAS: Record<NombreIcono, string> = {
  inicio: "M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5",
  lista: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01",
  ajustes:
    "M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H1a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 2.6 7a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 7 2.6h.1A1.6 1.6 0 0 0 8.2 1V1a2 2 0 1 1 4 0v.1A1.6 1.6 0 0 0 15 2.6a1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.1a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.3 1.2Z",
  mas: "M12 5v14M5 12h14",
  reloj: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7.5V12l3 2",
  calendario: "M7 3v3M17 3v3M4 8h16M5 21h14a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1Z",
  foto: "M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5M9 9.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z",
  basura: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5",
  lapiz: "M4 20h4l11-11-4-4L4 16v4ZM14.5 5.5l4 4",
  descargar: "M12 3v12M7 11l5 5 5-5M4 20h16",
  subir: "M12 16V4M7 8l5-5 5 5M4 20h16",
  check: "M4 12.5 9 18 20 6",
  cerrar: "M6 6l12 12M18 6 6 18",
  atras: "M15 5l-7 7 7 7",
  flecha: "M9 5l7 7-7 7",
  meta: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM12 13.2a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z",
  grafica: "M12 3a9 9 0 1 0 9 9h-9V3Z",
  compartir: "M12 16V4M8 7l4-3 4 3M5 14v6h14v-6",
  ayuda: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9.5 9.2a2.6 2.6 0 1 1 3.7 2.4c-.8.4-1.2 1-1.2 1.9M12 17h.01",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 11v5M12 8h.01",
  buscar: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3",
  campana: "M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6ZM10 20a2 2 0 0 0 4 0",
  sol: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  luna: "M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z",
  alberca: "M3 12h18M3 17h18M7 12V7a2 2 0 0 1 4 0v5M13 12V7a2 2 0 0 1 4 0v5",
};

export function Icono({
  nombre,
  className = "h-5 w-5",
  grosor = 1.8,
}: {
  nombre: NombreIcono;
  className?: string;
  grosor?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={grosor}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={RUTAS[nombre]} />
    </svg>
  );
}

export type { NombreIcono };
