# Sistema de Control de Activos - Transportes Moquegua

Sistema completo de gestión de activos con autenticación JWT, Node.js + Express + MongoDB + React.

## Características

### Autenticación
- Login y registro con JWT
- Middleware de protección de rutas
- Gestión de sesiones con localStorage
- Protected Routes en React

### Módulos de Negocio
- **Activos**: CRUD completo con estados (Disponible, Asignado, De Baja)
- **Personal**: Gestión de empleados con asignación de agencias
- **Agencias**: Sedes de Tacna, Moquegua e Ilo
- **Asignaciones**: Asignación de activos a personal con actualización automática de estados
- **Bajas**: Registro de activos fuera de servicio con motivos y autorización
- **Reportes**: Generación de Carta de Cargo lista para imprimir

### Dashboard
- Estadísticas en tiempo real
- Contadores de activos por estado
- Vista general del sistema

## Estructura del Proyecto

```
project/
├── server/                 # Backend (Node.js + Express)
│   ├── models/            # Modelos de MongoDB
│   │   ├── User.js
│   │   ├── Activo.js
│   │   ├── Personal.js
│   │   ├── Agencia.js
│   │   ├── Asignacion.js
│   │   └── Baja.js
│   ├── routes/            # Rutas de la API
│   │   ├── auth.js
│   │   ├── activos.js
│   │   ├── personal.js
│   │   ├── agencias.js
│   │   ├── asignaciones.js
│   │   └── bajas.js
│   ├── middleware/        # Middleware de autenticación
│   │   └── auth.js
│   ├── server.js          # Servidor principal
│   ├── package.json
│   └── .env.example       # Variables de entorno
│
└── client/                # Frontend (React + Vite)
    ├── src/
    │   ├── components/    # Componentes React
    │   │   ├── Auth/
    │   │   ├── Layout/
    │   │   └── Reportes/
    │   ├── pages/         # Páginas principales
    │   ├── context/       # Context API para autenticación
    │   ├── services/      # API client
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

## Instalación

### Requisitos Previos
- Node.js (v16 o superior)
- MongoDB Atlas (cuenta gratuita)
- npm o yarn

### 1. Configurar MongoDB Atlas

1. Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crear un nuevo cluster (opción gratuita M0)
3. Crear un usuario de base de datos:
   - Database Access → Add New Database User
   - Guardar usuario y contraseña
4. Permitir acceso desde cualquier IP:
   - Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)
5. Obtener connection string:
   - Clusters → Connect → Connect your application
   - Copiar el connection string (ejemplo: `mongodb+srv://usuario:password@cluster.mongodb.net/`)

### 2. Configurar Backend

```bash
cd server

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env

# Editar .env con tus credenciales
nano .env
```

Configurar el archivo `.env`:
```
PORT=5000
MONGODB_URI=mongodb+srv://TU_USUARIO:TU_PASSWORD@cluster.mongodb.net/activos_db?retryWrites=true&w=majority
JWT_SECRET=tu_clave_secreta_cambiala_en_produccion_12345
JWT_EXPIRE=7d
```

**IMPORTANTE**: Reemplazar `TU_USUARIO` y `TU_PASSWORD` con tus credenciales de MongoDB Atlas.

### 3. Configurar Frontend

```bash
cd client

# Instalar dependencias
npm install
```

### 4. Iniciar el Sistema

**Terminal 1 - Backend:**
```bash
cd server
npm start
# El servidor iniciará en http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
# La aplicación iniciará en http://localhost:3000
```

## Primer Uso

### Crear el primer usuario

1. Ir a http://localhost:3000
2. Hacer clic en "Registrarse"
3. Completar el formulario:
   - Nombre: Admin
   - Email: admin@transportesmoquegua.com
   - Rol: Administrador
   - Contraseña: (mínimo 6 caracteres)
4. Hacer clic en "Registrarse"

El sistema te redirigirá automáticamente al Dashboard.

