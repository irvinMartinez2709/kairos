# Kairós — Registro del proyecto

**Lema:** «Aprovecha el momento, transforma tu entorno.»

App móvil (web-first) para registrar horas de **voluntariado** y **labor social**, con metas
editables, actividades con color propio, fotos, notas y dos gráficas de dona.

---

## Estado actual

| Fase | Estado |
|---|---|
| Web (Vite + React + TS + Tailwind) | ✅ Completa y probada |
| PWA (manifest + iconos) | ✅ Instalable |
| Reporte PDF | ✅ Generación por ventana de impresión |
| Respaldo JSON con fotos | ✅ Exportar / importar |
| i18n español / inglés | ✅ Traducción completa (194 cadenas) |
| APK Android (Capacitor + GitHub Actions) | ✅ v1.0.0 publicada e instalada |

## Funcionalidad

- **Inicio**: progreso de las dos metas (barras), dos gráficas de dona, resumen por actividad,
  últimos registros y contadores. Metas editables desde la misma pantalla.
- **Actividades**: CRUD completo, búsqueda, filtro por tipo, color propio editable, emoji,
  lugar y descripción.
- **Registros** (dentro de cada actividad): CRUD completo con fecha, hora de llegada/salida,
  notas y hasta varias fotos. La salida antes de la llegada cuenta como cambio de día.
- **Regla de tiempo**: siempre se muestran **horas enteras + minutos (00–59)**; nunca decimales.
  En formato 12 h se usa `a. m./p. m.` en español y `AM/PM` en inglés.
- **Ajustes**: tema claro/oscuro, 9 paletas + color personalizado, emojis color/grises/ocultos,
  formato 12/24 h, idioma, metas, colores de gráficas, recordatorio diario (notificación local),
  exportar/importar respaldo, reporte PDF, cargar ejemplo y borrar todo.
- **Extras**: splash, doble retroceso para salir en Android, toasts y diálogos propios,
  ayuda/FAQ, acerca de, almacenamiento local sin nube.

## Datos de ejemplo

Actividad **«Ecomural los milagros de Jesús»** (voluntariado) con 7 sesiones = **26 h 50 min**
(14, 16, 19, 21, 23, 24 y 28 de octubre de 2026).

## Estructura

```
Web 2/
├─ referencia_logo.png
├─ registro.md
└─ web/
   ├─ src/
   │  ├─ App.tsx                 # navegación, acciones globales, botón atrás
   │  ├─ i18n.ts                 # diccionario ES/EN y hook useT
   │  ├─ types.ts                # tipos + presets de color
   │  ├─ components/             # Inicio, Actividades, detalle, editores, ajustes, ui
   │  └─ lib/
   │     ├─ horas.ts             # formatoHM, duraciones, fechas (regla de minutos)
   │     ├─ estadisticas.ts      # totales, resumen, porciones de las donas
   │     ├─ almacen.ts           # claves kairos.*, seed, migraciones
   │     ├─ respaldo.ts          # exportar/importar JSON con fotos
   │     ├─ fotos.ts             # compresión + IndexedDB (kairos-fotos)
   │     ├─ reporte.ts           # HTML del reporte PDF (ES/EN)
   │     └─ colores.ts           # contraste y colores legibles por tema
   ├─ public/logo.svg, logo-icono.svg, iconos/ (PWA)
   ├─ capacitor.config.ts        # appId com.irvin.kairos
   └─ .gitignore
```

## Cómo ejecutar

```bash
cd web
npm install
npm run dev -- --port 5199      # desarrollo
npm run build                   # tsc + vite build (genera dist/)
```

## Persistencia

- `localStorage` con claves versionadas `kairos.*` (datos, configuración, tema, idioma, metas).
- Fotos comprimidas (JPEG ~1280 px, calidad 0.72) en IndexedDB `kairos-fotos`, con respaldo
  embebido en el JSON al exportar.
- `normalizarDatos()` migra versiones antiguas sin perder información.

## Pruebas realizadas

Playwright (430×932, móvil):

- Navegación por las tres secciones, alta de actividad «Reciclaje» (ambos), alta de registro.
- Metas 40 h / 80 h: voluntariado 32 h 15 min (81 %), labor 2 h 40 min (3 %), restantes 7 h 45 min
  y 77 h 20 min correctos.
- Foto subida y recuperada desde IndexedDB; reporte PDF (ES y EN); exportar + importar respaldo;
  cambio a inglés; tema oscuro; ayuda; acerca de; borrar todo.
- Verificación visual en inglés de Inicio, Actividades y detalle (etiquetas, fechas largas
  `October 14, 2026` y horas `9:00 AM – 12:30 PM`); en español siguen `14 de octubre de 2026`
  y `8:00 a. m.`
- `npx tsc --noEmit` sin errores y `npm run build` correcto; cero errores de consola.

## Publicación Android (v1.0.0)

- **Repo**: https://github.com/irvinMartinez2709/kairos (privado).
- **Release**: `Kairós v1.0.0` con el asset `Kairos-1.0.0.apk` (versionCode **10000**, ~3.1 MB).
- **Workflow** `.github/workflows/build-android.yml` (se dispara en push a `main` o manualmente):
  `npm ci` → `npm run build` → `npx cap add android` → `npx cap sync android` → versión desde
  `web/package.json` (`MAJOR*10000 + MINOR*100 + PATCH`) → `assembleRelease` → GitHub Release
  con las notas de `web/RELEASE.md`.
- **Firma**: el keystore se genera **una sola vez** con `.github/workflows/keystore.yml` y vive
  en los secretos del repositorio (`KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`), con copia
  local en `ks/` (ignorada por git). Si faltan los secretos, el CI compila con firma debug.
- **Verificado por adb** en Redmi `2409BRN2CL`: `versionCode=10000`, `versionName=1.0.0`,
  arranque correcto y sin `FATAL` en logcat; datos de ejemplo visibles.

### Para publicar una versión nueva
1. Subir la versión en `web/package.json` (y la entrada raíz de `package-lock.json`) y actualizar
   `web/RELEASE.md`.
2. `git add …` → `git commit -m "feat: …"` → `git push origin main`.
3. Esperar el run de **Build Android APK**; aparece la Release con el APK.
4. `adb install -r apk\Kairos-X.Y.Z.apk` (conserva datos: misma firma y versionCode mayor).

## Pendiente

- Ajustes finos que solo se pueden calibrar en el dispositivo: recordatorio diario con
  notificaciones locales (hoy muestra el aviso mientras la app está abierta) y pruebas de
  doble retroceso para salir.
- Verificar la instalación como PWA desde el navegador (icono y splash).
