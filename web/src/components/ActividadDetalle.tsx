import { useMemo, useState } from "react";
import type { Actividad, Config, Datos, Registro, Tema } from "../types";
import { aportaLabor, aportaVoluntariado } from "../types";
import {
  formatearFecha,
  formatearHoraHHMM,
  formatoHM,
} from "../lib/horas";
import { minutosDeRegistro } from "../lib/estadisticas";
import { colorLegible } from "../lib/colores";
import { Boton, EstadoVacio, Tarjeta } from "./ui";
import { Icono } from "./iconos";
import { FotoMiniatura, VisorFotos } from "./Foto";
import { useIdioma, useT } from "../i18n";

export default function ActividadDetalle({
  datos,
  actividad,
  config,
  tema,
  onVolver,
  onEditarActividad,
  onEliminarActividad,
  onNuevoRegistro,
  onEditarRegistro,
  onEliminarRegistro,
}: {
  datos: Datos;
  actividad: Actividad;
  config: Config;
  tema: Tema;
  onVolver: () => void;
  onEditarActividad: () => void;
  onEliminarActividad: () => void;
  onNuevoRegistro: () => void;
  onEditarRegistro: (registro: Registro) => void;
  onEliminarRegistro: (registro: Registro) => void;
}) {
  const t = useT();
  const idioma = useIdioma();
  const color = colorLegible(actividad.color, tema);
  const [visor, setVisor] = useState<{ ids: string[]; indice: number } | null>(null);

  const registros = useMemo(
    () =>
      datos.registros
        .filter((r) => r.actividadId === actividad.id)
        .sort((a, b) =>
          a.fecha === b.fecha ? b.creado.localeCompare(a.creado) : b.fecha.localeCompare(a.fecha)
        ),
    [datos.registros, actividad.id]
  );

  const totalMin = registros.reduce((acc, r) => acc + minutosDeRegistro(r), 0);
  const promedio = registros.length > 0 ? Math.round(totalMin / registros.length) : 0;
  const fotos = registros.reduce((acc, r) => acc + r.fotos.length, 0);
  const primera = registros.length > 0 ? registros[registros.length - 1].fecha : "";
  const ultima = registros.length > 0 ? registros[0].fecha : "";

  const partes: string[] = [];
  if (aportaVoluntariado(actividad.tipo)) partes.push(t("Voluntariado"));
  if (aportaLabor(actividad.tipo)) partes.push(t("Labor social"));

  return (
    <div className="animate-fade-in space-y-4">
      <header className="sticky top-0 z-20 -mx-4 flex items-center gap-2 bg-fondo/95 px-4 py-2 backdrop-blur">
        <button
          type="button"
          onClick={onVolver}
          aria-label={t("Volver")}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-borde bg-card text-subtinta active:scale-95"
        >
          <Icono nombre="atras" className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-extrabold leading-tight text-tinta">
            {actividad.nombre}
          </p>
          <p className="truncate text-[11px] font-semibold text-subtinta">{partes.join(" · ")}</p>
        </div>
        <button
          type="button"
          onClick={onEditarActividad}
          aria-label={t("Editar")}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-borde bg-card text-subtinta active:scale-95"
        >
          <Icono nombre="lapiz" className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onEliminarActividad}
          aria-label={t("Eliminar")}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-red-200 bg-red-50 text-red-500 active:scale-95 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
        >
          <Icono nombre="basura" className="h-4 w-4" />
        </button>
      </header>

      <Tarjeta className="overflow-hidden">
        <div className="h-2 w-full" style={{ backgroundColor: color }} />
        <div className="p-4">
          <div className="flex items-start gap-3">
            <span
              className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-2xl"
              style={{ backgroundColor: `${color}1f` }}
            >
              <span className="emoji">{actividad.icono}</span>
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-black leading-tight text-tinta">{actividad.nombre}</h1>
              {actividad.lugar && (
                <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-subtinta">
                  <Icono nombre="meta" className="h-3 w-3" />
                  {actividad.lugar}
                </p>
              )}
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {partes.map((p) => (
                  <span
                    key={p}
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ backgroundColor: `${color}1f`, color }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {actividad.descripcion && (
            <p className="mt-3 text-[12.5px] leading-relaxed text-subtinta">
              {actividad.descripcion}
            </p>
          )}

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-soft px-2 py-2.5 text-center">
              <p className="text-base font-black leading-tight text-tinta">
                {formatoHM(totalMin, idioma)}
              </p>
              <p className="text-[9.5px] font-bold uppercase tracking-wide text-subtinta">
                {t("Total")}
              </p>
            </div>
            <div className="rounded-2xl bg-soft px-2 py-2.5 text-center">
              <p className="text-base font-black leading-tight text-tinta">{registros.length}</p>
              <p className="text-[9.5px] font-bold uppercase tracking-wide text-subtinta">
                {t("Registros")}
              </p>
            </div>
            <div className="rounded-2xl bg-soft px-2 py-2.5 text-center">
              <p className="text-base font-black leading-tight text-tinta">
                {formatoHM(promedio, idioma)}
              </p>
              <p className="text-[9.5px] font-bold uppercase tracking-wide text-subtinta">
                {t("Promedio")}
              </p>
            </div>
          </div>

          {primera && (
            <p className="mt-3 text-center text-[10.5px] font-medium text-subtinta">
              {formatearFecha(primera, idioma)} — {formatearFecha(ultima, idioma)}
              {fotos > 0 && ` · ${fotos} ${fotos === 1 ? t("foto") : t("fotos")}`}
            </p>
          )}
        </div>
      </Tarjeta>

      <div className="flex gap-2">
        <Boton onClick={onNuevoRegistro} icono="mas" className="flex-1">
          {t("Registrar horas")}
        </Boton>
      </div>

      <section>
        <div className="mb-2 flex items-end justify-between">
          <h2 className="text-[15px] font-extrabold uppercase tracking-wide text-subtinta">
            {t("Registros")}
          </h2>
          <span className="text-[11px] font-semibold text-subtinta">
            {formatoHM(totalMin, idioma)}
          </span>
        </div>

        {registros.length === 0 ? (
          <EstadoVacio
            icono="reloj"
            titulo={t("Sin registros todavía")}
            texto={t("Agrega tu primera sesión de esta actividad.")}
            accion={
              <Boton onClick={onNuevoRegistro} icono="mas">
                {t("Registrar horas")}
              </Boton>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {registros.map((r) => (
              <Tarjeta key={r.id} className="p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-extrabold text-tinta">
                      {formatearFecha(r.fecha, idioma)}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-subtinta">
                      <Icono nombre="reloj" className="h-3 w-3" />
                      {formatearHoraHHMM(r.llegada, config.formatoHora, idioma)} –{" "}
                      {formatearHoraHHMM(r.salida, config.formatoHora, idioma)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black" style={{ color }}>
                      {formatoHM(minutosDeRegistro(r), idioma)}
                    </p>
                    <div className="mt-1 flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEditarRegistro(r)}
                        aria-label={t("Editar")}
                        className="grid h-7 w-7 place-items-center rounded-lg bg-soft text-subtinta active:scale-95"
                      >
                        <Icono nombre="lapiz" className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEliminarRegistro(r)}
                        aria-label={t("Eliminar")}
                        className="grid h-7 w-7 place-items-center rounded-lg bg-red-500/10 text-red-500 active:scale-95"
                      >
                        <Icono nombre="basura" className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {r.notas && (
                  <p className="mt-2 whitespace-pre-line rounded-xl bg-soft px-3 py-2 text-[11.5px] leading-relaxed text-subtinta">
                    {r.notas}
                  </p>
                )}

                {r.fotos.length > 0 && (
                  <div className="mt-2 flex gap-1.5">
                    {r.fotos.slice(0, 4).map((f, i) => (
                      <FotoMiniatura
                        key={f}
                        id={f}
                        className="h-14 w-14"
                        onClick={() => setVisor({ ids: r.fotos, indice: i })}
                      />
                    ))}
                    {r.fotos.length > 4 && (
                      <button
                        type="button"
                        onClick={() => setVisor({ ids: r.fotos, indice: 4 })}
                        className="grid h-14 w-14 place-items-center rounded-xl border-2 border-borde bg-soft text-xs font-bold text-subtinta"
                      >
                        +{r.fotos.length - 4}
                      </button>
                    )}
                  </div>
                )}
              </Tarjeta>
            ))}
          </div>
        )}
      </section>

      {visor && (
        <VisorFotos ids={visor.ids} indice={visor.indice} onCerrar={() => setVisor(null)} />
      )}
    </div>
  );
}
