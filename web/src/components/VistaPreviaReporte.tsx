import { useEffect, useMemo, useState } from "react";
import type { Config, Datos, Idioma, Tema } from "../types";
import { generarPDFReporte, generarReporte } from "../lib/reporte";
import { guardarOCompartir } from "../lib/archivos";
import { useT } from "../i18n";
import { Boton, avisar } from "./ui";
import { Icono } from "./iconos";

/**
 * Vista previa del reporte DENTRO de la app: no abre el navegador.
 * Ofrece «Descargar PDF» (genera el archivo y abre la hoja de guardado
 * de Android) y «Cerrar» para volver a Ajustes.
 */
export default function VistaPreviaReporte({
  abierta,
  datos,
  config,
  tema,
  idioma,
  onCerrar,
}: {
  abierta: boolean;
  datos: Datos;
  config: Config;
  tema: Tema;
  idioma: Idioma;
  onCerrar: () => void;
}) {
  const t = useT();
  const [generando, setGenerando] = useState(false);

  const html = useMemo(
    () => (abierta ? generarReporte({ datos, config, tema, idioma }) : ""),
    [abierta, datos, config, tema, idioma]
  );

  useEffect(() => {
    if (!abierta) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previo;
    };
  }, [abierta]);

  if (!abierta) return null;

  async function descargarPDF() {
    if (generando) return;
    setGenerando(true);
    try {
      const blob = await generarPDFReporte({ datos, config, tema, idioma });
      const fecha = new Date().toISOString().slice(0, 10);
      const resultado = await guardarOCompartir({
        nombre: `kairos-reporte-${fecha}.pdf`,
        contenido: blob,
        tipo: "application/pdf",
        titulo: "Kairós",
        texto: t("Reporte de horas"),
      });
      if (resultado === "compartido") avisar(t("Reporte guardado"));
      else if (resultado === "descargado") avisar(t("Reporte descargado"));
    } catch {
      avisar(t("No se pudo generar el PDF"), "error");
    } finally {
      setGenerando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-fondo">
      <header className="flex shrink-0 items-center gap-2 border-b-2 border-borde bg-card px-4 py-3">
        <button
          type="button"
          onClick={onCerrar}
          aria-label={t("Cerrar")}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-borde bg-card text-subtinta active:scale-95"
        >
          <Icono nombre="cerrar" className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-extrabold leading-tight text-tinta">
            {t("Vista previa del reporte")}
          </p>
          <p className="truncate text-[11px] font-semibold text-subtinta">
            {t("Resumen y detalle listo para imprimir")}
          </p>
        </div>
        <Boton
          onClick={() => void descargarPDF()}
          disabled={generando}
          icono="descargar"
          className="shrink-0 px-3 py-2.5 text-[13px]"
        >
          {generando ? t("Generando…") : t("Descargar PDF")}
        </Boton>
      </header>

      <iframe
        title={t("Vista previa del reporte")}
        srcDoc={html}
        className="min-h-0 w-full flex-1 border-0 bg-white"
      />
    </div>
  );
}
