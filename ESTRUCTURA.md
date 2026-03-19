# Estructura del Proyecto

## Vista General

```
project/
├── README.md                    # Documentación completa
├── INSTALL.md                   # Guía rápida de instalación
├── ESTRUCTURA.md               # Este archivo
├── .gitignore                  # Archivos ignorados por git
│
├── server/                     # BACKEND (Node.js + Express + MongoDB)
│   ├── package.json            # Dependencias del backend
│   ├── .env.example            # Plantilla de variables de entorno
│   ├── .gitignore              # Ignorar node_modules y .env
│   ├── server.js               # Servidor principal de Express
│   │
│   ├── models/                 # Modelos de MongoDB (Mongoose)
│   │   ├── User.js             # Modelo de usuarios (auth)
│   │   ├── Activo.js           # Modelo de activos
│   │   ├── Personal.js         # Modelo de empleados
│   │   ├── Agencia.js          # Modelo de agencias/sedes
│   │   ├── Asignacion.js       # Modelo de asignaciones
│   │   └── Baja.js             # Modelo de bajas de activos
│   │
│   ├── routes/                 # Rutas de la API REST
│   │   ├── auth.js             # POST /register, /login, GET /me
│   │   ├── activos.js          # CRUD de activos
│   │   ├── personal.js         # CRUD de personal
│   │   ├── agencias.js         # CRUD de agencias
│   │   ├── asignaciones.js     # CRUD + devolver activo
│   │   └── bajas.js            # CRUD de bajas
│   │
│   └── middleware/             # Middleware personalizado
│       └── auth.js             # Verificación de JWT
│
└── client/                     # FRONTEND (React + Vite)
    ├── package.json            # Dependencias del frontend
    ├── vite.config.js          # Configuración de Vite
    ├── index.html              # HTML principal
    ├── .gitignore              # Ignorar node_modules y dist
    │
    └── src/
        ├── main.jsx            # Punto de entrada de React
        ├── App.jsx             # Componente raíz con rutas
        ├── index.css           # Estilos globales
        │
        ├── context/            # Context API de React
        │   └── AuthContext.jsx # Estado global de autenticación
        │
        ├── services/           # Servicios externos
        │   └── api.js          # Cliente Axios configurado
        │
        ├── components/         # Componentes reutilizables
        │   ├── Auth/
        │   │   ├── Login.jsx           # Pantalla de login
        │   │   ├── Register.jsx        # Pantalla de registro
        │   │   ├── ProtectedRoute.jsx  # HOC para rutas protegidas
        │   │   └── Auth.css            # Estilos de auth
        │   │
        │   ├── Layout/
        │   │   ├── Layout.jsx          # Layout principal con navbar
        │   │   └── Layout.css          # Estilos del layout
        │   │
        │   └── Reportes/
        │       ├── CartaDeCargo.jsx    # Componente de reporte
        │       └── CartaDeCargo.css    # Estilos para impresión
        │
        └── pages/              # Páginas principales
            ├── Dashboard.jsx   # Vista de estadísticas
            ├── Activos.jsx     # CRUD de activos con filtros
            ├── Personal.jsx    # CRUD de personal
            ├── Agencias.jsx    # CRUD de agencias
            ├── Asignaciones.jsx # CRUD de asignaciones + reportes
            └── Bajas.jsx       # CRUD de bajas
```

## Conteo de Archivos

### Backend (14 archivos)
- 1 servidor principal
- 6 modelos de datos
- 6 rutas de API
- 1 middleware de autenticación

### Frontend (18 archivos)
- 1 punto de entrada
- 1 componente raíz
- 1 context de autenticación
- 1 servicio API
- 7 componentes
- 6 páginas
- 1 archivo de estilos globales

### Documentación (3 archivos)
- README.md (completo)
- INSTALL.md (guía rápida)
- ESTRUCTURA.md (este archivo)

## Total: 35 archivos de código + 3 de documentación

## Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (React)                           │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Login/     │───▶│    Context   │───▶│   Protected  │  │
│  │   Register   │    │     Auth     │    │    Routes    │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                              │                               │
│                              ▼                               │
│                      ┌──────────────┐                        │
│                      │   api.js     │                        │
│                      │   (Axios)    │                        │
│                      └──────────────┘                        │
└───────────────────────────┬─────────────────────────────────┘
                            │
                    Bearer Token (JWT)
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                  SERVIDOR (Express)                          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   CORS +     │───▶│  Middleware  │───▶│    Rutas     │  │
│  │   JSON       │    │     Auth     │    │     API      │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                  │            │
│                                                  ▼            │
│                                          ┌──────────────┐    │
│                                          │   Modelos    │    │
│                                          │  (Mongoose)  │    │
│                                          └──────────────┘    │
└─────────────────────────────────────────────┬───────────────┘
                                              │
                                              ▼
                                    ┌──────────────────┐
                                    │  MongoDB Atlas   │
                                    │   (Base de Datos)│
                                    └──────────────────┘
