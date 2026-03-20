# LicoSys UI

Frontend web de LicoSys desarrollado con React, TypeScript y Vite. Este proyecto consume la API `LicoSys.API` para autenticacion, gestion de inventario, ventas, compras, clientes, reportes y notificaciones en tiempo real.

## Descripcion

LicoSys UI es una aplicacion SPA orientada a la gestion operativa de una licoreria o negocio de inventario y ventas. La interfaz esta organizada por modulos y controla el acceso segun el rol autenticado del usuario.

Roles contemplados:

- `Administrador`
- `Vendedor`
- `Consulta`

## Caracteristicas principales

- Inicio de sesion con JWT.
- Control de acceso por autenticacion y roles.
- Dashboard con indicadores del negocio.
- Gestion de productos, categorias, proveedores y clientes.
- Registro de compras y ventas.
- Punto de venta (`Ventas POS`).
- Modulo de reportes.
- Exportacion de datos.
- Integracion con notificaciones en tiempo real mediante SignalR.

## Tecnologias

- React 19
- TypeScript
- Vite
- React Router DOM
- Axios
- Ant Design
- Bootstrap
- Tailwind CSS
- Recharts / Nivo
- SignalR Client
- jsPDF / xlsx

## Requisitos

- Node.js 20 o superior recomendado
- npm 10 o superior
- `LicoSys.API` ejecutandose localmente o en un entorno accesible

## Instalacion

```bash
npm install
```

## Variables de entorno

El frontend usa la variable `VITE_API_URL` para definir la URL base de la API.

Crea un archivo `.env` en la raiz del proyecto:

```env
VITE_API_URL=http://localhost:5242/api
```

Si no se define, el proyecto usa por defecto:

```txt
http://localhost:5242/api
```

## Ejecucion en desarrollo

```bash
npm run dev
```

La aplicacion quedara disponible normalmente en:

```txt
http://localhost:5173
```

## Compilacion para produccion

```bash
npm run build
```

## Vista previa del build

```bash
npm run preview
```

## Lint

```bash
npm run lint
```

## Estructura del proyecto

```txt
src/
  api/           Cliente HTTP y endpoints por modulo
  assets/        Recursos estaticos
  components/    Componentes reutilizables
  context/       Contextos globales como autenticacion
  hooks/         Hooks personalizados
  interfaces/    Tipos e interfaces
  pages/         Pantallas por modulo
  routes/        Rutas protegidas y navegacion
  utils/         Utilidades de sesion, formatos y exportacion
```

## Flujo de autenticacion

1. El usuario inicia sesion desde la pantalla de login.
2. La API responde con un token JWT y datos del usuario.
3. El token se guarda en `localStorage`.
4. Axios adjunta automaticamente el token en cada solicitud.
5. Las rutas se habilitan o restringen segun autenticacion y rol.

## Modulos funcionales

- `Auth`: login y cambio obligatorio de contrasena.
- `Dashboard`: resumen general del negocio.
- `Productos`: catalogo y control de stock.
- `Categorias`: administracion de categorias.
- `Proveedores`: gestion de proveedores.
- `Clientes`: gestion de clientes.
- `Compras`: registro de entradas al inventario.
- `Ventas`: ventas generales y punto de venta.
- `Reportes`: consultas operativas y gerenciales.
- `Backup`: integracion con el modulo de respaldo del backend.

## Integracion con la API

Este proyecto espera que `LicoSys.API` exponga:

- Autenticacion JWT
- Endpoints REST bajo `/api`
- Hub SignalR en `/hubs/notificaciones`
- Politica CORS habilitada para `http://localhost:5173`

## Scripts disponibles

- `npm run dev`: levanta el servidor de desarrollo.
- `npm run build`: genera el build de produccion.
- `npm run preview`: previsualiza el build.
- `npm run lint`: ejecuta ESLint.

## Relacion con el backend

Este frontend trabaja junto con el proyecto `LicoSys.API`. Para el funcionamiento completo del sistema, ambos proyectos deben estar configurados y ejecutandose correctamente.

## Recomendaciones de despliegue

- Configurar `VITE_API_URL` segun el entorno.
- Servir el build generado desde un servidor web o proxy inverso.
- Asegurar que la API permita el origen del frontend en CORS.
- Verificar conectividad con el hub de SignalR si se usan notificaciones.

## Autor

Proyecto academico / empresarial LicoSys.
