# sustema-de-inventario

Sistema de gestión de inventario para tienda de tecnología. Originalmente una
aplicación web (Vite + React 18 + TypeScript), empaquetada también como
aplicación de escritorio con Electron.

## Funcionalidades

- Dashboard con métricas
- Inventario (productos por categoría)
- Clientes
- Facturación
- Ventas
- Reportes
- Nombre de tienda personalizable

## Requisitos

- Node.js 18+ (probado con Node 22)

## Instalación

```bash
npm i
```

## Desarrollo

Modo web (navegador):

```bash
npm run dev
```

Modo escritorio (Vite + Electron con recarga):

```bash
npm run electron:dev
```

## Compilar el instalador de escritorio

```bash
npm run electron:build
```

Los artefactos se generan en `release/`:

- `Sistema de Inventario Setup 1.0.0.exe` (instalador NSIS)
- `Sistema de Inventario 1.0.0.exe` (versión portable)

## Persistencia de datos

- En la app de escritorio, los datos se guardan en:
  `%APPDATA%\Sistema de Inventario\inventario.json`
- En el navegador (`npm run dev`) se usa `localStorage`.

Se persisten productos, clientes, facturas y el nombre de la tienda.

## Nota sobre el empaquetado (antivirus en Windows)

En algunos equipos, el antivirus bloquea el renombrado de los binarios de
Electron durante el empaquetado y `electron-builder` falla con un error
`EPERM ... win-unpacked.tmp -> win-unpacked`.

Solución: pre-extraer Electron una vez y pasar su ruta con `--config.electronDist`:

```bash
npx electron-builder --win --config.electronDist=C:/ruta/a/electron-dist
```

También puedes excluir la carpeta del proyecto en el antivirus de Windows.
