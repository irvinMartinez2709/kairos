import { formatoHM } from "../lib/horas";
import type { Idioma } from "../types";
import type { PorcionGrafica } from "../lib/estadisticas";

const CIRCUNFERENCIA = 2 * Math.PI * 84;

export function GraficaDona({
  porciones,
  total,
  meta,
  colorPista,
  idioma,
  colorCentro,
}: {
  porciones: PorcionGrafica[];
  total: number;
  meta: number;
  colorPista: string;
  idioma: Idioma;
  colorCentro: string;
}) {
  const pesoTotal = porciones.reduce((acc, p) => acc + p.minutos, 0);
  let acumulado = 0;

  const pct = meta > 0 ? Math.min(100, (total / meta) * 100) : pesoTotal > 0 ? 100 : 0;

  return (
    <div className="relative mx-auto grid aspect-square w-full max-w-[190px] place-items-center">
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
        <circle cx="100" cy="100" r="84" fill="none" stroke={colorPista} strokeWidth="19" />
        {pesoTotal > 0 &&
          porciones.map((p) => {
            const largo = (p.minutos / pesoTotal) * CIRCUNFERENCIA;
            const hueco = porciones.length > 1 ? 3 : 0;
            const visible = Math.max(0, largo - hueco);
            const offset = acumulado;
            acumulado += largo;
            return (
              <circle
                key={p.id}
                cx="100"
                cy="100"
                r="84"
                fill="none"
                stroke={p.color}
                strokeWidth="19"
                strokeDasharray={`${visible} ${CIRCUNFERENCIA - visible}`}
                strokeDashoffset={-offset}
                className="transition-all duration-700"
              />
            );
          })}
      </svg>

      <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
        <span
          className="font-black leading-none"
          style={{ color: colorCentro, fontSize: meta > 0 ? 26 : 19 }}
        >
          {meta > 0 ? `${Math.round(pct)}%` : formatoHM(total, idioma)}
        </span>
        <span className="mt-1 block max-w-[118px] text-[10.5px] font-semibold leading-tight text-subtinta">
          {meta > 0 ? formatoHM(total, idioma) : idioma === "en" ? "logged" : "registradas"}
        </span>
      </div>
    </div>
  );
}

export function Leyenda({
  porciones,
  meta,
  idioma,
  onSeleccionar,
}: {
  porciones: PorcionGrafica[];
  meta: number;
  idioma: Idioma;
  onSeleccionar?: (id: string) => void;
}) {
  if (porciones.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-subtinta">
        {idioma === "en" ? "No hours yet" : "Todavía no hay horas registradas"}
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {porciones.map((p) => {
        const pct = meta > 0 ? Math.round((p.minutos / meta) * 100) : 0;
        return (
          <li key={p.id}>
            <button
              type="button"
              disabled={p.esFaltante || !onSeleccionar}
              onClick={() => onSeleccionar?.(p.id)}
              className="flex w-full items-center gap-2.5 rounded-xl px-1 py-1 text-left disabled:opacity-100"
            >
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{
                  backgroundColor: p.color,
                  boxShadow: p.esFaltante ? "inset 0 0 0 2px rgba(0,0,0,0.08)" : undefined,
                }}
              />
              <span
                className={`flex-1 truncate text-[13px] ${
                  p.esFaltante ? "text-subtinta" : "font-semibold text-tinta"
                }`}
              >
                {p.esFaltante
                  ? idioma === "en"
                    ? "Remaining"
                    : "Faltan"
                  : p.nombre}
              </span>
              <span
                className={`shrink-0 text-[13px] tabular-nums ${
                  p.esFaltante ? "text-subtinta" : "font-bold text-tinta"
                }`}
              >
                {formatoHM(p.minutos, idioma)}
              </span>
              {meta > 0 && !p.esFaltante && (
                <span className="w-9 shrink-0 text-right text-[11px] font-semibold text-subtinta">
                  {pct}%
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
