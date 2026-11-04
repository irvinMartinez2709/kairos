# Kairós v1.1.0

**Aprovecha el momento, transforma tu entorno.**

Versión de correcciones basada en tus comentarios al probar la app en el teléfono.

## Qué se corrige

- **Exportar respaldo**: ahora abre la hoja de guardado de Android (administrador de
  archivos / compartir), en vez de no hacer nada. *La importación no se tocó: sigue igual.*
- **Reporte PDF**: ya **no se abre en el navegador**. La app muestra una **vista previa
  dentro de la app** con botones **Descargar PDF** y **Cerrar**. Al descargar se genera
  el archivo PDF real (resumen, tablas y detalle) y se abre la hoja para guardarlo o
  compartirlo.
- **Icono de la app**: se genera el icono real de Kairós (reloj de arena con planta) para
  todos los tamaños de pantalla, en lugar del icono genérico.
- **Splash**: se mantiene en pantalla **2.5 segundos** antes de entrar a la app, con un
  fundido de salida suave.
- **Color de la app**: al cambiarlo en Ajustes ahora se recolorea **toda la paleta**:
  fondos, tarjetas, bordes, textos secundarios, barra de navegación, selección de texto
  y la pantalla de bienvenida.

## Instalación

1. Descarga `Kairos-1.1.0.apk` desde los assets de esta Release.
2. Si vienes de la 1.0.0, instálala encima: **conserva tus datos**.
3. Tus datos quedan guardados solo en el dispositivo (sin nube).

## Notas técnicas

- Paquete: `com.irvin.kairos` · versionCode 11000.
- Firmada con el keystore del proyecto (se conserva en los secretos del repositorio).
