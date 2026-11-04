import { useEffect, useRef, useState } from "react";
import type { Actividad, Registro } from "../types";
import { duracionMinutos, formatoHM, hoyISO } from "../lib/horas";
import { comprimirImagen, guardarFoto, borrarFoto } from "../lib/fotos";
import { avisar, Boton, Campo, CampoArea, Hoja, Selector } from "./ui";
import { useT } from "../i18n";
import { FotoMiniatura, VisorFotos } from "./Foto";
import { Icono } from "./iconos";

export interface BorradorRegistro {
  actividadId: string;
  fecha: string;
  llegada: string;
  salida: string;
  notas: string;
  fotos: string[];
}

export function EditorRegistro({
  abierta,
  onCerrar,
  registro,
  actividades,
  actividadFija,
  onGuardar,
  onEliminar,
}: {
  abierta: boolean;
  onCerrar: () => void;
  registro?: Registro | null;
  actividades: Actividad[];
  actividadFija?: string;
  onGuardar: (borrador: BorradorRegistro) => void;
  onEliminar?: () => void;
}) {
  const t = useT();
  const [borrador, setBorrador] = useState<BorradorRegistro>({
    actividadId: actividadFija || actividades[0]?.id || "",
    fecha: hoyISO(),
    llegada: "09:00",
    salida: "12:00",
    notas: "",
    fotos: [],
  });
  const [subiendo, setSubiendo] = useState(false);
  const [visiblesOriginales, setVisiblesOriginales] = useState<string[]>([]);
  const [visor, setVisor] = useState<number | null>(null);
  const entradaFoto = useRef<HTMLInputElement>(null);
  const guardado = useRef(false);

  useEffect(() => {
    if (!abierta) return;
    if (registro) {
      setBorrador({
        actividadId: registro.actividadId,
        fecha: registro.fecha,
        llegada: registro.llegada,
        salida: registro.salida,
        notas: registro.notas,
        fotos: [...registro.fotos],
      });
      setVisiblesOriginales([...registro.fotos]);
    } else {
      setBorrador({
        actividadId: actividadFija || actividades[0]?.id || "",
        fecha: hoyISO(),
        llegada: "09:00",
        salida: "12:00",
        notas: "",
        fotos: [],
      });
      setVisiblesOriginales([]);
    }
  }, [abierta, registro, actividadFija, actividades]);

  const minutos = duracionMinutos(borrador.llegada, borrador.salida);
  const cruzaMedianoche =
    borrador.llegada && borrador.salida && borrador.salida < borrador.llegada;

  async function subirFotos(lista: FileList | null) {
    if (!lista || lista.length === 0) return;
    setSubiendo(true);
    try {
      const nuevas: string[] = [];
      for (const archivo of Array.from(lista)) {
        const data = await comprimirImagen(archivo);
        const id = await guardarFoto(data);
        nuevas.push(id);
      }
      setBorrador((b) => ({ ...b, fotos: [...b.fotos, ...nuevas] }));
    } catch {
      avisar(t("No se pudo agregar la foto"), "error");
    } finally {
      setSubiendo(false);
      if (entradaFoto.current) entradaFoto.current.value = "";
    }
  }

  function quitarFoto(id: string) {
    setBorrador((b) => ({ ...b, fotos: b.fotos.filter((f) => f !== id) }));
    if (!visiblesOriginales.includes(id)) void borrarFoto(id);
  }

  function guardar() {
    if (!borrador.actividadId) {
      avisar(t("Elige una actividad"), "error");
      return;
    }
    if (!borrador.fecha) {
      avisar(t("Elige una fecha"), "error");
      return;
    }
    if (minutos <= 0) {
      avisar(t("La hora de salida debe ser distinta a la de llegada"), "error");
      return;
    }
    // Las fotos que se quitaron de un registro existente se borran del dispositivo
    const quitadas = visiblesOriginales.filter((f) => !borrador.fotos.includes(f));
    quitadas.forEach((f) => void borrarFoto(f));
    guardado.current = true;
    onGuardar({ ...borrador, notas: borrador.notas.trim() });
    onCerrar();
  }

  /** Si se cancela, se eliminan las fotos nuevas que no llegaron a guardarse. */
  function cerrar() {
    if (!guardado.current) {
      const nuevas = borrador.fotos.filter((f) => !visiblesOriginales.includes(f));
      nuevas.forEach((f) => void borrarFoto(f));
    }
    guardado.current = false;
    onCerrar();
  }

  return (
    <Hoja
      abierta={abierta}
      onCerrar={cerrar}
      titulo={registro ? t("Editar registro") : t("Nuevo registro")}
      alto
      pie={
        <div className="flex gap-2">
          {registro && onEliminar && (
            <Boton variante="peligro" onClick={onEliminar} className="px-3">
              {t("Eliminar")}
            </Boton>
          )}
          <Boton variante="contorno" className="flex-1" onClick={cerrar}>
            {t("Cancelar")}
          </Boton>
          <Boton className="flex-1" onClick={guardar}>
            {t("Guardar")}
          </Boton>
        </div>
      }
    >
      <div className="space-y-4">
        {!actividadFija && (
          <Selector
            label={t("Actividad")}
            valor={borrador.actividadId}
            onChange={(v) => setBorrador((b) => ({ ...b, actividadId: v }))}
            opciones={actividades.map((a) => ({
              id: a.id,
              texto: `${a.icono} ${a.nombre}`,
            }))}
            placeholder={t("Elige una actividad")}
          />
        )}

        <Campo
          label={t("Fecha")}
          tipo="date"
          value={borrador.fecha}
          onChange={(v) => setBorrador((b) => ({ ...b, fecha: v }))}
        />

        <div className="grid grid-cols-2 gap-3">
          <Campo
            label={t("Hora de llegada")}
            tipo="time"
            value={borrador.llegada}
            onChange={(v) => setBorrador((b) => ({ ...b, llegada: v }))}
          />
          <Campo
            label={t("Hora de salida")}
            tipo="time"
            value={borrador.salida}
            onChange={(v) => setBorrador((b) => ({ ...b, salida: v }))}
          />
        </div>

        <div className="flex items-center justify-between rounded-2xl border-2 border-borde bg-soft px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-subtinta">
            <Icono nombre="reloj" className="h-4 w-4" />
            {t("Duración")}
          </span>
          <span className="text-lg font-extrabold text-tinta">{formatoHM(minutos)}</span>
        </div>
        {cruzaMedianoche && (
          <p className="-mt-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
            {t("La salida es antes de la llegada: se contará como cambio de día.")}
          </p>
        )}
        {minutos > 16 * 60 && (
          <p className="-mt-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
            {t("Son más de 16 horas. Revisa las horas antes de guardar.")}
          </p>
        )}

        <CampoArea
          label={t("Notas")}
          value={borrador.notas}
          onChange={(v) => setBorrador((b) => ({ ...b, notas: v }))}
          placeholder={t("¿Qué hiciste? Materiales, personas, avances…")}
        />

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-subtinta">
              {t("Fotos")} ({borrador.fotos.length})
            </span>
            <button
              type="button"
              onClick={() => entradaFoto.current?.click()}
              disabled={subiendo}
              className="inline-flex items-center gap-1.5 rounded-xl bg-acc-suave px-3 py-1.5 text-xs font-bold text-acc disabled:opacity-50"
            >
              <Icono nombre="mas" className="h-3.5 w-3.5" />
              {subiendo ? t("Subiendo…") : t("Añadir foto")}
            </button>
          </div>
          <input
            ref={entradaFoto}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => void subirFotos(e.target.files)}
          />
          {borrador.fotos.length === 0 ? (
            <button
              type="button"
              onClick={() => entradaFoto.current?.click()}
              className="flex w-full flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-borde bg-soft py-6 text-subtinta active:scale-[0.99]"
            >
              <Icono nombre="foto" className="h-6 w-6" />
              <span className="text-xs font-semibold">{t("Agrega fotos de la actividad")}</span>
            </button>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {borrador.fotos.map((f, i) => (
                <FotoMiniatura
                  key={f}
                  id={f}
                  className="aspect-square"
                  onClick={() => setVisor(i)}
                  onQuitar={() => quitarFoto(f)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {visor !== null && (
        <VisorFotos
          ids={borrador.fotos}
          indice={visor}
          onCerrar={() => setVisor(null)}
        />
      )}
    </Hoja>
  );
}
