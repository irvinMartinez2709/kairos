import { useEffect, useState } from "react";
import type { Metas } from "../types";
import { formatoHM } from "../lib/horas";
import { Boton, Campo, Chip, Hoja, Segmentado } from "./ui";
import { useT } from "../i18n";

export function EditorMeta({
  abierta,
  onCerrar,
  metas,
  onGuardar,
  tipoInicial = "voluntariado",
}: {
  abierta: boolean;
  onCerrar: () => void;
  metas: Metas;
  onGuardar: (metas: Metas) => void;
  tipoInicial?: "voluntariado" | "labor";
}) {
  const t = useT();
  const [tipo, setTipo] = useState<"voluntariado" | "labor">(tipoInicial);
  const [horas, setHoras] = useState("0");
  const [minutos, setMinutos] = useState(0);

  useEffect(() => {
    if (!abierta) return;
    setTipo(tipoInicial);
    const base = tipoInicial === "labor" ? metas.labor : metas.voluntariado;
    setHoras(String(Math.floor(base / 60)));
    setMinutos(base % 60);
  }, [abierta, tipoInicial, metas.labor, metas.voluntariado]);

  const total = Math.max(0, Math.round((Number(horas) || 0) * 60 + minutos));

  function guardar() {
    const nuevas: Metas = { ...metas };
    if (tipo === "voluntariado") nuevas.voluntariado = total;
    else nuevas.labor = total;
    onGuardar(nuevas);
    onCerrar();
  }

  return (
    <Hoja
      abierta={abierta}
      onCerrar={onCerrar}
      titulo={t("Meta de horas")}
      pie={
        <div className="flex gap-2">
          <Boton variante="contorno" className="flex-1" onClick={onCerrar}>
            {t("Cancelar")}
          </Boton>
          <Boton className="flex-[1.4]" onClick={guardar}>
            {t("Guardar")}
          </Boton>
        </div>
      }
    >
      <div className="space-y-4">
        <Segmentado
          valor={tipo}
          onChange={setTipo}
          opciones={[
            { id: "voluntariado", texto: t("Voluntariado") },
            { id: "labor", texto: t("Labor social") },
          ]}
        />

        <div className="rounded-2xl border-2 border-borde bg-soft px-4 py-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-subtinta">
            {t("Meta")}
          </p>
          <p className="text-2xl font-black text-tinta">{formatoHM(total)}</p>
        </div>

        <Campo
          label={t("Horas")}
          tipo="number"
          min="0"
          max="9999"
          value={horas}
          onChange={setHoras}
          ayuda={t("Escribe la cantidad de horas que necesitas cumplir.")}
        />

        <div>
          <span className="mb-1 block text-sm font-semibold text-subtinta">{t("Minutos")}</span>
          <div className="flex gap-2">
            {[0, 15, 30, 45].map((m) => (
              <Chip key={m} activo={minutos === m} onClick={() => setMinutos(m)}>
                {m} min
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-1 block text-sm font-semibold text-subtinta">
            {t("Atajos de horas")}
          </span>
          <div className="flex flex-wrap gap-2">
            {[10, 20, 40, 60, 80, 100, 120, 480].map((h) => (
              <Chip
                key={h}
                activo={Number(horas) === h && minutos === 0}
                onClick={() => {
                  setHoras(String(h));
                  setMinutos(0);
                }}
              >
                {h} h
              </Chip>
            ))}
          </div>
        </div>

        <p className="text-xs leading-relaxed text-subtinta">
          {t(
            "Pon 0 si todavía no tienes una meta: la gráfica mostrará solo las horas que llevas."
          )}
        </p>
      </div>
    </Hoja>
  );
}
