import { createContext, useContext, useMemo } from "react";
import type { Idioma } from "./types";

/** Las claves son el texto en español; si falta traducción se muestra el español. */
const EN: Record<string, string> = {
  Inicio: "Home",
  Actividades: "Activities",
  Ajustes: "Settings",
  Resumen: "Summary",
  Voluntariado: "Volunteering",
  "Labor social": "Community service",
  Ambos: "Both",
  Guardar: "Save",
  Cancelar: "Cancel",
  Eliminar: "Delete",
  Editar: "Edit",
  Cerrar: "Close",
  Añadir: "Add",
  Buscar: "Search",
  Volver: "Back",
  Listo: "Done",
  Aceptar: "OK",
  "Horas registradas": "Hours logged",
  Meta: "Goal",
  Faltan: "Remaining",
  "Nueva actividad": "New activity",
  "Registrar horas": "Log hours",
  "Nuevo registro": "New entry",
  Fecha: "Date",
  "Hora de llegada": "Start time",
  "Hora de salida": "End time",
  Duración: "Duration",
  Notas: "Notes",
  Fotos: "Photos",
  "Añadir foto": "Add photo",
  "Quitar foto": "Remove photo",
  "Anterior": "Previous",
  "Siguiente": "Next",
  "Datos y respaldo": "Data & backup",
  "Exportar datos": "Export data",
  "Importar datos": "Import data",
  "Borrar todo": "Erase everything",
  Apariencia: "Appearance",
  "Tema claro": "Light theme",
  "Tema oscuro": "Dark theme",
  Idioma: "Language",
  "Acerca de": "About",
  Ayuda: "Help",
  Versión: "Version",
  "Meta de horas": "Hours goal",
  "Color de la actividad": "Activity color",
  "Sin registros todavía": "No entries yet",
  Todas: "All",
  "Ver detalle": "View details",
  Semana: "Week",
  Mes: "Month",
  Total: "Total",
  "Cerrar sesión": "Sign out",
  Restablecer: "Reset",
  Guardado: "Saved",
  Eliminado: "Deleted",

  // Diálogos y avisos
  "¿Borrar todos los datos?": "Erase all data?",
  "¿Cargar actividad de ejemplo?": "Load sample activity?",
  "¿Importar respaldo?": "Import backup?",
  "¿Eliminar actividad?": "Delete activity?",
  "¿Eliminar registro?": "Delete entry?",
  "¡Meta de labor social completada!": "Community service goal reached!",
  "¡Meta de voluntariado completada!": "Volunteering goal reached!",
  "No se puede deshacer": "This can't be undone",
  "Los datos actuales se reemplazarán por los del archivo.":
    "Current data will be replaced by the file's data.",
  "Se borrarán las horas, notas y fotos de este registro.":
    "This entry's hours, notes and photos will be erased.",
  "Se agregará Ecomural los milagros de Jesús con sus 7 registros.":
    "Ecomural los milagros de Jesús will be added with its 7 entries.",
  "Agrega de nuevo Ecomural los milagros de Jesús":
    "Add Ecomural los milagros de Jesús again",

  // Actividades y registros
  actividad: "activity",
  actividades: "activities",
  registro: "entry",
  "Actividad creada": "Activity created",
  "Actividad actualizada": "Activity updated",
  "Actividad eliminada": "Activity deleted",
  "Registro actualizado": "Entry updated",
  "Registro eliminado": "Entry deleted",
  "Editar actividad": "Edit activity",
  "Editar registro": "Edit entry",
  "Agregar": "Add",
  "Agregar otra actividad": "Add another activity",
  "Añadir otra actividad": "Add another activity",
  "Aún no hay actividades": "No activities yet",
  "Aún no tienes actividades": "You don't have any activities yet",
  "Crea tu primera actividad para empezar a registrar horas.":
    "Create your first activity to start logging hours.",
  "Crea una actividad como Ecomural o Reciclaje y agrégale tus horas.":
    "Create an activity like Ecomural or Recycling and add your hours.",
  "¿De qué trata esta actividad?": "What is this activity about?",
  "¿Qué hiciste? Materiales, personas, avances…":
    "What did you do? Materials, people, progress…",
  "Agrega fotos de la actividad": "Add photos of the activity",
  "Agrega tu primera sesión de esta actividad.":
    "Add your first session for this activity.",
  "Buscar actividad o lugar…": "Search activity or place…",
  "Descripción": "Description",
  "El aviso se muestra mientras la app está abierta en el dispositivo.":
    "The reminder shows while the app is open on the device.",
  "Elige una actividad": "Choose an activity",
  "Elige una fecha": "Choose a date",
  "Escribe un nombre para la actividad": "Enter a name for the activity",
  "Ej. Ecomural, Reciclaje, Visita al asilo…":
    "e.g. Ecomural, Recycling, Nursing home visit…",
  "La hora de salida debe ser distinta a la de llegada":
    "End time must be different from start time",
  "La salida es antes de la llegada: se contará como cambio de día.":
    "End time is before start time: it will be counted as a next-day shift.",
  "Las horas de esta actividad cuentan para las dos metas.":
    "This activity's hours count toward both goals.",
  "Las horas solo cuentan para la meta de labor social.":
    "Hours only count toward the community service goal.",
  "Las horas solo cuentan para la meta de voluntariado.":
    "Hours only count toward the volunteering goal.",
  "Los minutos siempre se muestran entre 00 y 59.":
    "Minutes are always shown between 00 and 59.",
  "Lugar": "Place",
  "Nombre de la actividad": "Activity name",
  "Nueva": "New",
  "Opcional": "Optional",
  "Son más de 16 horas. Revisa las horas antes de guardar.":
    "That's more than 16 hours. Check the times before saving.",
  "Subiendo…": "Uploading…",
  "Tipo": "Type",
  "Últimos registros": "Latest entries",
  "Ver todas": "See all",
  "Registros": "Entries",
  "foto": "photo",
  "No se pudo agregar la foto": "Couldn't add the photo",
  "No se pudo importar": "Couldn't import",
  "No se pudo leer el archivo": "Couldn't read the file",
  "Respaldo descargado": "Backup downloaded",
  "Respaldo importado": "Backup imported",
  "Respaldo guardado": "Backup saved",
  "No se pudo exportar el respaldo": "Couldn't export the backup",
  "Reporte de horas": "Hours report",
  "Vista previa del reporte": "Report preview",
  "Descargar PDF": "Download PDF",
  "Generando…": "Generating…",
  "Reporte guardado": "Report saved",
  "Reporte descargado": "Report downloaded",
  "No se pudo generar el PDF": "Couldn't generate the PDF",
  "Datos borrados": "Data erased",
  "Ejemplo agregado": "Sample added",
  "Sin resultados": "No results",
  "Prueba con otro filtro o cambia la búsqueda.":
    "Try another filter or change your search.",

  // Metas y progreso
  "Definir meta": "Set goal",
  "Editar meta": "Edit goal",
  "Escribe la cantidad de horas que necesitas cumplir.":
    "Enter the number of hours you need to complete.",
  "Faltan {n} para la meta": "{n} left to reach the goal",
  "Horas faltantes": "Hours remaining",
  "Horas totales": "Total hours",
  "Horas": "Hours",
  "Minutos": "Minutes",
  "Progreso": "Progress",
  "Promedio": "Average",
  "Por actividad": "By activity",
  "Metas de horas": "Hours goals",
  "Sin meta definida": "No goal set",
  "Sin meta definida todavía": "No goal set yet",
  "Atajos de horas": "Hour shortcuts",

  // Ajustes
  "Almacenamiento": "Storage",
  "Aplicación": "App",
  "Archivo JSON con actividades, horas y fotos":
    "JSON file with activities, hours and photos",
  "Borrar todos los datos": "Erase all data",
  "Cambiar tema": "Change theme",
  "Cargar actividad de ejemplo": "Load sample activity",
  "Claro": "Light",
  "Color": "Color",
  "Color de la app": "App color",
  "Color personalizado": "Custom color",
  "Colores de las gráficas": "Chart colors",
  "Consejo": "Tip",
  "Cada actividad conserva su propio color en la gráfica de pastel.":
    "Each activity keeps its own color in the pie chart.",
  "Exportar respaldo": "Export backup",
  "Formato de hora": "Time format",
  "Generar reporte PDF": "Generate PDF report",
  "Grises": "Grays",
  "Hecho con cariño para tu servicio": "Made with care for your service",
  "Hora del aviso": "Reminder time",
  "Icono": "Icon",
  "Importar": "Import",
  "Importar respaldo": "Import backup",
  "Información": "Information",
  "Local, sin nube": "Local, no cloud",
  "Ocultos": "Hidden",
  "Oscuro": "Dark",
  "Personaliza Kairós a tu manera": "Customize Kairós your way",
  "Plataforma": "Platform",
  "Primero activa los recordatorios": "Turn on reminders first",
  "Probar notificación": "Test notification",
  "Recordatorio activado": "Reminder enabled",
  "Recordatorio diario": "Daily reminder",
  "Recordatorios": "Reminders",
  "Recuerda registrar tus horas de hoy.": "Remember to log today's hours.",
  "Avisa si aún no registras horas en el día.":
    "Reminds you if you haven't logged hours today.",
  "Este dispositivo no admite notificaciones":
    "This device doesn't support notifications",
  "Permiso de notificaciones denegado": "Notification permission denied",
  "Restaura un archivo exportado antes":
    "Restore a previously exported file",
  "Resumen y detalle listo para imprimir": "Summary and details ready to print",
  "Tema": "Theme",
  "Todo lo que necesitas para registrar tus horas":
    "Everything you need to log your hours",
  "Acerca de Kairós": "About Kairós",
  "Ayuda y preguntas frecuentes": "Help & FAQ",
  "Diseño y desarrollo": "Design & development",
  "Emojis": "Emojis",
  "Aprovecha el momento, transforma tu entorno.":
    "Seize the moment, transform your surroundings.",
  "Pulsa atrás otra vez para salir": "Press back again to exit",

  // Textos compuestos
  "Actividad": "Activity",
  "total": "total",
  "registros": "entries",
  "fotos": "photos",
  "Kairós nació para ordenar las horas de voluntariado y labor social: cada actividad con su color, sus fotos y su propio avance.":
    "Kairós was born to organize your volunteering and community service hours: every activity with its own color, photos and progress.",
  "Las actividades marcadas como «Ambos» suman sus horas a las dos metas al mismo tiempo.":
    "Activities marked as “Both” add their hours to both goals at the same time.",
  "Pon 0 si todavía no tienes una meta: la gráfica mostrará solo las horas que llevas.":
    "Set 0 if you don't have a goal yet: the chart will only show the hours you've logged.",
  "Se borrarán también sus {n} registros y fotos. Esta acción no se puede deshacer.":
    "Its {n} entries and photos will also be erased. This can't be undone.",
  "Se eliminarán todas las actividades, registros y fotos. Esta acción no se puede deshacer.":
    "All activities, entries and photos will be erased. This can't be undone.",
  "registra tus horas el mismo día. Así no olvidas notas ni fotos y el resumen siempre está al día.":
    "log your hours the same day. That way you won't forget notes or photos and your summary stays up to date.",

  // v1.2.0 — recordatorios nativos y actualizaciones
  "Días de la semana": "Days of the week",
  "Fecha única": "One-time date",
  Días: "Days",
  Dom: "Sun",
  Lun: "Mon",
  Mar: "Tue",
  Mié: "Wed",
  Jue: "Thu",
  Vie: "Fri",
  Sáb: "Sat",
  "Elige al menos un día": "Pick at least one day",
  "Fecha del aviso": "Reminder date",
  "Las notificaciones se muestran aunque la app esté cerrada.":
    "Notifications show even when the app is closed.",
  "Notificación de prueba enviada": "Test notification sent",
  Actualizaciones: "Updates",
  "Avisarme de actualizaciones": "Notify me about updates",
  "Consulta si hay una versión nueva una vez al día, solo con internet.":
    "Checks for a new version once a day, only when online.",
  "Buscar actualizaciones": "Check for updates",
  "Versión actual": "Current version",
  "No se pudo buscar. Revisa tu conexión.": "Couldn't check. Check your connection.",
  "Estás en la última versión": "You're on the latest version",
  "Nueva versión disponible": "New version available",
  "Hay una versión nueva de Kairós ({v}). ¿Descargar e instalarla ahora?":
    "A new version of Kairós ({v}) is available. Download and install it now?",
  Sí: "Yes",
  No: "No",
};

export function traducir(
  idioma: Idioma,
  clave: string,
  vars?: Record<string, string | number>
): string {
  let texto = idioma === "en" ? EN[clave] || clave : clave;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      texto = texto.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return texto;
}

export const CtxIdioma = createContext<Idioma>("es");

export function useT() {
  const idioma = useContext(CtxIdioma);
  return useMemo(
    () =>
      (clave: string, vars?: Record<string, string | number>): string =>
        traducir(idioma, clave, vars),
    [idioma]
  );
}

export function useIdioma(): Idioma {
  return useContext(CtxIdioma);
}
