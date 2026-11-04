# Kairós v1.0.0

**Aprovecha el momento, transforma tu entorno.**

Primera versión pública de Kairós, tu bitácora de horas de voluntariado y labor social.

## Qué incluye

- **Metas editables** de voluntariado y labor social con barras de progreso y faltantes.
- **Dos gráficas de dona** (una por tipo) con color propio editable por actividad y color
  para las horas restantes.
- **Actividades completas** (CRUD): nombre, tipo *voluntariado / labor social / ambos*, emoji,
  lugar, descripción y color. Búsqueda y filtros.
- **Registros por actividad** (CRUD): fecha, hora de llegada y salida, notas y varias fotos
  comprimidas. La salida antes de la llegada cuenta como cambio de día.
- **Regla de tiempo**: siempre horas enteras + minutos de 00 a 59 (nunca decimales).
- **Reporte PDF** listo para imprimir, en español o inglés.
- **Respaldo** exportable/importable en JSON con las fotos incluidas.
- **Apariencia**: tema claro/oscuro, 9 paletas, emojis en color/gris/oculto, formato 12/24 h.
- **Recordatorio diario** con notificación local.
- **Idioma**: español e inglés.
- Splash, doble retroceso para salir, ayuda/FAQ y acerca de.

## Instalación

1. Descarga `Kairos-1.0.0.apk` desde los assets de esta Release.
2. Ábrelo en tu teléfono y permite la instalación de fuentes desconocidas si te lo pide.
3. Tus datos quedan guardados solo en el dispositivo (sin nube).

## Notas técnicas

- Paquete: `com.irvin.kairos` · versionCode 10000.
- Firmada con el keystore del proyecto (se conserva en los secretos del repositorio).
- Actualizaciones futuras se instalan encima conservando datos.
