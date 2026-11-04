import { LocalNotifications, type ScheduleOn } from "@capacitor/local-notifications";
import type { Config } from "../types";

/** Pide el permiso de notificaciones al sistema (diálogo nativo en Android 13+). */
export async function pedirPermisoNotificaciones(): Promise<boolean> {
  try {
    const res = await LocalNotifications.requestPermissions();
    return res.display === "granted";
  } catch {
    return false;
  }
}

/** ¿La app tiene permiso para mostrar notificaciones? */
export async function hayPermisoNotificaciones(): Promise<boolean> {
  try {
    const res = await LocalNotifications.checkPermissions();
    return res.display === "granted";
  } catch {
    return false;
  }
}

/** Cancela todos los recordatorios pendientes. */
export async function cancelarRecordatorios(): Promise<void> {
  try {
    const { notifications } = await LocalNotifications.getPending();
    if (notifications.length) {
      await LocalNotifications.cancel({
        notifications: notifications.map((n) => ({ id: n.id })),
      });
    }
  } catch {
    /* sin soporte: no hay nada que cancelar */
  }
}

/**
 * (Re)programa los recordatorios según la configuración:
 * - «semanal»: una notificación repetida por cada día de la semana elegido, a la hora fijada.
 * - «fecha»: una sola notificación en la fecha elegida a la hora fijada.
 * Siempre cancela lo anterior primero para no acumular avisos.
 */
export async function programarRecordatorios(
  config: Config,
  titulo: string,
  cuerpo: string
): Promise<void> {
  await cancelarRecordatorios();
  if (!config.notificaciones) return;
  try {
    const [hh, mm] = config.horaRecordatorio.split(":").map((n) => Number(n) || 0);
    const hora = Math.min(23, Math.max(0, hh));
    const minuto = Math.min(59, Math.max(0, mm));

    if (config.modoRecordatorio === "fecha") {
      if (!config.fechaRecordatorio) return;
      const [a, m, d] = config.fechaRecordatorio.split("-").map(Number);
      if (!a || !m || !d) return;
      const en = new Date(a, m - 1, d, hora, minuto, 0, 0);
      if (en.getTime() <= Date.now()) return; // fecha ya pasada: no se programa
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 9001,
            title: titulo,
            body: cuerpo,
            autoCancel: true,
            schedule: { at: en },
          },
        ],
      });
      return;
    }

    const dias = config.diasRecordatorio.length
      ? config.diasRecordatorio
      : [1, 2, 3, 4, 5, 6, 7];
    await LocalNotifications.schedule({
      notifications: dias.map((dia) => {
        const on: ScheduleOn = {
          weekday: dia as ScheduleOn["weekday"],
          hour: hora,
          minute: minuto,
          second: 0,
        };
        return {
          id: 9100 + dia,
          title: titulo,
          body: cuerpo,
          autoCancel: true,
          schedule: { on },
        };
      }),
    });
  } catch {
    /* permiso denegado u otro fallo: no revienta la app */
  }
}

/** Envía una notificación de prueba a los pocos segundos. */
export async function enviarPrueba(titulo: string, cuerpo: string): Promise<void> {
  await LocalNotifications.schedule({
    notifications: [
      {
        id: 9999,
        title: titulo,
        body: cuerpo,
        autoCancel: true,
        schedule: { at: new Date(Date.now() + 1500) },
      },
    ],
  });
}
