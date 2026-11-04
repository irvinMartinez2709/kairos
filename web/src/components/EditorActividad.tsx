import { useEffect, useState } from "react";
import type { Actividad, TipoActividad } from "../types";
import { COLORES_ACTIVIDAD, ICONOS_ACTIVIDAD } from "../types";
import { Boton, Campo, CampoArea, Hoja, Segmentado } from "./ui";
import { useT } from "../i18n";
import { avisar } from "./ui";

export interface BorradorActividad {
  nombre: string;
  descripcion: string;
  tipo: TipoActividad;
  color: string;
  icono: string;
  lugar: string;
}

const VACIO: BorradorActividad = {
  nombre: "",
  descripcion: "",
  tipo: "voluntariado",
  color: COLORES_ACTIVIDAD[0],
  icono: ICONOS_ACTIVIDAD[0],
  lugar: "",
};

export function EditorActividad({
  abierta,
  onCerrar,
  actividad,
  onGuardar,
  onEliminar,
}: {
  abierta: boolean;
  onCerrar: () => void;
  actividad?: Actividad | null;
  onGuardar: (borrador: BorradorActividad) => void;
  onEliminar?: () => void;
}) {
  const t = useT();
  const [borrador, setBorrador] = useState<BorradorActividad>(VACIO);

  useEffect(() => {
    if (!abierta) return;
    setBorrador(
      actividad
        ? {
            nombre: actividad.nombre,
            descripcion: actividad.descripcion,
            tipo: actividad.tipo,
            color: actividad.color,
            icono: actividad.icono,
            lugar: actividad.lugar,
          }
        : { ...VACIO, color: COLORES_ACTIVIDAD[Math.floor(Math.random() * COLORES_ACTIVIDAD.length)] }
    );
  }, [abierta, actividad]);

  function guardar() {
    if (!borrador.nombre.trim()) {
      avisar(t("Escribe un nombre para la actividad"), "error");
      return;
    }
    onGuardar({ ...borrador, nombre: borrador.nombre.trim() });
    onCerrar();
  }

  return (
    <Hoja
      abierta={abierta}
      onCerrar={onCerrar}
      titulo={actividad ? t("Editar actividad") : t("Nueva actividad")}
      alto
      pie={
        <div className="flex gap-2">
          {actividad && onEliminar && (
            <Boton variante="peligro" onClick={onEliminar} className="px-3">
              {t("Eliminar")}
            </Boton>
          )}
          <Boton variante="contorno" className="flex-1" onClick={onCerrar}>
            {t("Cancelar")}
          </Boton>
          <Boton className="flex-1" onClick={guardar}>
            {t("Guardar")}
          </Boton>
        </div>
      }
    >
      <div className="space-y-4">
        <Campo
          label={t("Nombre de la actividad")}
          value={borrador.nombre}
          onChange={(v) => setBorrador((b) => ({ ...b, nombre: v }))}
          placeholder={t("Ej. Ecomural, Reciclaje, Visita al asilo…")}
          autoFocus
        />

        <div>
          <span className="mb-1 block text-sm font-semibold text-subtinta">{t("Tipo")}</span>
          <Segmentado
            valor={borrador.tipo}
            onChange={(v) => setBorrador((b) => ({ ...b, tipo: v }))}
            opciones={[
              { id: "voluntariado", texto: t("Voluntariado") },
              { id: "labor", texto: t("Labor social") },
              { id: "ambos", texto: t("Ambos") },
            ]}
          />
          <p className="mt-1.5 text-xs leading-relaxed text-subtinta">
            {borrador.tipo === "ambos"
              ? t("Las horas de esta actividad cuentan para las dos metas.")
              : borrador.tipo === "labor"
                ? t("Las horas solo cuentan para la meta de labor social.")
                : t("Las horas solo cuentan para la meta de voluntariado.")}
          </p>
        </div>

        <Campo
          label={t("Lugar")}
          value={borrador.lugar}
          onChange={(v) => setBorrador((b) => ({ ...b, lugar: v }))}
          placeholder={t("Opcional")}
        />

        <CampoArea
          label={t("Descripción")}
          value={borrador.descripcion}
          onChange={(v) => setBorrador((b) => ({ ...b, descripcion: v }))}
          placeholder={t("¿De qué trata esta actividad?")}
        />

        <div>
          <span className="mb-1 block text-sm font-semibold text-subtinta">{t("Icono")}</span>
          <div className="grid grid-cols-6 gap-2">
            {ICONOS_ACTIVIDAD.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setBorrador((b) => ({ ...b, icono: i }))}
                className={`grid aspect-square place-items-center rounded-xl border-2 text-lg transition active:scale-95 ${
                  borrador.icono === i
                    ? "border-acc bg-acc-suave"
                    : "border-borde bg-soft hover:border-acc/40"
                }`}
              >
                <span className="emoji">{i}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-1 block text-sm font-semibold text-subtinta">
            {t("Color de la actividad")}
          </span>
          <div className="flex flex-wrap gap-2">
            {COLORES_ACTIVIDAD.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setBorrador((b) => ({ ...b, color: c }))}
                aria-label={`Color ${c}`}
                className={`h-9 w-9 rounded-full border-[3px] transition active:scale-90 ${
                  borrador.color.toLowerCase() === c.toLowerCase()
                    ? "border-tinta"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
            <label
              className="relative grid h-9 w-9 cursor-pointer place-items-center rounded-full border-[3px] border-dashed border-borde text-[10px] font-bold text-subtinta"
              title={t("Color personalizado")}
            >
              +
              <input
                type="color"
                value={borrador.color}
                onChange={(e) => setBorrador((b) => ({ ...b, color: e.target.value }))}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </label>
          </div>
        </div>
      </div>
    </Hoja>
  );
}
