import { useMemo } from "react";
import type { Config, Datos, Tema } from "../types";
import { aportaLabor, aportaVoluntariado } from "../types";
import { ESLOGAN } from "../version";
import {
  formatearFecha,
  formatearHoraHHMM,
  formatoHM,
} from "../lib/horas";
import {
  minutosDeRegistro,
  porciones,
  resumenActividades,
  totales,
} from "../lib/estadisticas";
import { colorLegible } from "../lib/colores";
import { BarraProgreso, BotonIcono, EstadoVacio, Tarjeta, TituloSeccion } from "./ui";
import { GraficaDona, Leyenda } from "./GraficaDona";
import { Icono } from "./iconos";
import { MarcaLogo } from "./Marca";
import { useT, useIdioma } from "../i18n";

export default function Inicio({
  datos,
  config,
  tema,
  onNuevaActividad,
  onNuevoRegistro,
  onAbrirActividad,
  onEditarMeta,
  onCambiarTema,
  onVerActividades,
}: {
  datos: Datos;
  config: Config;
  tema: Tema;
  onNuevaActividad: () => void;
  onNuevoRegistro: () => void;
  onAbrirActividad: (id: string) => void;
  onEditarMeta: (tipo: "voluntariado" | "labor") => void;
  onCambiarTema: () => void;
  onVerActividades: () => void;
}) {
  const t = useT();
  const idioma = useIdioma();
  const resumen = useMemo(() => totales(datos), [datos]);
  const filas = useMemo(() => resumenActividades(datos), [datos]);

  const graficaVol = useMemo(
    () => porciones(datos, "voluntariado", datos.metas.voluntariado, config.colorRestante),
    [datos, config.colorRestante]
  );
  const graficaLab = useMemo(
    () => porciones(datos, "labor", datos.metas.labor, config.colorRestante),
    [datos, config.colorRestante]
  );

  const vol = colorLegible(config.colorVol, tema);
  const lab = colorLegible(config.colorLab, tema);
  const pista = colorLegible(config.colorRestante, tema);

  const ultimos = useMemo(() => {
    const porId = new Map(datos.actividades.map((a) => [a.id, a]));
    return [...datos.registros]
      .sort((a, b) => (a.fecha === b.fecha ? b.creado.localeCompare(a.creado) : b.fecha.localeCompare(a.fecha)))
      .slice(0, 4)
      .map((r) => ({ registro: r, actividad: porId.get(r.actividadId) }))
      .filter((x) => x.actividad);
  }, [datos]);

  const pctVol =
    datos.metas.voluntariado > 0
      ? Math.min(100, Math.round((resumen.voluntariado / datos.metas.voluntariado) * 100))
      : 0;
  const pctLab =
    datos.metas.labor > 0
      ? Math.min(100, Math.round((resumen.labor / datos.metas.labor) * 100))
      : 0;

  return (
    <div className="animate-fade-in space-y-6">
      <header className="flex items-start justify-between gap-3 pt-1">
        <div className="flex items-center gap-2.5">
          <MarcaLogo className="h-11 w-11 text-tinta" />
          <div>
            <p className="text-[19px] font-black leading-none tracking-tight text-tinta">Kairós</p>
            <p className="mt-1 max-w-[190px] text-[10.5px] font-medium leading-tight text-subtinta">
              {t(ESLOGAN)}
            </p>
          </div>
        </div>
        <BotonIcono
          nombre={tema === "dark" ? "sol" : "luna"}
          onClick={onCambiarTema}
          label={t("Cambiar tema")}
        />
      </header>

      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={onNuevoRegistro}
          className="flex items-center justify-center gap-2 rounded-2xl bg-acc px-3 py-3 text-sm font-bold text-onacc shadow-sm active:scale-[0.98]"
        >
          <Icono nombre="reloj" className="h-4 w-4" />
          {t("Registrar horas")}
        </button>
        <button
          type="button"
          onClick={onNuevaActividad}
          className="flex items-center justify-center gap-2 rounded-2xl border-2 border-borde bg-card px-3 py-3 text-sm font-bold text-tinta active:scale-[0.98]"
        >
          <Icono nombre="mas" className="h-4 w-4" />
          {t("Nueva actividad")}
        </button>
      </div>

      <section className="space-y-2.5">
        <TituloSeccion
          accion={
            <button
              onClick={() => onEditarMeta("voluntariado")}
              className="text-xs font-bold text-acc"
            >
              {t("Editar meta")}
            </button>
          }
        >
          {t("Progreso")}
        </TituloSeccion>

        <Tarjeta className="overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: vol }} />
                <span className="text-sm font-bold text-tinta">{t("Voluntariado")}</span>
              </div>
              <button
                type="button"
                onClick={() => onEditarMeta("voluntariado")}
                className="rounded-full bg-soft px-2.5 py-1 text-[11px] font-bold text-subtinta active:scale-95"
              >
                {datos.metas.voluntariado > 0
                  ? `${t("Meta")}: ${formatoHM(datos.metas.voluntariado, idioma)}`
                  : t("Definir meta")}
              </button>
            </div>
            <div className="mt-1.5 flex items-end justify-between">
              <p className="text-[27px] font-black leading-none text-tinta">
                {formatoHM(resumen.voluntariado, idioma)}
              </p>
              <p className="text-sm font-extrabold" style={{ color: vol }}>
                {pctVol}%
              </p>
            </div>
            <div className="mt-2.5">
              <BarraProgreso valor={resumen.voluntariado} max={datos.metas.voluntariado} color={vol} />
            </div>
            <p className="mt-2 text-[11.5px] font-medium text-subtinta">
              {datos.metas.voluntariado === 0
                ? t("Sin meta definida todavía")
                : resumen.voluntariado >= datos.metas.voluntariado
                  ? t("¡Meta de voluntariado completada!")
                  : t("Faltan {n} para la meta", {
                      n: formatoHM(datos.metas.voluntariado - resumen.voluntariado, idioma),
                    })}
            </p>
          </div>
        </Tarjeta>

        <Tarjeta className="overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: lab }} />
                <span className="text-sm font-bold text-tinta">{t("Labor social")}</span>
              </div>
              <button
                type="button"
                onClick={() => onEditarMeta("labor")}
                className="rounded-full bg-soft px-2.5 py-1 text-[11px] font-bold text-subtinta active:scale-95"
              >
                {datos.metas.labor > 0
                  ? `${t("Meta")}: ${formatoHM(datos.metas.labor, idioma)}`
                  : t("Definir meta")}
              </button>
            </div>
            <div className="mt-1.5 flex items-end justify-between">
              <p className="text-[27px] font-black leading-none text-tinta">
                {formatoHM(resumen.labor, idioma)}
              </p>
              <p className="text-sm font-extrabold" style={{ color: lab }}>
                {pctLab}%
              </p>
            </div>
            <div className="mt-2.5">
              <BarraProgreso valor={resumen.labor} max={datos.metas.labor} color={lab} />
            </div>
            <p className="mt-2 text-[11.5px] font-medium text-subtinta">
              {datos.metas.labor === 0
                ? t("Sin meta definida todavía")
                : resumen.labor >= datos.metas.labor
                  ? t("¡Meta de labor social completada!")
                  : t("Faltan {n} para la meta", {
                      n: formatoHM(datos.metas.labor - resumen.labor, idioma),
                    })}
            </p>
          </div>
        </Tarjeta>
      </section>

      <section className="space-y-2.5">
        <TituloSeccion>{t("Resumen")}</TituloSeccion>

        <div className="grid gap-3 md:grid-cols-2">
          <Tarjeta className="p-4">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-sm font-bold text-tinta">{t("Voluntariado")}</h3>
              <span className="text-[11px] font-semibold text-subtinta">
                {datos.metas.voluntariado > 0
                  ? `${t("Meta")}: ${formatoHM(datos.metas.voluntariado, idioma)}`
                  : ""}
              </span>
            </div>
            <GraficaDona
              porciones={graficaVol.porciones}
              total={graficaVol.total}
              meta={graficaVol.meta}
              colorPista={pista}
              idioma={idioma}
              colorCentro={vol}
            />
            <div className="mt-2">
              <Leyenda
                porciones={graficaVol.porciones}
                meta={graficaVol.meta}
                idioma={idioma}
                onSeleccionar={onAbrirActividad}
              />
            </div>
          </Tarjeta>

          <Tarjeta className="p-4">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-sm font-bold text-tinta">{t("Labor social")}</h3>
              <span className="text-[11px] font-semibold text-subtinta">
                {datos.metas.labor > 0
                  ? `${t("Meta")}: ${formatoHM(datos.metas.labor, idioma)}`
                  : ""}
              </span>
            </div>
            <GraficaDona
              porciones={graficaLab.porciones}
              total={graficaLab.total}
              meta={graficaLab.meta}
              colorPista={pista}
              idioma={idioma}
              colorCentro={lab}
            />
            <div className="mt-2">
              <Leyenda
                porciones={graficaLab.porciones}
                meta={graficaLab.meta}
                idioma={idioma}
                onSeleccionar={onAbrirActividad}
              />
            </div>
          </Tarjeta>
        </div>
      </section>

      <section>
        <TituloSeccion
          accion={
            <button onClick={onVerActividades} className="text-xs font-bold text-acc">
              {t("Ver todas")}
            </button>
          }
        >
          {t("Por actividad")}
        </TituloSeccion>

        {filas.length === 0 ? (
          <EstadoVacio
            titulo={t("Aún no tienes actividades")}
            texto={t("Crea tu primera actividad para empezar a registrar horas.")}
          />
        ) : (
          <div className="space-y-2">
            {filas.map((f) => {
              const color = colorLegible(f.actividad.color, tema);
              const tipos: string[] = [];
              if (aportaVoluntariado(f.actividad.tipo)) tipos.push(t("Voluntariado"));
              if (aportaLabor(f.actividad.tipo)) tipos.push(t("Labor social"));
              return (
                <button
                  key={f.actividad.id}
                  type="button"
                  onClick={() => onAbrirActividad(f.actividad.id)}
                  className="flex w-full items-center gap-3 rounded-2xl border-2 border-borde bg-card p-3 text-left active:scale-[0.99]"
                >
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg"
                    style={{ backgroundColor: `${color}1f` }}
                  >
                    <span className="emoji">{f.actividad.icono}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-tinta">
                      {f.actividad.nombre}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] font-medium text-subtinta">
                      {tipos.join(" · ")} · {f.registros}{" "}
                      {f.registros === 1 ? t("registro") : t("registros")}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-sm font-extrabold text-tinta">
                      {formatoHM(f.minutos, idioma)}
                    </span>
                    <span
                      className="mt-1 block h-1.5 w-16 overflow-hidden rounded-full"
                      style={{ backgroundColor: `${color}26` }}
                    >
                      <span
                        className="block h-full rounded-full"
                        style={{
                          backgroundColor: color,
                          width:
                            resumen.totalGeneral > 0
                              ? `${Math.max(6, (f.minutos / resumen.totalGeneral) * 100)}%`
                              : "6%",
                        }}
                      />
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {ultimos.length > 0 && (
        <section>
          <TituloSeccion>{t("Últimos registros")}</TituloSeccion>
          <div className="space-y-2">
            {ultimos.map(({ registro, actividad }) => (
              <button
                key={registro.id}
                type="button"
                onClick={() => actividad && onAbrirActividad(actividad.id)}
                className="flex w-full items-center gap-3 rounded-2xl border-2 border-borde bg-card p-3 text-left active:scale-[0.99]"
              >
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-base"
                  style={{ backgroundColor: `${colorLegible(actividad!.color, tema)}1f` }}
                >
                  <span className="emoji">{actividad!.icono}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-bold text-tinta">
                    {actividad!.nombre}
                  </span>
                  <span className="block text-[11px] text-subtinta">
                    {formatearFecha(registro.fecha, idioma)} ·{" "}
                    {formatearHoraHHMM(registro.llegada, config.formatoHora, idioma)}–
                    {formatearHoraHHMM(registro.salida, config.formatoHora, idioma)}
                  </span>
                </span>
                <span className="shrink-0 text-[13px] font-extrabold text-tinta">
                  {formatoHM(minutosDeRegistro(registro), idioma)}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="grid grid-cols-3 gap-2">
        <Tarjeta className="p-3 text-center">
          <p className="text-[15px] font-black leading-tight text-tinta">
            {resumen.totalActividades}
          </p>
          <p className="mt-1 text-[9.5px] font-semibold uppercase tracking-wide text-subtinta">
            {t("Actividades")}
          </p>
        </Tarjeta>
        <Tarjeta className="p-3 text-center">
          <p className="text-[15px] font-black leading-tight text-tinta">
            {resumen.totalRegistros}
          </p>
          <p className="mt-1 text-[9.5px] font-semibold uppercase tracking-wide text-subtinta">
            {t("Registros")}
          </p>
        </Tarjeta>
        <Tarjeta className="p-3 text-center">
          <p className="text-[13px] font-black leading-tight text-tinta">
            {formatoHM(resumen.totalGeneral, idioma)}
          </p>
          <p className="mt-1 text-[9.5px] font-semibold uppercase tracking-wide text-subtinta">
            {t("Horas totales")}
          </p>
        </Tarjeta>
      </section>

      <p className="pb-2 text-center text-[10px] leading-relaxed text-subtinta/80">
        {t("Los minutos siempre se muestran entre 00 y 59.")}
      </p>
    </div>
  );
}
