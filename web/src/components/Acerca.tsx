import { VERSION, VERSION_CODE, ESLOGAN, NOMBRE_APP } from "../version";
import { Icono } from "./iconos";
import { Tarjeta } from "./ui";
import { useT } from "../i18n";

export default function Acerca({ onVolver }: { onVolver: () => void }) {
  const t = useT();

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
        <h1 className="text-xl font-black leading-tight text-tinta">{t("Acerca de")} Kairós</h1>
      </header>

      <Tarjeta className="flex flex-col items-center gap-2 p-6 text-center">
        <div className="rounded-3xl bg-white px-5 py-4 shadow-inner">
          <img src="./logo.svg" alt="Kairós" className="h-40 w-auto" />
        </div>
        <p className="mt-2 text-sm font-semibold text-tinta">{t(ESLOGAN)}</p>
        <p className="text-[11px] text-subtinta">
          {NOMBRE_APP} v{VERSION} · build {VERSION_CODE}
        </p>
      </Tarjeta>

      <Tarjeta className="divide-y divide-borde/70 px-4 text-[12.5px]">
        <div className="flex items-center justify-between py-3">
          <span className="text-subtinta">{t("Aplicación")}</span>
          <span className="font-bold text-tinta">{NOMBRE_APP}</span>
        </div>
        <div className="flex items-center justify-between py-3">
          <span className="text-subtinta">{t("Versión")}</span>
          <span className="font-bold text-tinta">
            {VERSION} ({VERSION_CODE})
          </span>
        </div>
        <div className="flex items-center justify-between py-3">
          <span className="text-subtinta">{t("Plataforma")}</span>
          <span className="font-bold text-tinta">Web / Android</span>
        </div>
        <div className="flex items-center justify-between py-3">
          <span className="text-subtinta">{t("Diseño y desarrollo")}</span>
          <span className="font-bold text-tinta">Irvin</span>
        </div>
        <div className="flex items-center justify-between py-3">
          <span className="text-subtinta">{t("Almacenamiento")}</span>
          <span className="font-bold text-tinta">{t("Local, sin nube")}</span>
        </div>
      </Tarjeta>

      <p className="px-2 text-center text-[11px] leading-relaxed text-subtinta">
        {t(
          "Kairós nació para ordenar las horas de voluntariado y labor social: cada actividad con su color, sus fotos y su propio avance."
        )}
      </p>
      <p className="pb-2 text-center text-[10px] text-subtinta/70">
        © {new Date().getFullYear()} Kairós · {t("Hecho con cariño para tu servicio")}
      </p>
    </div>
  );
}
