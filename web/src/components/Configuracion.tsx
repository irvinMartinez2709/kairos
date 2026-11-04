import { useRef } from "react";
import type { Config, Datos, Idioma, Tema } from "../types";
import { COLOR_PRESETS } from "../types";
import { COLORES_ACTIVIDAD } from "../types";
import { formatoHM } from "../lib/horas";
import { avisar, Boton, Interruptor, Segmentado, Tarjeta } from "./ui";
import { Icono, type NombreIcono } from "./iconos";
import { NOMBRE_APP, VERSION, VERSION_CODE } from "../version";
import { useT } from "../i18n";

function Fila({
  icono,
  titulo,
  detalle,
  onClick,
  color,
}: {
  icono: NombreIcono;
  titulo: string;
  detalle?: string;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl px-1 py-2.5 text-left active:bg-soft/60"
    >
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
        style={{ backgroundColor: color ? `${color}1f` : undefined, color: color || undefined }}
      >
        <Icono nombre={icono} className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-tinta">{titulo}</span>
        {detalle && <span className="block truncate text-[11px] text-subtinta">{detalle}</span>}
      </span>
      <Icono nombre="flecha" className="h-4 w-4 shrink-0 text-subtinta/70" />
    </button>
  );
}

function ColorCampo({
  valor,
  onChange,
  label,
}: {
  valor: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-2xl bg-soft px-3 py-2.5">
      <span className="text-[13px] font-semibold text-tinta">{label}</span>
      <span className="relative h-8 w-14 overflow-hidden rounded-lg border-2 border-borde">
        <span className="absolute inset-0" style={{ backgroundColor: valor }} />
        <input
          type="color"
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </span>
    </label>
  );
}

