import type { Actividad, Config, Datos, Idioma, Tema } from "../types";
import { aportaLabor, aportaVoluntariado } from "../types";
import { fechaLocal, formatearHoraHHMM, formatoHM } from "./horas";
import { minutosDeRegistro, resumenActividades, totales } from "./estadisticas";
import { hexARgb } from "./colores";
import type { jsPDF } from "jspdf";

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

export const TEXTOS = {
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
        <td class="c hora">${formatearHoraHHMM(r.llegada, config.formatoHora, idioma)}</td>
        <td class="c hora">${formatearHoraHHMM(r.salida, config.formatoHora, idioma)}</td>        <td class="d">${formatoHM(minutosDeRegistro(r), idioma)}</td>
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
    padding: 16px;
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
  .hora { white-space: nowrap; }
  .d { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
  .nota { color: #5a6b80; font-size: 8.2pt; overflow-wrap: anywhere; }
  .punto { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; }
  .vacio { color: #8494a6; font-style: italic; font-size: 9pt; }
  .pie { margin-top: 20px; border-top: 1px solid #dfe7f0; padding-top: 8px; font-size: 8pt; color: #8494a6; display: flex; justify-content: space-between; }
  .nota-final { margin-top: 10px; font-size: 8pt; color: #8494a6; }

  /* Pantallas angostas (vista previa dentro de la app) */
  @media (max-width: 760px) {
    body { font-size: 9.5pt; padding: 12px; }
    .marca { flex-direction: column; gap: 4px; }
    .marca h1 { font-size: 17pt; }
    .marca .meta { text-align: left; }
    .resumen { flex-direction: column; }
    .fecha { white-space: normal; }
    th, td { font-size: 8.5pt; padding: 4px 5px; }
  }
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
</body>
</html>`;
}

/** Texto apto para las fuentes WinAnsi de jsPDF (acentos latino-1 ok). */
function sanear(s: string): string {
  return s
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/[^\x09\x0A\x0D\x20-\xFF]/g, "");
}

/**
 * Genera el reporte como PDF real (jsPDF + autotable) sin abrir el navegador:
 * el componente de vista previa lo muestra y ofrece Descargar / Cerrar.
 */
export async function generarPDFReporte({
  datos,
  config,
  idioma,
}: {
  datos: Datos;
  config: Config;
  tema: Tema;
  idioma: Idioma;
}): Promise<Blob> {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const t = TEXTOS[idioma] || TEXTOS.es;
  const resumen = totales(datos);
  const filas = resumenActividades(datos);
  const porActividad = new Map(filas.map((f) => [f.actividad.id, f]));
  const actividades: Actividad[] = datos.actividades;
  const registrosOrdenados = [...datos.registros].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const mapaAct = new Map(actividades.map((a) => [a.id, a]));
  const hoy = new Date().toLocaleDateString(idioma === "en" ? "en-US" : "es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const NAVY: [number, number, number] = [18, 60, 99];
  const GRIS: [number, number, number] = [107, 124, 144];
  const TINTA: [number, number, number] = [27, 42, 58];
  const MARGEN = 14;
  const ANCHO = 210 - MARGEN * 2;
  const PIE = 285;
  const LIMITE = PIE - 14;

  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const encabezado = (g: jsPDF) => {
    g.setFont("helvetica", "bold");
    g.setFontSize(8);
    g.setTextColor(...GRIS);
    g.text("Kairós", MARGEN, 8);
    const der = sanear(t.titulo);
    g.text(der, 210 - MARGEN - g.getTextWidth(der), 8);
    g.setTextColor(0);
    g.setFont("helvetica", "normal");
  };
  encabezado(doc);

  let y = 24;
  const nuevaPagina = () => {
    doc.addPage();
    y = 24;
    encabezado(doc);
  };
  const asegurarEspacio = (alto: number) => {
    if (y + alto > LIMITE) nuevaPagina();
  };

  // ---- Portada ----
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(...NAVY);
  doc.text("Kairós", MARGEN, y);
  doc.setFontSize(9);
  doc.setTextColor(...GRIS);
  doc.setFont("helvetica", "normal");
  doc.text(sanear(t.lema), MARGEN, y + 5);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...NAVY);
  const der = sanear(t.titulo);
  doc.text(der, 210 - MARGEN - doc.getTextWidth(der), y - 4);
  doc.setFontSize(9);
  doc.setTextColor(...GRIS);
  doc.setFont("helvetica", "normal");
  const fechaHoy = sanear(hoy);
  doc.text(fechaHoy, 210 - MARGEN - doc.getTextWidth(fechaHoy), y + 1);
  y += 14;

  // ---- Cajas de resumen ----
  const caja = (
    x: number,
    etiqueta: string,
    valor: string,
    detalle: string,
    avance: number,
    colorBarra: string
  ) => {
    const ancho = (ANCHO - 10) / 2;
    doc.setDrawColor(223, 231, 240);
    doc.setFillColor(247, 250, 253);
    doc.roundedRect(x, y, ancho, 30, 3, 3, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...GRIS);
    doc.text(sanear(etiqueta.toUpperCase()), x + 4, y + 7);
    doc.setFontSize(15);
    doc.setTextColor(...NAVY);
    doc.text(sanear(valor), x + 4, y + 17);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...GRIS);
    doc.text(sanear(detalle), x + 4, y + 23);
    const bw = ancho - 8;
    const [br, bg, bb] = hexARgb(colorBarra);
    doc.setFillColor(227, 235, 243);
    doc.roundedRect(x + 4, y + 25.5, bw, 2.4, 1.2, 1.2, "F");
    if (avance > 0) {
      doc.setFillColor(br, bg, bb);
      doc.roundedRect(x + 4, y + 25.5, Math.max(2.4, bw * avance), 2.4, 1.2, 1.2, "F");
    }
  };

  const metaVol = datos.metas.voluntariado;
  const metaLab = datos.metas.labor;
  const detalleMeta = (registrado: number, meta: number) =>
    meta > 0 ? `${t.meta}: ${formatoHM(meta, idioma)} · ${pct(registrado, meta)}` : t.sinMeta;

  caja(
    MARGEN,
    t.voluntariado,
    formatoHM(resumen.voluntariado, idioma),
    detalleMeta(resumen.voluntariado, metaVol),
    metaVol > 0 ? Math.min(1, resumen.voluntariado / metaVol) : 0,
    config.colorVol
  );
  caja(
    MARGEN + (ANCHO - 10) / 2 + 10,
    t.labor,
    formatoHM(resumen.labor, idioma),
    detalleMeta(resumen.labor, metaLab),
    metaLab > 0 ? Math.min(1, resumen.labor / metaLab) : 0,
    config.colorLab
  );
  y += 38;

  // ---- Secciones ----
  const tituloSeccion = (texto: string) => {
    asegurarEspacio(14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...NAVY);
    doc.text(sanear(texto.toUpperCase()), MARGEN, y);
    y += 2.5;
    doc.setDrawColor(...NAVY);
    doc.setLineWidth(0.4);
    doc.line(MARGEN, y, MARGEN + ANCHO, y);
    y += 4;
    doc.setTextColor(0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
  };

  const tablaActividades = (lista: Actividad[]) => {
    if (lista.length === 0) {
      doc.setTextColor(...GRIS);
      doc.setFont("helvetica", "italic");
      doc.text(sanear(t.sinActividades), MARGEN, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0);
      y += 8;
      return;
    }
    asegurarEspacio(24);
    autoTable(doc, {
      startY: y,
      head: [[sanear(t.actividad), sanear(t.lugar), sanear(t.registros), sanear(t.horas)]],
      body: lista.map((a) => {
        const f = porActividad.get(a.id);
        return [
          sanear(a.nombre),
          sanear(a.lugar || "—"),
          String(f ? f.registros : 0),
          formatoHM(f ? f.minutos : 0, idioma),
        ];
      }),
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 2, textColor: TINTA, lineColor: [230, 237, 244] },
      headStyles: { fillColor: NAVY, textColor: 255, fontSize: 8.5 },
      alternateRowStyles: { fillColor: [246, 249, 252] },
      columnStyles: { 2: { halign: "center" }, 3: { halign: "right" } },
      margin: { left: MARGEN, right: MARGEN },
      didDrawPage: () => encabezado(doc),
    });
    const ultima = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY;
    y = (ultima ?? y) + 8;
  };

  tituloSeccion(t.voluntariado);
  tablaActividades(actividades.filter((a) => aportaVoluntariado(a.tipo)));

  tituloSeccion(t.labor);
  tablaActividades(actividades.filter((a) => aportaLabor(a.tipo)));

  tituloSeccion(`${t.detalle} (${datos.registros.length})`);
  if (datos.registros.length === 0) {
    doc.setTextColor(...GRIS);
    doc.setFont("helvetica", "italic");
    doc.text(sanear(t.sinRegistros), MARGEN, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    y += 8;
  } else {
    asegurarEspacio(24);
    autoTable(doc, {
      startY: y,
      head: [
        [
          sanear(t.fecha),
          sanear(t.actividad),
          sanear(t.llegada),
          sanear(t.salida),
          sanear(t.duracion),
          sanear(t.notas),
        ],
      ],
      body: registrosOrdenados.map((r) => {
        const a = mapaAct.get(r.actividadId);
        return [
          sanear(fechaLarga(r.fecha, idioma)),
          sanear(a ? a.nombre : "—"),
          formatearHoraHHMM(r.llegada, config.formatoHora, idioma),
          formatearHoraHHMM(r.salida, config.formatoHora, idioma),
          formatoHM(minutosDeRegistro(r), idioma),
          sanear(r.notas || ""),
        ];
      }),
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 1.8, textColor: TINTA, lineColor: [230, 237, 244], overflow: "linebreak" },
      headStyles: { fillColor: NAVY, textColor: 255, fontSize: 8 },
      alternateRowStyles: { fillColor: [246, 249, 252] },
      columnStyles: {
        0: { cellWidth: 30 },
        2: { halign: "center", cellWidth: 15 },
        3: { halign: "center", cellWidth: 15 },
        4: { halign: "right", cellWidth: 17 },
      },
      margin: { left: MARGEN, right: MARGEN },
      didDrawPage: () => encabezado(doc),
    });
    const ultima = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY;
    y = (ultima ?? y) + 8;
  }

  // ---- Totales ----
  asegurarEspacio(14);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...TINTA);
  const totalesTexto = sanear(
    `${t.totalGeneral}: ${formatoHM(resumen.totalGeneral, idioma)} · ${t.registros}: ${resumen.totalRegistros} · ${t.actividades}: ${resumen.totalActividades}`
  );
  doc.text(totalesTexto, MARGEN, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0);
  y += 8;

  // ---- Pie ----
  doc.setDrawColor(223, 231, 240);
  doc.setLineWidth(0.3);
  doc.line(MARGEN, PIE - 6, MARGEN + ANCHO, PIE - 6);
  doc.setFontSize(8);
  doc.setTextColor(132, 148, 166);
  const pieIzq = sanear(`Kairós · ${t.lema}`);
  doc.text(pieIzq, MARGEN, PIE - 2);
  const pieDer = sanear(`${t.generado} ${hoy}`);
  doc.text(pieDer, 210 - MARGEN - doc.getTextWidth(pieDer), PIE - 2);

  return doc.output("blob");
}
