# Kairós v1.2.0

**Aprovecha el momento, transforma tu entorno.**

Versión con notificaciones nativas reales y buscador de actualizaciones.

## Qué hay nuevo

- **Notificaciones que sí funcionan**: la app ahora **pide el permiso** con el diálogo
  nativo de Android al activar los recordatorios (antes mostraba «el dispositivo no admite
  notificaciones» porque usaba el método de navegador, que Android no soporta).
- **Elige cuándo avisarte**:
  - **Días de la semana**: selecciona los días que quieras (Dom…Sáb) y la hora del aviso.
  - **Fecha única**: elige una fecha concreta y la hora, y recibirás un solo aviso.
  - El aviso llega **aunque la app esté cerrada** (se programa en el sistema).
  - Botón **Probar notificación** para verificar al instante.
- **Actualizaciones**:
  - Botón **Buscar actualizaciones** en Ajustes → consulta la última versión publicada en
    GitHub. Si hay una nueva, pregunta: **Sí** → abre la descarga del APK e instálala;
    **No** → no hace nada.
  - **Chequeo automático una vez al día**, solo si hay internet, con el mismo aviso.
  - Se puede **desactivar** con el interruptor «Avisarme de actualizaciones»; si
    actualizas por tu cuenta, el interruptor se reactiva solo en la siguiente versión.
  - Si rechazas una versión, no vuelve a preguntar por esa misma versión.

## Instalación

1. Descarga `Kairos-1.2.0.apk` desde los assets de esta Release.
2. Instálala encima de la anterior: **conserva tus datos**.
3. Tus datos quedan guardados solo en el dispositivo (sin nube).

## Notas técnicas

- Paquete: `com.irvin.kairos` · versionCode 12000.
- Plugins nativos: `@capacitor/local-notifications` (permiso POST_NOTIFICATIONS y
  alarmas repetidas por día de la semana) y `@capacitor/browser` (descarga del APK).
- El repo es **público** para poder consultar las releases sin autenticación.
- Firmada con el keystore del proyecto (se conserva en los secretos del repositorio).
