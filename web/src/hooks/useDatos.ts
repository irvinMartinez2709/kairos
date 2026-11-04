import { useCallback, useEffect, useMemo, useState } from "react";
import type { Actividad, Config, Datos, Metas, Registro, Tema } from "../types";
import { normalizarTipo } from "../types";
import {
  CONFIG_DEFECTO,
  borrarTodo,
  datosIniciales,
  guardarConfig,
  guardarDatos,
  guardarTema,
  leerConfig,
  leerDatos,
  leerTema,
  nuevoId,
} from "../lib/almacen";
import { borrarFotos } from "../lib/fotos";

export function useDatos() {
  const [datos, setDatos] = useState<Datos>(() => leerDatos());
  const [config, setConfig] = useState<Config>(() => leerConfig());
  const [tema, setTema] = useState<Tema>(() => leerTema());

  useEffect(() => {
    guardarDatos(datos);
  }, [datos]);

  useEffect(() => {
    guardarConfig(config);
  }, [config]);

  useEffect(() => {
    guardarTema(tema);
  }, [tema]);

  const añadirActividad = useCallback(
    (base: Omit<Actividad, "id" | "creada">): Actividad => {
      const actividad: Actividad = {
        ...base,
        nombre: base.nombre.trim(),
        tipo: normalizarTipo(base.tipo),
        id: nuevoId("act"),
        creada: new Date().toISOString(),
      };
      setDatos((d) => ({ ...d, actividades: [actividad, ...d.actividades] }));
      return actividad;
    },
    []
  );

  const actualizarActividad = useCallback((id: string, cambios: Partial<Actividad>) => {
    setDatos((d) => ({
      ...d,
      actividades: d.actividades.map((a) => (a.id === id ? { ...a, ...cambios, id: a.id } : a)),
    }));
  }, []);

  const eliminarActividad = useCallback((id: string) => {
    setDatos((d) => {
      const registros = d.registros.filter((r) => r.actividadId === id);
      const fotos = registros.flatMap((r) => r.fotos);
      if (fotos.length) void borrarFotos(fotos);
      return {
        ...d,
        actividades: d.actividades.filter((a) => a.id !== id),
        registros: d.registros.filter((r) => r.actividadId !== id),
      };
    });
  }, []);

  const añadirRegistro = useCallback(
    (base: Omit<Registro, "id" | "creado">): Registro => {
      const registro: Registro = {
        ...base,
        id: nuevoId("reg"),
        creado: new Date().toISOString(),
      };
      setDatos((d) => ({ ...d, registros: [...d.registros, registro] }));
      return registro;
    },
    []
  );

  const actualizarRegistro = useCallback((id: string, cambios: Partial<Registro>) => {
    setDatos((d) => ({
      ...d,
      registros: d.registros.map((r) => (r.id === id ? { ...r, ...cambios, id: r.id } : r)),
    }));
  }, []);

  const eliminarRegistro = useCallback((registro: Registro) => {
    if (registro.fotos.length) void borrarFotos(registro.fotos);
    setDatos((d) => ({ ...d, registros: d.registros.filter((r) => r.id !== registro.id) }));
  }, []);

  const cambiarMetas = useCallback((metas: Metas) => {
    setDatos((d) => ({ ...d, metas }));
  }, []);

  const actualizarConfig = useCallback((cambios: Partial<Config>) => {
    setConfig((c) => ({ ...c, ...cambios }));
  }, []);

  const cambiarTema = useCallback(() => {
    setTema((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  const restablecer = useCallback(() => {
    const limpio: Datos = { actividades: [], registros: [], metas: { voluntariado: 0, labor: 0 } };
    setDatos(limpio);
    setConfig({ ...CONFIG_DEFECTO });
  }, []);

  const cargarEjemplo = useCallback(() => {
    const ejemplo = datosIniciales();
    setDatos((d) => ({
      actividades: [...ejemplo.actividades, ...d.actividades],
      registros: [...ejemplo.registros, ...d.registros],
      metas: d.metas,
    }));
  }, []);

  const reemplazarTodo = useCallback((nuevo: Datos, configNueva?: Partial<Config>, temaNuevo?: Tema) => {
    setDatos(nuevo);
    if (configNueva) setConfig((c) => ({ ...c, ...configNueva }));
    if (temaNuevo) setTema(temaNuevo);
  }, []);

  return useMemo(
    () => ({
      datos,
      config,
      tema,
      añadirActividad,
      actualizarActividad,
      eliminarActividad,
      añadirRegistro,
      actualizarRegistro,
      eliminarRegistro,
      cambiarMetas,
      actualizarConfig,
      cambiarTema,
      restablecer,
      cargarEjemplo,
      reemplazarTodo,
      borrarTodo,
    }),
    [
      datos,
      config,
      tema,
      añadirActividad,
      actualizarActividad,
      eliminarActividad,
      añadirRegistro,
      actualizarRegistro,
      eliminarRegistro,
      cambiarMetas,
      actualizarConfig,
      cambiarTema,
      restablecer,
      cargarEjemplo,
      reemplazarTodo,
    ]
  );
}

export type ApiDatos = ReturnType<typeof useDatos>;
