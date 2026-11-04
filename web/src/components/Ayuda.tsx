import { useState } from "react";
import { Icono } from "./iconos";
import { useT } from "../i18n";
import { Tarjeta } from "./ui";

const PREGUNTAS: { p: string; r: string }[] = [
  {
    p: "¿Cómo creo una actividad?",
    r: "En la pestaña Actividades toca «Nueva». Ponle un nombre (por ejemplo Ecomural o Reciclaje), elige si cuenta como voluntariado, labor social o ambos, y asígnale un color e icono. Cada actividad guarda sus propios registros por separado.",
  },
  {
    p: "¿Cómo registro mis horas?",
    r: "Toca «Registrar horas», elige la actividad, la fecha y las horas de llegada y salida. La app calcula la duración exacta en horas y minutos. Puedes añadir notas y fotos a cada registro.",
  },
  {
    p: "¿Qué significa que una actividad sea «Ambos»?",
    r: "Que sus horas cuentan al mismo tiempo para la meta de voluntariado y para la de labor social. Si una actividad es solo de un tipo, sus horas únicamente suman a esa meta.",
  },
  {
    p: "¿Cómo cambio mis metas de horas?",
    r: "En el resumen toca la etiqueta de la meta o entra a Ajustes → Metas de horas. Puedes escribir la cantidad de horas y minutos que necesitas cumplir. Si la pones en 0, la gráfica mostrará solo lo registrado.",
  },
  {
    p: "¿Qué muestra la gráfica de pastel?",
    r: "Cada actividad ocupa una rebanada con su propio color según las horas que aporta. La rebanada gris representa las horas que faltan para llegar a la meta. Hay una gráfica para voluntariado y otra para labor social.",
  },
  {
    p: "¿Dónde se guardan mis datos?",
    r: "Todo se guarda en tu dispositivo: las actividades y registros en el almacenamiento local y las fotos en una base de datos interna. No se envía nada a internet.",
  },
  {
    p: "¿Cómo hago un respaldo?",
    r: "En Ajustes → Datos y respaldo → Exportar respaldo se descarga un archivo JSON con todo, incluidas las fotos. Para restaurarlo usa Importar respaldo. El reporte PDF sirve para entregar evidencias.",
  },
  {
    p: "¿Por qué nunca veo 4.89 horas?",
    r: "Porque Kairós trabaja con horas y minutos enteros: los minutos siempre van de 00 a 59 y al llegar a 60 se suma una hora. Así 4 h 53 min nunca se confunde con 4.89 h.",
  },
  {
    p: "¿Puedo registrar un turno que termina al día siguiente?",
    r: "Sí. Si la hora de salida es menor que la de llegada, la app entiende que el turno cruzó la medianoche y suma el día completo al cálculo.",
  },
];

export default function Ayuda({ onVolver }: { onVolver: () => void }) {
  const t = useT();
  const [abierta, setAbierta] = useState<number | null>(0);

  return (
    <div className="animate-fade-in space-y-4">
      <header className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onVolver}
          aria-label={t("Volver")}
          className="grid h-10 w-10 place-items-center rounded-xl border-2 border-borde bg-card text-subtinta active:scale-95"
        >
          <Icono nombre="atras" className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-black leading-tight text-tinta">
            {t("Ayuda y preguntas frecuentes")}
          </h1>
          <p className="text-[11px] font-medium text-subtinta">
            {t("Todo lo que necesitas para registrar tus horas")}
          </p>
        </div>
      </header>

      <div className="space-y-2">
        {PREGUNTAS.map((q, i) => {
          const activa = abierta === i;
          return (
            <Tarjeta key={q.p} className="overflow-hidden">
              <button
                type="button"
                onClick={() => setAbierta(activa ? null : i)}
                className="flex w-full items-start gap-2 p-3.5 text-left"
              >
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-acc-suave text-[11px] font-black text-acc">
                  {i + 1}
                </span>
                <span className="flex-1 text-[13.5px] font-bold leading-snug text-tinta">{q.p}</span>
                <Icono
                  nombre="flecha"
                  className={`mt-1 h-4 w-4 shrink-0 text-subtinta transition-transform ${
                    activa ? "rotate-[270deg]" : "rotate-90"
                  }`}
                />
              </button>
              {activa && (
                <p className="animate-fade-in border-t border-borde/70 px-3.5 pb-3.5 pt-2.5 text-[12.5px] leading-relaxed text-subtinta">
                  {q.r}
                </p>
              )}
            </Tarjeta>
          );
        })}
      </div>

      <Tarjeta className="bg-acc-suave/60 p-4">
        <p className="text-[12px] leading-relaxed text-tinta">
          <strong>{t("Consejo")}:</strong>{" "}
          {t(
            "registra tus horas el mismo día. Así no olvidas notas ni fotos y el resumen siempre está al día."
          )}
        </p>
      </Tarjeta>
    </div>
  );
}
