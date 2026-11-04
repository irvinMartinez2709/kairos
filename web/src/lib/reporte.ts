import type { Actividad, Config, Datos, Idioma, Tema } from "../types";
import { aportaLabor, aportaVoluntariado } from "../types";
import { fechaLocal, formatearHoraHHMM, formatoHM } from "./horas";
import { minutosDeRegistro, resumenActividades, totales } from "./estadisticas";

function esc(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pct(parte: number, total: number): string {
  if (total <= 0) return "—";
  return `${Math.round((parte / total) * 100)}%`;
}

/** "2026-10-14" -> "14 de octubre de 2026" / "October 14, 2026" */
function fechaLarga(iso: string, idioma: Idioma): string {
  const d = fechaLocal(iso);
  if (!d) return iso;
  return d.toLocaleDateString(idioma === "en" ? "en-US" : "es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const TEXTOS = {
  es: {
    titulo: "Reporte de horas",
    voluntariado: "Voluntariado",
    labor: "Labor social",
    meta: "Meta",
    sinMeta: "Sin meta",
    actividad: "Actividad",
    lugar: "Lugar",
    registros: "Registros",
    horas: "Horas",
    sinActividades: "Sin actividades registradas.",
    detalle: "Detalle de registros",
    fecha: "Fecha",
    llegada: "Llegada",
    salida: "Salida",
    duracion: "Duración",
    notas: "Notas",
    sinRegistros: "Todavía no hay registros.",
    totalGeneral: "Total general registrado",
    actividades: "Actividades",
    lema: "Aprovecha el momento, transforma tu entorno.",
    generado: "Generado el",
    imprimir: "Usa “Guardar como PDF” en el diálogo de impresión.",
  },
  en: {
    titulo: "Hours report",
    voluntariado: "Volunteering",
    labor: "Community service",
    meta: "Goal",
    sinMeta: "No goal",
    actividad: "Activity",
    lugar: "Place",
    registros: "Entries",
    horas: "Hours",
    sinActividades: "No activities recorded.",
    detalle: "Entry details",
    fecha: "Date",
    llegada: "Start",
    salida: "End",
    duracion: "Duration",
    notas: "Notes",
    sinRegistros: "No entries yet.",
    totalGeneral: "Total recorded",
    actividades: "Activities",
    lema: "Seize the moment, transform your surroundings.",
    generado: "Generated on",
    imprimir: "Use “Save as PDF” in the print dialog.",
  },
};

export function generarReporte({
  datos,
  config,
  idioma,
}: {
  datos: Datos;
  config: Config;
  tema: Tema;
  idioma: Idioma;
}): string {
  const t = TEXTOS[idioma] || TEXTOS.es;
  const resumen = totales(datos);
  const filas = resumenActividades(datos);
  const hoy = new Date().toLocaleDateString(idioma === "en" ? "en-US" : "es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const actividades: Actividad[] = datos.actividades;
  const porActividad = new Map(filas.map((f) => [f.actividad.id, f]));

  const filasVol = actividades.filter((a) => aportaVoluntariado(a.tipo));
  const filasLab = actividades.filter((a) => aportaLabor(a.tipo));

  const detalleMeta = (registrado: number, meta: number) =>
    meta > 0
      ? `${t.meta}: ${formatoHM(meta, idioma)} · ${pct(registrado, meta)}`
      : t.sinMeta;

  const tablaActividades = (lista: Actividad[]) => {
    if (lista.length === 0) {
      return `<p class="vacio">${t.sinActividades}</p>`;
    }
    const cuerpo = lista
      .map((a) => {
        const f = porActividad.get(a.id);
        return `<tr>
          <td><span class="punto" style="background:${a.color}"></span>${esc(a.nombre)}</td>
          <td class="c">${esc(a.lugar || "—")}</td>
          <td class="c">${f ? f.registros : 0}</td>
          <td class="d">${formatoHM(f ? f.minutos : 0, idioma)}</td>
        </tr>`;
      })
      .join("");
    return `<table>
      <thead><tr><th>${t.actividad}</th><th class="c">${t.lugar}</th><th class="c">${t.registros}</th><th class="d">${t.horas}</th></tr></thead>
      <tbody>${cuerpo}</tbody>
    </table>`;
  };

  const registrosOrdenados = [...datos.registros].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const mapaAct = new Map(actividades.map((a) => [a.id, a]));

  const filasDetalle = registrosOrdenados
    .map((r) => {
      const a = mapaAct.get(r.actividadId);
      return `<tr>
        <td class="c fecha">${fechaLarga(r.fecha, idioma)}</td>
        <td>${esc(a ? a.nombre : "—")}</td>
        <td class="c">${formatearHoraHHMM(r.llegada, config.formatoHora, idioma)}</td>
        <td class="c">${formatearHoraHHMM(r.salida, config.formatoHora, idioma)}</td>
        <td class="d">${formatoHM(minutosDeRegistro(r), idioma)}</td>
        <td class="nota">${esc(r.notas || "")}</td>
      </tr>`;
    })
    .join("");

  return `<!doctype html>
<html lang="${idioma}">
<head>
<meta charset="utf-8" />
<title>Kairós — ${t.titulo}</title>
<style>
  @page { size: A4; margin: 14mm; }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1b2a3a;
    margin: 0;
    font-size: 10.5pt;
    line-height: 1.45;
  }
  .marca { display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 3px solid #123C63; padding-bottom: 10px; }
  .marca h1 { margin: 0; font-size: 24pt; letter-spacing: -0.5px; color: #123C63; }
  .marca .lema { margin: 2px 0 0; font-size: 8.5pt; color: #6b7c90; letter-spacing: 0.2px; }
  .marca .meta { text-align: right; font-size: 8.5pt; color: #6b7c90; }
  .marca .meta strong { display: block; font-size: 12pt; color: #123C63; }
  h2 { font-size: 11pt; text-transform: uppercase; letter-spacing: 1px; color: #123C63; margin: 18px 0 6px; }
  .resumen { display: flex; gap: 10px; margin-top: 14px; }
  .caja { flex: 1; border: 1px solid #dfe7f0; border-radius: 10px; padding: 10px 12px; background: #f7fafd; }
  .caja .etiqueta { font-size: 8pt; text-transform: uppercase; letter-spacing: 0.8px; color: #6b7c90; }
  .caja .valor { font-size: 16pt; font-weight: 800; color: #123C63; margin: 2px 0; }
  .caja .detalle { font-size: 8.5pt; color: #6b7c90; }
  .barra { height: 6px; border-radius: 4px; background: #e3ebf3; margin-top: 6px; overflow: hidden; }
  .barra span { display: block; height: 100%; border-radius: 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 4px; }
  th { background: #123C63; color: #fff; font-size: 8.5pt; text-align: left; padding: 6px 8px; font-weight: 600; }
  td { border-bottom: 1px solid #e6edf4; padding: 5px 8px; font-size: 9pt; vertical-align: top; }
  tbody tr:nth-child(even) td { background: #f6f9fc; }
  .c { text-align: center; }
  .fecha { white-space: nowrap; }
  .d { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
  .nota { color: #5a6b80; font-size: 8.2pt; }
  .punto { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; }
  .vacio { color: #8494a6; font-style: italic; font-size: 9pt; }
  .pie { margin-top: 20px; border-top: 1px solid #dfe7f0; padding-top: 8px; font-size: 8pt; color: #8494a6; display: flex; justify-content: space-between; }
  .nota-final { margin-top: 10px; font-size: 8pt; color: #8494a6; }
  @media print { .no-imprimir { display: none; } }
</style>
</head>
<body>
  <div class="marca">
    <div>
      <h1>Kairós</h1>
      <p class="lema">${t.lema}</p>
    </div>
    <div class="meta">
      <strong>${t.titulo}</strong>
      ${esc(hoy)}
    </div>
  </div>

  <div class="resumen">
    <div class="caja">
      <div class="etiqueta">${t.voluntariado}</div>
      <div class="valor">${formatoHM(resumen.voluntariado, idioma)}</div>
      <div class="detalle">${detalleMeta(resumen.voluntariado, datos.metas.voluntariado)}</div>
      <div class="barra"><span style="width:${datos.metas.voluntariado > 0 ? Math.min(100, (resumen.voluntariado / datos.metas.voluntariado) * 100) : 0}%;background:${config.colorVol}"></span></div>
    </div>
    <div class="caja">
      <div class="etiqueta">${t.labor}</div>
      <div class="valor">${formatoHM(resumen.labor, idioma)}</div>
      <div class="detalle">${detalleMeta(resumen.labor, datos.metas.labor)}</div>
      <div class="barra"><span style="width:${datos.metas.labor > 0 ? Math.min(100, (resumen.labor / datos.metas.labor) * 100) : 0}%;background:${config.colorLab}"></span></div>
    </div>
  </div>

  <h2>${t.voluntariado}</h2>
  ${tablaActividades(filasVol)}

  <h2>${t.labor}</h2>
  ${tablaActividades(filasLab)}

  <h2>${t.detalle} (${datos.registros.length})</h2>
  ${
    datos.registros.length === 0
      ? `<p class="vacio">${t.sinRegistros}</p>`
      : `<table>
    <thead><tr><th class="c">${t.fecha}</th><th>${t.actividad}</th><th class="c">${t.llegada}</th><th class="c">${t.salida}</th><th class="d">${t.duracion}</th><th>${t.notas}</th></tr></thead>
    <tbody>${filasDetalle}</tbody>
  </table>`
  }

  <p class="nota-final">${t.totalGeneral}: <strong>${formatoHM(
    resumen.totalGeneral,
    idioma
  )}</strong> · ${t.registros}: ${resumen.totalRegistros} · ${t.actividades}: ${resumen.totalActividades}.</p>

  <div class="pie">
    <span>Kairós · ${t.lema}</span>
    <span>${t.generado} ${esc(hoy)}</span>
  </div>
  <div class="no-imprimir" style="margin-top:16px;text-align:center;color:#8494a6;font-size:9pt">
    ${t.imprimir}
  </div>
  <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 350); };</script>
</body>
</html>`;
}

export function abrirReporte(opciones: {
  datos: Datos;
  config: Config;
  tema: Tema;
  idioma: Idioma;
}): void {
  const html = generarReporte(opciones);
  const ventana = window.open("", "_blank");
  if (!ventana) return;
  ventana.document.open();
  ventana.document.write(html);
  ventana.document.close();
}