export default function Configuracion({
  datos,
  config,
  tema,
  onConfig,
  onTema,
  onEditarMeta,
  onExportar,
  onImportar,
  onReporte,
  onBorrarTodo,
  onCargarEjemplo,
  onAyuda,
  onAcerca,
}: {
  datos: Datos;
  config: Config;
  tema: Tema;
  onConfig: (cambios: Partial<Config>) => void;
  onTema: () => void;
  onEditarMeta: (tipo: "voluntariado" | "labor") => void;
  onExportar: () => void;
  onImportar: (texto: string) => void;
  onReporte: () => void;
  onBorrarTodo: () => void;
  onCargarEjemplo: () => void;
  onAyuda: () => void;
  onAcerca: () => void;
}) {
  const t = useT();
  const entradaImportar = useRef<HTMLInputElement>(null);

  async function activarNotificaciones(activo: boolean) {
    if (!activo) {
      onConfig({ notificaciones: false });
      return;
    }
    if (typeof Notification === "undefined") {
      avisar(t("Este dispositivo no admite notificaciones"), "error");
      return;
    }
    const permiso = await Notification.requestPermission();
    if (permiso !== "granted") {
      avisar(t("Permiso de notificaciones denegado"), "error");
      onConfig({ notificaciones: false });
      return;
    }
    onConfig({ notificaciones: true });
    avisar(t("Recordatorio activado"));
  }

  function probarNotificacion() {
    if (typeof Notification === "undefined") {
      avisar(t("Este dispositivo no admite notificaciones"), "error");
      return;
    }
    if (Notification.permission !== "granted") {
      avisar(t("Primero activa los recordatorios"), "error");
      return;
    }
    new Notification(NOMBRE_APP, {
      body: t("Recuerda registrar tus horas de hoy."),
      icon: "./icono-192.png",
    });
  }

  return (
    <div className="animate-fade-in space-y-5">
      <header className="pt-1">
        <h1 className="text-2xl font-black leading-tight text-tinta">{t("Ajustes")}</h1>
        <p className="text-xs font-medium text-subtinta">{t("Personaliza Kairós a tu manera")}</p>
      </header>

      <section>
        <h2 className="mb-2 text-[13px] font-extrabold uppercase tracking-wide text-subtinta">
          {t("Metas de horas")}
        </h2>
        <Tarjeta className="divide-y divide-borde/70 px-3">
          <div className="flex items-center justify-between gap-3 py-3">
            <div>
              <p className="text-sm font-bold text-tinta">{t("Voluntariado")}</p>
              <p className="text-[11px] text-subtinta">
                {datos.metas.voluntariado > 0
                  ? formatoHM(datos.metas.voluntariado)
                  : t("Sin meta definida")}
              </p>
            </div>
            <Boton variante="suave" className="px-3 py-2 text-[12px]" onClick={() => onEditarMeta("voluntariado")}>
              {t("Editar")}
            </Boton>
          </div>
          <div className="flex items-center justify-between gap-3 py-3">
            <div>
              <p className="text-sm font-bold text-tinta">{t("Labor social")}</p>
              <p className="text-[11px] text-subtinta">
                {datos.metas.labor > 0 ? formatoHM(datos.metas.labor) : t("Sin meta definida")}
              </p>
            </div>
            <Boton variante="suave" className="px-3 py-2 text-[12px]" onClick={() => onEditarMeta("labor")}>
              {t("Editar")}
            </Boton>
          </div>
        </Tarjeta>
        <p className="mt-1.5 px-1 text-[11px] leading-relaxed text-subtinta">
          {t(
            "Las actividades marcadas como «Ambos» suman sus horas a las dos metas al mismo tiempo."
          )}
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-[13px] font-extrabold uppercase tracking-wide text-subtinta">
          {t("Apariencia")}
        </h2>
        <Tarjeta className="space-y-4 p-4">
          <div>
            <p className="mb-1.5 text-[13px] font-semibold text-subtinta">{t("Tema")}</p>
            <Segmentado
              valor={tema}
              onChange={(v) => {
                if (v !== tema) onTema();
              }}
              opciones={[
                { id: "light" as Tema, texto: t("Claro") },
                { id: "dark" as Tema, texto: t("Oscuro") },
              ]}
            />
          </div>

          <div>
            <p className="mb-1.5 text-[13px] font-semibold text-subtinta">{t("Color de la app")}</p>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onConfig({ color: p.id })}
                  aria-label={p.nombre}
                  title={p.nombre}
                  className={`h-9 w-9 rounded-full border-[3px] transition active:scale-90 ${
                    config.color === p.id ? "border-tinta" : "border-transparent"
                  }`}
                  style={{ backgroundColor: tema === "dark" ? p.dark : p.light }}
                />
              ))}
              <label
                className="relative grid h-9 w-9 cursor-pointer place-items-center rounded-full border-[3px] border-dashed border-borde text-sm font-bold text-subtinta"
                title={t("Color personalizado")}
              >
                +
                <input
                  type="color"
                  value={config.color.startsWith("#") ? config.color : "#123C63"}
                  onChange={(e) => onConfig({ color: e.target.value })}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              </label>
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[13px] font-semibold text-subtinta">{t("Emojis")}</p>
            <Segmentado
              valor={config.emojis}
              onChange={(v) => onConfig({ emojis: v })}
              opciones={[
                { id: "color" as const, texto: t("Color") },
                { id: "mono" as const, texto: t("Grises") },
                { id: "ninguno" as const, texto: t("Ocultos") },
              ]}
            />
          </div>

          <div>
            <p className="mb-1.5 text-[13px] font-semibold text-subtinta">{t("Formato de hora")}</p>
            <Segmentado
              valor={config.formatoHora}
              onChange={(v) => onConfig({ formatoHora: v })}
              opciones={[
                { id: "12" as const, texto: "12 h" },
                { id: "24" as const, texto: "24 h" },
              ]}
            />
          </div>

          <div>
            <p className="mb-1.5 text-[13px] font-semibold text-subtinta">{t("Idioma")}</p>
            <Segmentado
              valor={config.idioma}
              onChange={(v) => onConfig({ idioma: v as Idioma })}
              opciones={[
                { id: "es" as const, texto: "Español" },
                { id: "en" as const, texto: "English" },
              ]}
            />
          </div>
        </Tarjeta>
      </section>

      <section>
        <h2 className="mb-2 text-[13px] font-extrabold uppercase tracking-wide text-subtinta">
          {t("Colores de las gráficas")}
        </h2>
        <Tarjeta className="space-y-2 p-3">
          <ColorCampo
            label={t("Voluntariado")}
            valor={config.colorVol}
            onChange={(v) => onConfig({ colorVol: v })}
          />
          <ColorCampo
            label={t("Labor social")}
            valor={config.colorLab}
            onChange={(v) => onConfig({ colorLab: v })}
          />
          <ColorCampo
            label={t("Horas faltantes")}
            valor={config.colorRestante}
            onChange={(v) => onConfig({ colorRestante: v })}
          />
          <p className="px-1 text-[11px] leading-relaxed text-subtinta">
            {t("Cada actividad conserva su propio color en la gráfica de pastel.")}
          </p>
          <div className="flex flex-wrap gap-1.5 px-1 pt-1">
            {COLORES_ACTIVIDAD.slice(0, 6).map((c) => (
              <span
                key={c}
                className="h-2.5 w-6 rounded-full"
                style={{ backgroundColor: c }}
                aria-hidden="true"
              />
            ))}
          </div>
        </Tarjeta>
      </section>

      <section>
        <h2 className="mb-2 text-[13px] font-extrabold uppercase tracking-wide text-subtinta">
          {t("Recordatorios")}
        </h2>
        <Tarjeta className="p-4">
          <Interruptor
            activo={config.notificaciones}
            onChange={(v) => void activarNotificaciones(v)}
            label={t("Recordatorio diario")}
            detalle={t("Avisa si aún no registras horas en el día.")}
          />
          {config.notificaciones && (
            <div className="mt-3 space-y-2">
              <label className="flex items-center justify-between rounded-2xl bg-soft px-3 py-2.5">
                <span className="text-[13px] font-semibold text-tinta">{t("Hora del aviso")}</span>
                <input
                  type="time"
                  value={config.horaRecordatorio}
                  onChange={(e) => onConfig({ horaRecordatorio: e.target.value })}
                  className="rounded-lg border-2 border-borde bg-card px-2 py-1 text-sm font-bold text-tinta outline-none focus:border-acc"
                />
              </label>
              <button
                type="button"
                onClick={probarNotificacion}
                className="w-full rounded-xl bg-acc-suave px-3 py-2 text-[12px] font-bold text-acc"
              >
                {t("Probar notificación")}
              </button>
            </div>
          )}
          <p className="mt-2 text-[10.5px] leading-relaxed text-subtinta">
            {t("El aviso se muestra mientras la app está abierta en el dispositivo.")}
          </p>
        </Tarjeta>
      </section>

      <section>
        <h2 className="mb-2 text-[13px] font-extrabold uppercase tracking-wide text-subtinta">
          {t("Datos y respaldo")}
        </h2>
        <Tarjeta className="divide-y divide-borde/70 px-3">
          <Fila
            icono="descargar"
            titulo={t("Exportar respaldo")}
            detalle={t("Archivo JSON con actividades, horas y fotos")}
            onClick={onExportar}
          />
          <Fila
            icono="subir"
            titulo={t("Importar respaldo")}
            detalle={t("Restaura un archivo exportado antes")}
            onClick={() => entradaImportar.current?.click()}
          />
          <Fila
            icono="grafica"
            titulo={t("Generar reporte PDF")}
            detalle={t("Resumen y detalle listo para imprimir")}
            onClick={onReporte}
          />
          <Fila
            icono="lista"
            titulo={t("Cargar actividad de ejemplo")}
            detalle={t("Agrega de nuevo Ecomural los milagros de Jesús")}
            onClick={onCargarEjemplo}
          />
          <Fila
            icono="basura"
            titulo={t("Borrar todos los datos")}
            detalle={t("No se puede deshacer")}
            onClick={onBorrarTodo}
            color="#DC2626"
          />
        </Tarjeta>
        <input
          ref={entradaImportar}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const archivo = e.target.files?.[0];
            if (!archivo) return;
            const lector = new FileReader();
            lector.onload = () => {
              onImportar(String(lector.result || ""));
              if (entradaImportar.current) entradaImportar.current.value = "";
            };
            lector.onerror = () => avisar(t("No se pudo leer el archivo"), "error");
            lector.readAsText(archivo);
          }}
        />
      </section>

      <section>
        <h2 className="mb-2 text-[13px] font-extrabold uppercase tracking-wide text-subtinta">
          {t("Información")}
        </h2>
        <Tarjeta className="divide-y divide-borde/70 px-3">
          <Fila icono="ayuda" titulo={t("Ayuda y preguntas frecuentes")} onClick={onAyuda} />
          <Fila icono="info" titulo={t("Acerca de Kairós")} detalle={`v${VERSION}`} onClick={onAcerca} />
        </Tarjeta>
      </section>

      <p className="pb-2 text-center text-[10px] text-subtinta/70">
        Kairós v{VERSION} · build {VERSION_CODE}
      </p>
    </div>
  );
}
