import { useEffect, useState } from "react";
import { leerFoto } from "../lib/fotos";
import { Icono } from "./iconos";
import { useT } from "../i18n";

const cache = new Map<string, string>();

export function useFotoSrc(id?: string | null): string | null {
  const [src, setSrc] = useState<string | null>(id ? cache.get(id) || null : null);
  useEffect(() => {
    let vivo = true;
    if (!id) {
      setSrc(null);
      return;
    }
    const guardada = cache.get(id);
    if (guardada) {
      setSrc(guardada);
      return;
    }
    void leerFoto(id).then((data) => {
      if (!vivo || !data) return;
      cache.set(id, data);
      setSrc(data);
    });
    return () => {
      vivo = false;
    };
  }, [id]);
  return src;
}

export function FotoMiniatura({
  id,
  className = "",
  onClick,
  onQuitar,
}: {
  id: string;
  className?: string;
  onClick?: () => void;
  onQuitar?: () => void;
}) {
  const t = useT();
  const src = useFotoSrc(id);
  return (
    <div className={`relative overflow-hidden rounded-xl border-2 border-borde bg-soft ${className}`}>
      <button type="button" onClick={onClick} className="block h-full w-full">
        {src ? (
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="grid h-full w-full place-items-center text-subtinta">
            <Icono nombre="foto" className="h-5 w-5" />
          </span>
        )}
      </button>
      {onQuitar && (
        <button
          type="button"
          onClick={onQuitar}
          aria-label={t("Quitar foto")}
          className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-white active:scale-90"
        >
          <Icono nombre="cerrar" className="h-3.5 w-3.5" grosor={2.4} />
        </button>
      )}
    </div>
  );
}

export function VisorFotos({
  ids,
  indice,
  onCerrar,
}: {
  ids: string[];
  indice: number;
  onCerrar: () => void;
}) {
  const t = useT();
  const [actual, setActual] = useState(indice);
  const src = useFotoSrc(ids[actual]);

  useEffect(() => {
    setActual(indice);
  }, [indice]);

  if (ids.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-black/95">
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <span className="text-sm font-semibold">
          {actual + 1} / {ids.length}
        </span>
        <button
          type="button"
          onClick={onCerrar}
          aria-label={t("Cerrar")}
          className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 active:scale-95"
        >
          <Icono nombre="cerrar" className="h-5 w-5" />
        </button>
      </div>
      <div className="relative flex flex-1 items-center justify-center px-3 pb-6">
        {src ? (
          <img src={src} alt="" className="max-h-full max-w-full rounded-xl object-contain" />
        ) : (
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        )}
        {ids.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setActual((a) => (a - 1 + ids.length) % ids.length)}
              className="absolute left-2 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white active:scale-95"
              aria-label={t("Anterior")}
            >
              <Icono nombre="atras" className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setActual((a) => (a + 1) % ids.length)}
              className="absolute right-2 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white active:scale-95"
              aria-label={t("Siguiente")}
            >
              <Icono nombre="flecha" className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
