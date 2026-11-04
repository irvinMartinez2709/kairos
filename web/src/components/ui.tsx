import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Icono, type NombreIcono } from "./iconos";
import { useT } from "../i18n";

/* ---------------------------------------------------------------- */
/* Botones                                                           */
/* ---------------------------------------------------------------- */

type VarianteBoton = "primario" | "suave" | "contorno" | "peligro" | "fantasma";

export function Boton({
  children,
  onClick,
  variante = "primario",
  className = "",
  disabled = false,
  tipo = "button",
  icono,
}: {
  children?: ReactNode;
  onClick?: () => void;
  variante?: VarianteBoton;
  className?: string;
  disabled?: boolean;
  tipo?: "button" | "submit";
  icono?: NombreIcono;
}) {
  const estilos: Record<VarianteBoton, string> = {
    primario: "bg-acc text-onacc border-acc shadow-sm",
    suave: "bg-acc-suave text-acc border-transparent",
    contorno: "bg-card text-tinta border-borde",
    peligro: "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30",
    fantasma: "bg-transparent text-subtinta border-transparent",
  };
  return (
    <button
      type={tipo}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3 text-sm font-bold transition active:scale-[0.97] disabled:opacity-40 ${estilos[variante]} ${className}`}
    >
      {icono && <Icono nombre={icono} className="h-[18px] w-[18px]" />}
      {children}
    </button>
  );
}

export function BotonIcono({
  nombre,
  onClick,
  label,
  className = "",
  activo = false,
}: {
  nombre: NombreIcono;
  onClick: () => void;
  label: string;
  className?: string;
  activo?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid h-10 w-10 place-items-center rounded-xl border-2 transition active:scale-95 ${
        activo
          ? "border-acc bg-acc text-onacc"
          : "border-borde bg-card text-subtinta hover:text-acc"
      } ${className}`}
    >
      <Icono nombre={nombre} className="h-[18px] w-[18px]" />
    </button>
  );
}

/* ---------------------------------------------------------------- */
/* Contenedores                                                      */
/* ---------------------------------------------------------------- */

