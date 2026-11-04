import { useMemo, useState } from "react";
import type { Datos, Tema, TipoActividad } from "../types";
import { aportaLabor, aportaVoluntariado } from "../types";
import { formatearFecha, formatoHM } from "../lib/horas";
import { resumenActividades, totales } from "../lib/estadisticas";
import { colorLegible } from "../lib/colores";
import { Boton, Chip, EstadoVacio, Tarjeta } from "./ui";
import { Icono } from "./iconos";
import { useIdioma, useT } from "../i18n";

type Filtro = "todas" | TipoActividad;

export default function Actividades({
  datos,
  tema,
  onAbrirActividad,
  onNuevaActividad,
  onEditarActividad,
  onEliminarActividad,
}: {
  datos: Datos;
  tema: Tema;
  onAbrirActividad: (id: string) => void;
  onNuevaActividad: () => void;
  onEditarActividad: (id: string) => void;
  onEliminarActividad: (id: string) => void;
}) {
  const t = useT();
  const idioma = useIdioma();
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [busqueda, setBusqueda] = useState("");

  const filas = useMemo(() => resumenActividades(datos), [datos]);
  const total = useMemo(() => totales(datos), [datos]);

  const visibles = filas.filter((f) => {
    const coincideTipo =
      filtro === "todas"
        ? true
        : filtro === "ambos"
          ? f.actividad.tipo === "ambos"
          : f.actividad.tipo === filtro;
    const q = busqueda.trim().toLowerCase();
    const coincideTexto =
      !q ||
      f.actividad.nombre.toLowerCase().includes(q) ||
      f.actividad.lugar.toLowerCase().includes(q) ||
      f.actividad.descripcion.toLowerCase().includes(q);
    return coincideTipo && coincideTexto;
  });

  return (
    <div className="animate-fade-in space-y-4">
      <header className="flex items-end justify-between gap-3 pt-1">
        <div>
          <h1 className="text-2xl font-black leading-tight text-tinta">{t("Actividades")}</h1>
          <p className="text-xs font-medium text-subtinta">
            {filas.length} {filas.length === 1 ? t("actividad") : t("actividades")} ·{" "}
            {formatoHM(total.totalGeneral, idioma)}
          </p>
        </div>
        <Boton onClick={onNuevaActividad} icono="mas" className="px-3 py-2.5 text-[13px]">
          {t("Nueva")}
        </Boton>
      </header>

      <div className="relative">
        <Icono
          nombre="buscar"
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtinta"
        />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder={t("Buscar actividad o lugar…")}
          className="w-full rounded-2xl border-2 border-borde bg-card py-3 pl-10 pr-4 text-sm text-tinta outline-none placeholder:text-subtinta/60 focus:border-acc"
        />
      </div>

      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {(
          [
            { id: "todas", texto: t("Todas") },
            { id: "voluntariado", texto: t("Voluntariado") },
            { id: "labor", texto: t("Labor social") },
            { id: "ambos", texto: t("Ambos") },
          ] as { id: Filtro; texto: string }[]
        ).map((f) => (
          <Chip key={f.id} activo={filtro === f.id} onClick={() => setFiltro(f.id)}>
            {f.texto}
          </Chip>
        ))}
      </div>

      {visibles.length === 0 ? (
        <EstadoVacio
          icono="lista"
          titulo={filas.length === 0 ? t("Aún no hay actividades") : t("Sin resultados")}
          texto={
            filas.length === 0
              ? t("Crea una actividad como Ecomural o Reciclaje y agrégale tus horas.")
              : t("Prueba con otro filtro o cambia la búsqueda.")
          }
          accion={
            filas.length === 0 ? (
              <Boton onClick={onNuevaActividad} icono="mas">
                {t("Nueva actividad")}
              </Boton>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-2.5">
          {visibles.map((f) => {
            const color = colorLegible(f.actividad.color, tema);
            const partes: string[] = [];
            if (aportaVoluntariado(f.actividad.tipo)) partes.push(t("Voluntariado"));
            if (aportaLabor(f.actividad.tipo)) partes.push(t("Labor social"));
            return (
              <Tarjeta key={f.actividad.id} className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => onAbrirActividad(f.actividad.id)}
                  className="flex w-full items-start gap-3 p-4 text-left active:bg-soft/40"
                >
                  <span
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-xl"
                    style={{ backgroundColor: `${color}1f` }}
                  >
                    <span className="emoji">{f.actividad.icono}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-[15px] font-extrabold leading-snug text-tinta">
                      {f.actividad.nombre}
                    </span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-semibold text-subtinta">
                      <span style={{ color }}>{partes.join(" · ")}</span>
                      <span className="text-subtinta/60">•</span>
                      <span>
                        {f.registros} {f.registros === 1 ? t("registro") : t("registros")}
                      </span>
                      {f.ultimaFecha && (
                        <>
                          <span className="text-subtinta/60">•</span>
                          <span>{formatearFecha(f.ultimaFecha, idioma)}</span>
                        </>
                      )}
                    </span>
                    {f.actividad.lugar && (
                      <span className="mt-1 flex items-center gap-1 text-[11px] text-subtinta">
                        <Icono nombre="meta" className="h-3 w-3" />
                        {f.actividad.lugar}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-[15px] font-black leading-tight text-tinta">
                      {formatoHM(f.minutos, idioma)}
                    </span>
                    <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-wide text-subtinta">
                      {t("total")}
                    </span>
                  </span>
                </button>
                <div className="flex items-center justify-end gap-1.5 border-t border-borde/70 px-3 py-1.5">
                  <button
                    type="button"
                    onClick={() => onEditarActividad(f.actividad.id)}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-subtinta active:bg-soft"
                  >
                    <Icono nombre="lapiz" className="h-3.5 w-3.5" />
                    {t("Editar")}
                  </button>
                  <button
                    type="button"
                    onClick={() => onEliminarActividad(f.actividad.id)}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-red-500 active:bg-red-500/10"
                  >
                    <Icono nombre="basura" className="h-3.5 w-3.5" />
                    {t("Eliminar")}
                  </button>
                </div>
              </Tarjeta>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={onNuevaActividad}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-borde bg-card px-4 py-3 text-sm font-bold text-subtinta active:scale-[0.99]"
      >
        <Icono nombre="mas" className="h-4 w-4" />
        {t("Añadir otra actividad")}
      </button>
    </div>
  );
}