### Flujo de Trabajo Recomendado

1. **Crear Agencias** (Tacna, Moquegua, Ilo)
   - Ir a "Agencias" → "+ Nueva Agencia"
   - Completar información de cada sede

2. **Registrar Personal**
   - Ir a "Personal" → "+ Nuevo Personal"
   - Asignar a una agencia
   - Ingresar DNI, cargo y datos de contacto

3. **Registrar Activos**
   - Ir a "Activos" → "+ Nuevo Activo"
   - Ingresar código único, nombre, tipo
   - Especificar marca, modelo, serie
   - Asignar a una agencia

4. **Crear Asignaciones**
   - Ir a "Asignaciones" → "+ Nueva Asignación"
   - Seleccionar activo (solo disponibles)
   - Seleccionar personal
   - El activo cambiará automáticamente a estado "Asignado"

5. **Generar Carta de Cargo**
   - En "Asignaciones", hacer clic en "Carta de Cargo"
   - Imprimir o guardar como PDF

6. **Registrar Bajas**
   - Ir a "Bajas" → "+ Registrar Baja"
   - Seleccionar activo
   - Especificar motivo y descripción
   - El activo cambiará a estado "De Baja"

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual (requiere token)

### Activos
- `GET /api/activos` - Listar todos
- `GET /api/activos/:id` - Obtener uno
- `POST /api/activos` - Crear (requiere auth)
- `PUT /api/activos/:id` - Actualizar (requiere auth)
- `DELETE /api/activos/:id` - Eliminar (requiere auth)

### Personal
- `GET /api/personal` - Listar todos (requiere auth)
- `POST /api/personal` - Crear (requiere auth)
- `PUT /api/personal/:id` - Actualizar (requiere auth)
- `DELETE /api/personal/:id` - Eliminar (requiere auth)

### Agencias
- `GET /api/agencias` - Listar todas (requiere auth)
- `POST /api/agencias` - Crear (requiere auth)
- `PUT /api/agencias/:id` - Actualizar (requiere auth)
- `DELETE /api/agencias/:id` - Eliminar (requiere auth)

### Asignaciones
- `GET /api/asignaciones` - Listar todas (requiere auth)
- `POST /api/asignaciones` - Crear (requiere auth)
- `PUT /api/asignaciones/:id/devolver` - Devolver activo (requiere auth)
- `DELETE /api/asignaciones/:id` - Eliminar (requiere auth)

### Bajas
- `GET /api/bajas` - Listar todas (requiere auth)
- `POST /api/bajas` - Crear (requiere auth)
- `DELETE /api/bajas/:id` - Eliminar (requiere auth)

## Autenticación

Todas las rutas excepto `/api/auth/register` y `/api/auth/login` requieren autenticación.

Para hacer peticiones autenticadas, incluir el header:
```
Authorization: Bearer <token>
```

El token se obtiene al hacer login o registro.

## Tecnologías Utilizadas

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- bcryptjs (hash de contraseñas)
- jsonwebtoken (JWT)
- cors

### Frontend
- React 18
- React Router DOM v6
- Axios
- Vite
- Context API

## Características de Seguridad

- Contraseñas hasheadas con bcrypt
- Autenticación JWT con expiración
- Protected Routes en frontend
- Middleware de autenticación en backend
- Validación de datos en modelos
- CORS habilitado

## Solución de Problemas

### Error de conexión a MongoDB
- Verificar que el connection string sea correcto
- Verificar que la IP esté permitida en Network Access
- Verificar que el usuario tenga permisos correctos

### Error CORS
- Verificar que el backend esté corriendo en puerto 5000
- Verificar configuración de proxy en vite.config.js

### Token inválido o expirado
- Cerrar sesión y volver a iniciar sesión
- Verificar que JWT_SECRET sea el mismo en .env

## Licencia

Desarrollo personalizado para Transportes Moquegua.

## Soporte

Para soporte técnico, contactar al administrador del sistema.