export function Tarjeta({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const base = `rounded-3xl border-2 border-borde bg-card ${className}`;
  if (!onClick) return <div className={base}>{children}</div>;
  return (
    <button type="button" onClick={onClick} className={`${base} w-full text-left active:scale-[0.99]`}>
      {children}
    </button>
  );
}

export function TituloSeccion({
  children,
  accion,
}: {
  children: ReactNode;
  accion?: ReactNode;
}) {
  return (
    <div className="mb-2 flex items-end justify-between gap-3">
      <h2 className="text-[15px] font-extrabold uppercase tracking-wide text-subtinta">
        {children}
      </h2>
      {accion}
    </div>
  );
}

export function EstadoVacio({
  icono = "lista",
  titulo,
  texto,
  accion,
}: {
  icono?: NombreIcono;
  titulo: string;
  texto?: string;
  accion?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-borde bg-card/60 px-6 py-10 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-soft text-subtinta">
        <Icono nombre={icono} className="h-6 w-6" />
      </div>
      <div>
        <p className="font-bold text-tinta">{titulo}</p>
        {texto && <p className="mt-1 text-sm text-subtinta">{texto}</p>}
      </div>
      {accion}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Campos                                                            */
/* ---------------------------------------------------------------- */

export function Campo({
  label,
  value,
  onChange,
  placeholder,
  tipo = "text",
  ayuda,
  min,
  max,
  paso,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  tipo?: "text" | "date" | "time" | "number" | "email";
  ayuda?: string;
  min?: string;
  max?: string;
  paso?: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-subtinta">{label}</span>
      <input
        type={tipo}
        value={value}
        min={min}
        max={max}
        step={paso}
        autoFocus={autoFocus}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border-2 border-borde bg-soft px-4 py-3 text-tinta outline-none placeholder:text-subtinta/60 focus:border-acc"
      />
      {ayuda && <span className="mt-1 block text-xs text-subtinta">{ayuda}</span>}
    </label>
  );
}

export function CampoArea({
  label,
  value,
  onChange,
  placeholder,
  filas = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  filas?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-subtinta">{label}</span>
      <textarea
        value={value}
        rows={filas}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-none rounded-2xl border-2 border-borde bg-soft px-4 py-3 text-tinta outline-none placeholder:text-subtinta/60 focus:border-acc"
      />
    </label>
  );
}

export function Interruptor({
  activo,
  onChange,
  label,
  detalle,
}: {
  activo: boolean;
  onChange: (v: boolean) => void;
  label: string;
  detalle?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!activo)}
      className="flex w-full items-center justify-between gap-3 py-2 text-left"
    >
      <span>
        <span className="block text-sm font-semibold text-tinta">{label}</span>
        {detalle && <span className="mt-0.5 block text-xs text-subtinta">{detalle}</span>}
      </span>
      <span
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          activo ? "bg-acc" : "bg-borde"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
            activo ? "left-6" : "left-1"
          }`}
        />
      </span>
    </button>
  );
}

export function Chip({
  activo,
  onClick,
  children,
  color,
}: {
  activo: boolean;
  onClick: () => void;
  children: ReactNode;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={
        activo && color
          ? { backgroundColor: color, borderColor: color, color: "#fff" }
          : undefined
      }
      className={`shrink-0 rounded-full border-2 px-3.5 py-1.5 text-[13px] font-bold transition active:scale-95 ${
        activo
          ? color
            ? ""
            : "border-acc bg-acc text-onacc"
          : "border-borde bg-card text-subtinta"
      }`}
    >
      {children}
    </button>
  );
}

export function Segmentado<T extends string>({
  valor,
  opciones,
  onChange,
}: {
  valor: T;
  opciones: { id: T; texto: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-2xl border-2 border-borde bg-soft p-1">
      {opciones.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`flex-1 rounded-xl px-2 py-2 text-[13px] font-bold transition ${
            valor === o.id ? "bg-card text-acc shadow-sm" : "text-subtinta"
          }`}
        >
          {o.texto}
        </button>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Hoja inferior (modal propio)                                      */
/* ---------------------------------------------------------------- */

export function Hoja({
  abierta,
  onCerrar,
  titulo,
  children,
  pie,
  alto = false,
}: {
  abierta: boolean;
  onCerrar: () => void;
  titulo: string;
  children: ReactNode;
  pie?: ReactNode;
  alto?: boolean;
}) {
  const t = useT();
  useEffect(() => {
    if (!abierta) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previo;
    };
  }, [abierta]);

  if (!abierta) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={onCerrar}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`animate-pop flex w-full max-w-md flex-col rounded-t-3xl border-2 border-borde bg-card sm:rounded-3xl ${
          alto ? "max-h-[92vh]" : "max-h-[86vh]"
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-borde/70 px-5 py-3">
          <h3 className="text-base font-extrabold text-tinta">{titulo}</h3>
          <button
            type="button"
            onClick={onCerrar}
            aria-label={t("Cerrar")}
            className="grid h-9 w-9 place-items-center rounded-xl bg-soft text-subtinta active:scale-95"
          >
            <Icono nombre="cerrar" className="h-4 w-4" />
          </button>
        </div>
        <div className="smooth-scroll flex-1 px-5 py-4">{children}</div>
        {pie && <div className="border-t border-borde/70 px-5 py-3">{pie}</div>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Avisos (toasts) y confirmaciones                                  */
/* ---------------------------------------------------------------- */

interface Aviso {
  id: number;
  texto: string;
  tipo: "ok" | "error" | "info";
}

interface PeticionConfirmar {
  titulo: string;
  mensaje?: string;
  textoOk?: string;
  textoCancelar?: string;
  peligro?: boolean;
  resolver: (v: boolean) => void;
}

let avisos: Aviso[] = [];
let peticion: PeticionConfirmar | null = null;
const oyentes = new Set<() => void>();

function emitir() {
  oyentes.forEach((f) => f());
}

function suscribir(f: () => void) {
  oyentes.add(f);
  return () => {
    oyentes.delete(f);
  };
}

export function avisar(texto: string, tipo: Aviso["tipo"] = "ok") {
  const id = Date.now() + Math.random();
  avisos = [...avisos, { id, texto, tipo }];
  emitir();
  window.setTimeout(() => {
    avisos = avisos.filter((a) => a.id !== id);
    emitir();
  }, 2800);
}

export function confirmar(opciones: {
  titulo: string;
  mensaje?: string;
  textoOk?: string;
  textoCancelar?: string;
  peligro?: boolean;
}): Promise<boolean> {
  return new Promise((resolver) => {
    peticion = { ...opciones, resolver };
    emitir();
  });
}

function cerrarPeticion(valor: boolean) {
  const p = peticion;
  peticion = null;
  emitir();
  p?.resolver(valor);
}

export function Dialogos() {
  const t = useT();
  const listaAvisos = useSyncExternalStore(
    suscribir,
    () => avisos,
    () => avisos
  );
  const actual = useSyncExternalStore(
    suscribir,
    () => peticion,
    () => peticion
  );

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col-reverse items-center gap-2 px-4">
        {listaAvisos.map((a) => (
          <div
            key={a.id}
            className={`animate-fade-in pointer-events-auto flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold shadow-lg ${
              a.tipo === "error"
                ? "bg-red-600 text-white"
                : a.tipo === "info"
                  ? "bg-slate-800 text-white"
                  : "bg-emerald-600 text-white"
            }`}
          >
            <Icono nombre={a.tipo === "error" ? "info" : "check"} className="h-4 w-4" />
            {a.texto}
          </div>
        ))}
      </div>

      {actual && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-6 backdrop-blur-[2px]">
          <div className="animate-pop w-full max-w-sm rounded-3xl border-2 border-borde bg-card p-5">
            <h3 className="text-lg font-extrabold text-tinta">{actual.titulo}</h3>
            {actual.mensaje && (
              <p className="mt-2 text-sm leading-relaxed text-subtinta">{actual.mensaje}</p>
            )}
            <div className="mt-5 flex gap-2">
              <Boton variante="contorno" className="flex-1" onClick={() => cerrarPeticion(false)}>
                {actual.textoCancelar || t("Cancelar")}
              </Boton>
              <Boton
                variante={actual.peligro ? "peligro" : "primario"}
                className="flex-1"
                onClick={() => cerrarPeticion(true)}
              >
                {actual.textoOk || t("Aceptar")}
              </Boton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------------------------------------------------------------- */
/* Barra de progreso                                                 */
/* ---------------------------------------------------------------- */

export function BarraProgreso({
  valor,
  max,
  color,
  altura = 12,
}: {
  valor: number;
  max: number;
  color: string;
  altura?: number;
}) {
  const pct = max > 0 ? Math.min(100, (valor / max) * 100) : 0;
  return (
    <div
      className="w-full overflow-hidden rounded-full bg-soft"
      style={{ height: altura }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Selector de opciones                                              */
/* ---------------------------------------------------------------- */

export function Selector<T extends string>({
  valor,
  opciones,
  onChange,
  label,
  placeholder = "Selecciona…",
  render,
}: {
  valor: T;
  opciones: { id: T; texto: string; detalle?: string }[];
  onChange: (v: T) => void;
  label?: string;
  placeholder?: string;
  render?: (id: T) => ReactNode;
}) {
  const [abierto, setAbierto] = useState(false);
  const elegida = opciones.find((o) => o.id === valor);
  const refLista = useRef<HTMLDivElement>(null);
  const contenido = useMemo(
    () => (elegida ? (render ? render(elegida.id) : elegida.texto) : placeholder),
    [elegida, render, placeholder]
  );

  return (
    <div>
      {label && <span className="mb-1 block text-sm font-semibold text-subtinta">{label}</span>}
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="flex w-full items-center justify-between gap-2 rounded-2xl border-2 border-borde bg-soft px-4 py-3 text-left text-tinta active:scale-[0.99]"
      >
        <span className={elegida ? "font-medium" : "text-subtinta"}>{contenido}</span>
        <Icono nombre="flecha" className="h-4 w-4 rotate-90 text-subtinta" />
      </button>

      <Hoja abierta={abierto} onCerrar={() => setAbierto(false)} titulo={label || "Selecciona"}>
        <div ref={refLista} className="space-y-1.5">
          {opciones.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => {
                onChange(o.id);
                setAbierto(false);
              }}
              className={`w-full rounded-2xl px-4 py-3 text-left transition ${
                o.id === valor ? "bg-acc text-onacc" : "bg-soft text-tinta"
              }`}
            >
              <span className="font-semibold">{o.texto}</span>
              {o.detalle && (
                <span
                  className={`ml-2 text-xs ${
                    o.id === valor ? "text-onacc/75" : "text-subtinta"
                  }`}
                >
                  {o.detalle}
                </span>
              )}
            </button>
          ))}
        </div>
      </Hoja>
    </div>
  );
}
