import { useEffect, useMemo, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { App as AppPlugin } from "@capacitor/app";

import { useDatos } from "./hooks/useDatos";
import { CtxIdioma, traducir } from "./i18n";
import { NOMBRE_APP } from "./version";
import { aplicarPaleta, acentoDe, mezclarHex } from "./lib/colores";
import { construirRespaldo, guardarRespaldo, importarRespaldo } from "./lib/respaldo";
import { programarRecordatorios } from "./lib/notificaciones";
import {
  abrirDescarga,
  buscarActualizacion,
  chequeoDiarioPendiente,
  marcarChequeo,
  marcarRechazada,
  registrarVersionVista,
  versionRechazada,
} from "./lib/actualizaciones";

import Splash from "./components/Splash";
import Inicio from "./components/Inicio";
import Actividades from "./components/Actividades";
import ActividadDetalle from "./components/ActividadDetalle";
import Configuracion from "./components/Configuracion";
import Ayuda from "./components/Ayuda";
import Acerca from "./components/Acerca";
import VistaPreviaReporte from "./components/VistaPreviaReporte";
import { Dialogos, avisar, confirmar } from "./components/ui";
import { Icono } from "./components/iconos";
import { EditorActividad, type BorradorActividad } from "./components/EditorActividad";
import { EditorRegistro, type BorradorRegistro } from "./components/EditorRegistro";
import { EditorMeta } from "./components/EditorMeta";

type Seccion = "inicio" | "actividades" | "ajustes" | "ayuda" | "acerca";

export default function App() {
  const api = useDatos();
  const { datos, config, tema } = api;
  const t = (clave: string, vars?: Record<string, string | number>) =>
    traducir(config.idioma, clave, vars);

  const [cargando, setCargando] = useState(true);
  const [seccion, setSeccion] = useState<Seccion>("inicio");
  const [actividadAbierta, setActividadAbierta] = useState<string | null>(null);

  const [editorActividad, setEditorActividad] = useState<{
    abierta: boolean;
    id: string | null;
  }>({ abierta: false, id: null });

  const [editorRegistro, setEditorRegistro] = useState<{
    abierta: boolean;
    id: string | null;
    actividadFija?: string;
  }>({ abierta: false, id: null });

  const [editorMeta, setEditorMeta] = useState<{
    abierta: boolean;
    tipo: "voluntariado" | "labor";
  }>({ abierta: false, tipo: "voluntariado" });

  const [vistaPreviaPDF, setVistaPreviaPDF] = useState(false);

  const ultimoBack = useRef(0);
  const [avisoBack, setAvisoBack] = useState(false);

  /* Tema + paleta */
  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle("dark", tema === "dark");
    html.classList.toggle("light", tema === "light");
    html.setAttribute("data-color", config.color);
    html.setAttribute("data-emojis", config.emojis);
    aplicarPaleta(config, tema);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", acentoDe(config.color, tema));
  }, [tema, config]);

  /* Botón atrás de Android: primero cierra lo abierto, luego doble pulsación para salir */
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const handle = AppPlugin.addListener("backButton", () => {
      if (vistaPreviaPDF) {
        setVistaPreviaPDF(false);
        return;
      }
      if (editorActividad.abierta || editorRegistro.abierta || editorMeta.abierta) {
        setEditorActividad({ abierta: false, id: null });
        setEditorRegistro({ abierta: false, id: null });
        setEditorMeta((e) => ({ ...e, abierta: false }));
        return;
      }
      if (actividadAbierta) {
        setActividadAbierta(null);
        return;
      }
      if (seccion === "ayuda" || seccion === "acerca") {
        setSeccion("ajustes");
        return;
      }
      if (seccion !== "inicio") {
        setSeccion("inicio");
        return;
      }
      const ahora = Date.now();
      if (ahora - ultimoBack.current < 2000) {
        void AppPlugin.exitApp();
      } else {
        ultimoBack.current = ahora;
        setAvisoBack(true);
        window.setTimeout(() => setAvisoBack(false), 2000);
      }
    });
    return () => {
      void handle.then((l) => l.remove());
    };
  }, [actividadAbierta, seccion, vistaPreviaPDF, editorActividad.abierta, editorRegistro.abierta, editorMeta.abierta]);

  /* Recordatorios: se programan con el plugin nativo (sobreviven con la app cerrada) */
  useEffect(() => {
    const cuerpo = traducir(config.idioma, "Recuerda registrar tus horas de hoy.");
    void programarRecordatorios(config, NOMBRE_APP, cuerpo);
  }, [
    config.notificaciones,
    config.modoRecordatorio,
    config.diasRecordatorio,
    config.fechaRecordatorio,
    config.horaRecordatorio,
    config.idioma,
    config,
  ]);

  /* Si el usuario instaló una versión nueva por su cuenta, reactivar los avisos */
  useEffect(() => {
    if (registrarVersionVista()) {
      api.actualizarConfig({ avisarActualizaciones: true });
    }
  }, []);

  /* Chequeo automático de actualizaciones: una vez al día y solo si hay internet */
  useEffect(() => {
    if (!config.avisarActualizaciones) return;
    if (!chequeoDiarioPendiente()) return;
    marcarChequeo();
    void buscarActualizacionApp(false);
  }, [config.avisarActualizaciones]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [seccion, actividadAbierta]);

  const actividadActual = useMemo(
    () => datos.actividades.find((a) => a.id === actividadAbierta) || null,
    [datos.actividades, actividadAbierta]
  );

  const registroActual = useMemo(
    () => datos.registros.find((r) => r.id === editorRegistro.id) || null,
    [datos.registros, editorRegistro.id]
  );

  const actividadEnEdicion = useMemo(
    () => datos.actividades.find((a) => a.id === editorActividad.id) || null,
    [datos.actividades, editorActividad.id]
  );

  /* ---------------------------- acciones ---------------------------- */

  /** Busca actualizaciones en GitHub. manual=true → siempre consulta (botón). */
  async function buscarActualizacionApp(manual: boolean) {
    const res = await buscarActualizacion();
    if (res.fallo) {
      if (manual) avisar(t("No se pudo buscar. Revisa tu conexión."), "error");
      return;
    }
    if (!res.hay) {
      if (manual) avisar(t("Estás en la última versión"));
      return;
    }
    /* En el chequeo automático no insistimos con la versión que rechazó. */
    if (!manual && versionRechazada(res.version || "")) return;
    const ok = await confirmar({
      titulo: t("Nueva versión disponible"),
      mensaje: t("Hay una versión nueva de Kairós ({v}). ¿Descargar e instalarla ahora?", {
        v: res.version || "",
      }),
      textoOk: t("Sí"),
      textoCancelar: t("No"),
    });
    if (!ok) {
      marcarRechazada(res.version || "");
      return;
    }
    if (res.url) await abrirDescarga(res.url);
  }

  function guardarActividad(borrador: BorradorActividad) {
    if (editorActividad.id) {
      api.actualizarActividad(editorActividad.id, borrador);
      avisar(t("Actividad actualizada"));
    } else {
      const creada = api.añadirActividad(borrador);
      setActividadAbierta(creada.id);
      setSeccion("actividades");
      avisar(t("Actividad creada"));
    }
  }

  async function eliminarActividad(id: string) {
    const actividad = datos.actividades.find((a) => a.id === id);
    if (!actividad) return;
    const ok = await confirmar({
      titulo: t("¿Eliminar actividad?"),
      mensaje: t(
        "Se borrarán también sus {n} registros y fotos. Esta acción no se puede deshacer."
      ).replace("{n}", String(datos.registros.filter((r) => r.actividadId === id).length)),
      textoOk: t("Eliminar"),
      peligro: true,
    });
    if (!ok) return;
    api.eliminarActividad(id);
    if (actividadAbierta === id) setActividadAbierta(null);
    avisar(t("Actividad eliminada"));
  }

  function guardarRegistro(borrador: BorradorRegistro) {
    if (editorRegistro.id) {
      api.actualizarRegistro(editorRegistro.id, borrador);
      avisar(t("Registro actualizado"));
    } else {
      api.añadirRegistro(borrador);
      avisar(t("Horas registradas"));
    }
  }

  async function eliminarRegistro(id: string) {
    const registro = datos.registros.find((r) => r.id === id);
    if (!registro) return;
    const ok = await confirmar({
      titulo: t("¿Eliminar registro?"),
      mensaje: t("Se borrarán las horas, notas y fotos de este registro."),
      textoOk: t("Eliminar"),
      peligro: true,
    });
    if (!ok) return;
    api.eliminarRegistro(registro);
    avisar(t("Registro eliminado"));
  }

  async function exportar() {
    try {
      const texto = await construirRespaldo(datos, config, tema);
      const fecha = new Date().toISOString().slice(0, 10);
      const resultado = await guardarRespaldo(`kairos-respaldo-${fecha}.json`, texto);
      if (resultado === "compartido") avisar(t("Respaldo guardado"));
      else if (resultado === "descargado") avisar(t("Respaldo descargado"));
      // "cancelado": el usuario cerró la hoja, no hay nada que avisar
    } catch {
      avisar(t("No se pudo exportar el respaldo"), "error");
    }
  }

  async function importar(texto: string) {
    const ok = await confirmar({
      titulo: t("¿Importar respaldo?"),
      mensaje: t("Los datos actuales se reemplazarán por los del archivo."),
      textoOk: t("Importar"),
    });
    if (!ok) return;
    const resultado = await importarRespaldo(texto);
    if (!resultado.ok || !resultado.datos) {
      avisar(resultado.mensaje || t("No se pudo importar"), "error");
      return;
    }
    api.reemplazarTodo(resultado.datos, resultado.config, resultado.tema);
    setActividadAbierta(null);
    setSeccion("inicio");
    avisar(t("Respaldo importado"));
  }

  async function borrarTodo() {
    const ok = await confirmar({
      titulo: t("¿Borrar todos los datos?"),
      mensaje: t(
        "Se eliminarán todas las actividades, registros y fotos. Esta acción no se puede deshacer."
      ),
      textoOk: t("Borrar todo"),
      peligro: true,
    });
    if (!ok) return;
    api.restablecer();
    setActividadAbierta(null);
    setSeccion("inicio");
    avisar(t("Datos borrados"));
  }

  async function cargarEjemplo() {
    const ok = await confirmar({
      titulo: t("¿Cargar actividad de ejemplo?"),
      mensaje: t("Se agregará Ecomural los milagros de Jesús con sus 7 registros."),
      textoOk: t("Agregar"),
    });
    if (!ok) return;
    api.cargarEjemplo();
    avisar(t("Ejemplo agregado"));
  }

  const nav: { id: Seccion; label: string; icono: "inicio" | "lista" | "ajustes" }[] = [
    { id: "inicio", label: t("Inicio"), icono: "inicio" },
    { id: "actividades", label: t("Actividades"), icono: "lista" },
    { id: "ajustes", label: t("Ajustes"), icono: "ajustes" },
  ];

  return (
    <CtxIdioma.Provider value={config.idioma}>
      <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col">
        {cargando && (
          <Splash
            tono={mezclarHex(acentoDe(config.color, tema), "#0A1220", 0.45)}
            onDone={() => setCargando(false)}
          />
        )}

        <main className="flex-1 px-4 pb-24 pt-3">
          {seccion === "inicio" && (
            <Inicio
              datos={datos}
              config={config}
              tema={tema}
              onNuevaActividad={() => setEditorActividad({ abierta: true, id: null })}
              onNuevoRegistro={() => setEditorRegistro({ abierta: true, id: null })}
              onAbrirActividad={(id) => {
                setActividadAbierta(id);
                setSeccion("actividades");
              }}
              onEditarMeta={(tipo) => setEditorMeta({ abierta: true, tipo })}
              onCambiarTema={api.cambiarTema}
              onVerActividades={() => setSeccion("actividades")}
            />
          )}

          {seccion === "actividades" &&
            (actividadActual ? (
              <ActividadDetalle
                datos={datos}
                actividad={actividadActual}
                config={config}
                tema={tema}
                onVolver={() => setActividadAbierta(null)}
                onEditarActividad={() =>
                  setEditorActividad({ abierta: true, id: actividadActual.id })
                }
                onEliminarActividad={() => void eliminarActividad(actividadActual.id)}
                onNuevoRegistro={() =>
                  setEditorRegistro({
                    abierta: true,
                    id: null,
                    actividadFija: actividadActual.id,
                  })
                }
                onEditarRegistro={(r) => setEditorRegistro({ abierta: true, id: r.id })}
                onEliminarRegistro={(r) => void eliminarRegistro(r.id)}
              />
            ) : (
              <Actividades
                datos={datos}
                tema={tema}
                onAbrirActividad={(id) => setActividadAbierta(id)}
                onNuevaActividad={() => setEditorActividad({ abierta: true, id: null })}
                onEditarActividad={(id) => setEditorActividad({ abierta: true, id })}
                onEliminarActividad={(id) => void eliminarActividad(id)}
              />
            ))}

          {seccion === "ajustes" && (
            <Configuracion
              datos={datos}
              config={config}
              tema={tema}
              onConfig={api.actualizarConfig}
              onTema={api.cambiarTema}
              onEditarMeta={(tipo) => setEditorMeta({ abierta: true, tipo })}
              onExportar={() => void exportar()}
              onImportar={(texto) => void importar(texto)}
              onReporte={() => setVistaPreviaPDF(true)}
              onBorrarTodo={() => void borrarTodo()}
              onCargarEjemplo={() => void cargarEjemplo()}
              onAyuda={() => setSeccion("ayuda")}
              onAcerca={() => setSeccion("acerca")}
              onBuscarActualizaciones={() => void buscarActualizacionApp(true)}
            />
          )}

          {seccion === "ayuda" && <Ayuda onVolver={() => setSeccion("ajustes")} />}
          {seccion === "acerca" && <Acerca onVolver={() => setSeccion("ajustes")} />}
        </main>

        {avisoBack && (
          <div className="pointer-events-none fixed inset-x-0 bottom-36 z-50 flex justify-center px-4">
            <div className="rounded-full bg-black/80 px-4 py-2 text-sm font-semibold text-white shadow-lg">
              {t("Pulsa atrás otra vez para salir")}
            </div>
          </div>
        )}

        <nav className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-borde bg-card/95 backdrop-blur">
          <div className="mx-auto flex max-w-2xl items-stretch">
            {nav.map((n) => {
              const activo = seccion === n.id || (n.id === "actividades" && seccion === "actividades");
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    setSeccion(n.id);
                    if (n.id === "actividades") setActividadAbierta(null);
                  }}
                  className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10.5px] font-bold transition ${
                    activo ? "text-acc" : "text-subtinta"
                  }`}
                >
                  <Icono nombre={n.icono} className="h-5 w-5" grosor={activo ? 2.2 : 1.7} />
                  {n.label}
                </button>
              );
            })}
          </div>
        </nav>

        <EditorActividad
          abierta={editorActividad.abierta}
          actividad={actividadEnEdicion}
          onCerrar={() => setEditorActividad({ abierta: false, id: null })}
          onGuardar={guardarActividad}
          onEliminar={
            actividadEnEdicion
              ? () => {
                  const id = actividadEnEdicion.id;
                  setEditorActividad({ abierta: false, id: null });
                  void eliminarActividad(id);
                }
              : undefined
          }
        />

        <EditorRegistro
          abierta={editorRegistro.abierta}
          registro={registroActual}
          actividades={datos.actividades}
          actividadFija={editorRegistro.actividadFija}
          onCerrar={() => setEditorRegistro({ abierta: false, id: null })}
          onGuardar={guardarRegistro}
          onEliminar={
            registroActual
              ? () => {
                  const id = registroActual.id;
                  setEditorRegistro({ abierta: false, id: null });
                  void eliminarRegistro(id);
                }
              : undefined
          }
        />

        <EditorMeta
          abierta={editorMeta.abierta}
          tipoInicial={editorMeta.tipo}
          metas={datos.metas}
          onCerrar={() => setEditorMeta((e) => ({ ...e, abierta: false }))}
          onGuardar={api.cambiarMetas}
        />

        <VistaPreviaReporte
          abierta={vistaPreviaPDF}
          datos={datos}
          config={config}
          tema={tema}
          idioma={config.idioma}
          onCerrar={() => setVistaPreviaPDF(false)}
        />

        <Dialogos />
      </div>
    </CtxIdioma.Provider>
  );
}