```

## Flujo de Autenticación

```
1. Usuario → Register/Login → POST /api/auth/register o /api/auth/login
2. Servidor → Valida credenciales → bcrypt.compare(password)
3. Servidor → Genera token → jwt.sign({ id: user._id })
4. Servidor → Devuelve token + datos usuario
5. Cliente → Guarda token → localStorage.setItem('token')
6. Cliente → Incluye token → Authorization: Bearer <token>
7. Servidor → Verifica token → Middleware auth.js
8. Servidor → Permite acceso → req.user = usuario autenticado
```

## Tecnologías por Capa

### Backend
| Tecnología | Uso |
|------------|-----|
| Express.js | Servidor web y rutas |
| Mongoose | ODM para MongoDB |
| bcryptjs | Hash de contraseñas |
| jsonwebtoken | Autenticación JWT |
| cors | Permitir peticiones cross-origin |
| dotenv | Variables de entorno |

### Frontend
| Tecnología | Uso |
|------------|-----|
| React 18 | Librería UI |
| React Router DOM v6 | Enrutamiento |
| Axios | Cliente HTTP |
| Context API | Estado global |
| Vite | Bundler y dev server |

### Base de Datos
| Tecnología | Uso |
|------------|-----|
| MongoDB Atlas | Base de datos en la nube |
| Mongoose | Esquemas y validaciones |

## Endpoints de la API

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | /api/auth/register | Registrar usuario | No |
| POST | /api/auth/login | Iniciar sesión | No |
| GET | /api/auth/me | Usuario actual | Sí |
| GET | /api/activos | Listar activos | Sí |
| POST | /api/activos | Crear activo | Sí |
| PUT | /api/activos/:id | Actualizar activo | Sí |
| DELETE | /api/activos/:id | Eliminar activo | Sí |
| GET | /api/personal | Listar personal | Sí |
| POST | /api/personal | Crear personal | Sí |
| PUT | /api/personal/:id | Actualizar personal | Sí |
| DELETE | /api/personal/:id | Eliminar personal | Sí |
| GET | /api/agencias | Listar agencias | Sí |
| POST | /api/agencias | Crear agencia | Sí |
| PUT | /api/agencias/:id | Actualizar agencia | Sí |
| DELETE | /api/agencias/:id | Eliminar agencia | Sí |
| GET | /api/asignaciones | Listar asignaciones | Sí |
| POST | /api/asignaciones | Crear asignación | Sí |
| PUT | /api/asignaciones/:id/devolver | Devolver activo | Sí |
| DELETE | /api/asignaciones/:id | Eliminar asignación | Sí |
| GET | /api/bajas | Listar bajas | Sí |
| POST | /api/bajas | Registrar baja | Sí |
| DELETE | /api/bajas/:id | Eliminar baja | Sí |

## Rutas del Frontend

| Ruta | Componente | Protegida | Descripción |
|------|-----------|-----------|-------------|
| /login | Login | No | Pantalla de inicio de sesión |
| /register | Register | No | Pantalla de registro |
| / | Dashboard | Sí | Estadísticas generales |
| /activos | Activos | Sí | Gestión de activos |
| /personal | Personal | Sí | Gestión de personal |
| /agencias | Agencias | Sí | Gestión de agencias |
| /asignaciones | Asignaciones | Sí | Gestión de asignaciones |
| /bajas | Bajas | Sí | Registro de bajas |

## Estados de Activos

```
┌──────────────┐
│  DISPONIBLE  │ ──────────┐
└──────────────┘           │
       ▲                   │ Nueva Asignación
       │                   ▼
       │            ┌──────────────┐
  Devolución       │   ASIGNADO   │
       │            └──────────────┘
       │                   │
       │                   │ Registrar Baja
       └───────────────────┼────────────────┐
                           │                │
                           ▼                ▼
                    ┌──────────────┐  ┌──────────────┐
                    │   DE BAJA    │  │   DE BAJA    │
                    └──────────────┘  └──────────────┘
```

## Dependencias

### Backend (package.json)
```json
{
  "express": "^4.18.2",
  "mongoose": "^7.6.3",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1"
}
```

### Frontend (package.json)
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.18.0",
  "axios": "^1.6.0",
  "vite": "^5.0.0",
  "@vitejs/plugin-react": "^4.2.0"
}
```
