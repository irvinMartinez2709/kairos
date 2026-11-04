import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

/**
 * Guardar o compartir un archivo generado por la app.
 *
 * Orden de intentos:
 * 1) Web Share API (escritorio / navegadores que la soportan).
 * 2) App nativa (Capacitor): escribe el archivo en caché y abre la hoja
 *    nativa de Android, donde el usuario elige el administrador de archivos
 *    para guardarlo o la app con la que compartirlo.
 * 3) Descarga clásica con `<a download>` (fallback de escritorio).
 */
export type ResultadoGuardar = "compartido" | "descargado" | "cancelado";

async function blobABase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let bin = "";
  const trozo = 0x8000;
  for (let i = 0; i < bytes.length; i += trozo) {
    bin += String.fromCharCode(...bytes.subarray(i, i + trozo));
  }
  return btoa(bin);
}

function descargar(nombre: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export async function guardarOCompartir(opciones: {
  nombre: string;
  contenido: Blob | string;
  tipo: string;
  titulo: string;
  texto?: string;
}): Promise<ResultadoGuardar> {
  const { nombre, contenido, tipo, titulo, texto } = opciones;
  const blob =
    typeof contenido === "string"
      ? new Blob([contenido], { type: `${tipo};charset=utf-8` })
      : contenido;
  const file = new File([blob], nombre, { type: tipo });

  // 1) Web Share API
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: titulo, text: texto });
        return "compartido";
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return "cancelado";
      // por otro motivo, seguimos con la app nativa o la descarga
    }
  }

  // 2) Nativa (Capacitor): caché + hoja de compartir de Android
  if (Capacitor.isNativePlatform()) {
    try {
      const b64 = await blobABase64(blob);
      const ruta = `exportar/${nombre}`;
      await Filesystem.writeFile({
        path: ruta,
        data: b64,
        directory: Directory.Cache,
        recursive: true,
      });
      const { uri } = await Filesystem.getUri({ path: ruta, directory: Directory.Cache });
      await Share.share({ files: [uri], title: titulo, text: texto });
      // el sistema limpia la caché; no borramos aquí para no romper el destino elegido
      return "compartido";
    } catch (e) {
      if (e instanceof Error && /cancel/i.test(e.message)) return "cancelado";
      // si el plugin falla, caemos a la descarga clásica
    }
  }

  // 3) Descarga clásica (navegador de escritorio)
  descargar(nombre, blob);
  return "descargado";
}
