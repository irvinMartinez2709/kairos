/**
 * Fotos guardadas en IndexedDB (no en localStorage) para no agotar el espacio.
 * Se guardan como data URL ya comprimida.
 */
const NOMBRE_DB = "kairos-fotos";
const ALMACEN = "fotos";
const VERSION_DB = 1;

let cacheDb: IDBDatabase | null = null;

function abrirDb(): Promise<IDBDatabase> {
  if (cacheDb) return Promise.resolve(cacheDb);
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB no disponible"));
      return;
    }
    const req = indexedDB.open(NOMBRE_DB, VERSION_DB);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(ALMACEN)) db.createObjectStore(ALMACEN);
    };
    req.onsuccess = () => {
      cacheDb = req.result;
      resolve(req.result);
    };
    req.onerror = () => reject(req.error || new Error("No se pudo abrir IndexedDB"));
  });
}

export async function guardarFoto(dataUrl: string): Promise<string> {
  const id = `foto-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  return guardarFotoConId(id, dataUrl);
}

/** Guarda una foto conservando un id específico (para importar respaldos). */
export async function guardarFotoConId(id: string, dataUrl: string): Promise<string> {
  try {
    const db = await abrirDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(ALMACEN, "readwrite");
      tx.objectStore(ALMACEN).put(dataUrl, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    return id;
  } catch {
    // Respaldo en localStorage si IndexedDB falla
    try {
      localStorage.setItem(`kairos.foto.${id}`, dataUrl);
    } catch {
      /* sin espacio */
    }
    return id;
  }
}

export async function leerFoto(id: string): Promise<string | null> {
  try {
    const db = await abrirDb();
    const valor = await new Promise<string | null>((resolve, reject) => {
      const tx = db.transaction(ALMACEN, "readonly");
      const req = tx.objectStore(ALMACEN).get(id);
      req.onsuccess = () => resolve(typeof req.result === "string" ? req.result : null);
      req.onerror = () => reject(req.error);
    });
    if (valor) return valor;
  } catch {
    /* sigue el respaldo */
  }
  return localStorage.getItem(`kairos.foto.${id}`);
}

export async function borrarFoto(id: string): Promise<void> {
  try {
    const db = await abrirDb();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(ALMACEN, "readwrite");
      tx.objectStore(ALMACEN).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    /* noop */
  }
  localStorage.removeItem(`kairos.foto.${id}`);
}

export async function borrarFotos(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => borrarFoto(id)));
}

/** Comprime una imagen a JPEG para que ocupe poco espacio. */
export function comprimirImagen(archivo: File, maxLado = 1280, calidad = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onerror = () => reject(new Error("No se pudo leer la imagen"));
    lector.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Formato de imagen no soportado"));
      img.onload = () => {
        const escala = Math.min(1, maxLado / Math.max(img.width, img.height));
        const ancho = Math.max(1, Math.round(img.width * escala));
        const alto = Math.max(1, Math.round(img.height * escala));
        const canvas = document.createElement("canvas");
        canvas.width = ancho;
        canvas.height = alto;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas no disponible"));
          return;
        }
        ctx.drawImage(img, 0, 0, ancho, alto);
        resolve(canvas.toDataURL("image/jpeg", calidad));
      };
      img.src = String(lector.result);
    };
    lector.readAsDataURL(archivo);
  });
}
