# Guía Rápida de Instalación

## Pasos Rápidos

### 1. MongoDB Atlas Setup (5 minutos)
```
1. Ir a https://www.mongodb.com/cloud/atlas
2. Crear cuenta gratuita
3. Crear cluster (M0 Free)
4. Database Access → Add New Database User → Crear usuario y password
5. Network Access → Add IP Address → 0.0.0.0/0 (Allow from anywhere)
6. Clusters → Connect → Connect your application → Copiar connection string
```

### 2. Configurar Backend
```bash
cd server
npm install
cp .env.example .env
# Editar .env con tu MongoDB URI
```

**Archivo .env:**
```
PORT=5000
MONGODB_URI=mongodb+srv://USUARIO:PASSWORD@cluster.mongodb.net/activos_db?retryWrites=true&w=majority
JWT_SECRET=mi_clave_secreta_super_segura_12345
JWT_EXPIRE=7d
```

### 3. Configurar Frontend
```bash
cd client
npm install
```

### 4. Iniciar Sistema

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### 5. Primer Acceso
```
1. Abrir http://localhost:3000
2. Hacer clic en "Registrarse"
3. Crear primer usuario admin
4. Ya puedes usar el sistema
```

## Comandos de Desarrollo

### Backend
```bash
# Iniciar servidor
cd server
npm start

# Modo desarrollo (con nodemon)
npm run dev
```

### Frontend
```bash
# Iniciar en desarrollo
cd client
npm run dev

# Compilar para producción
npm run build

# Vista previa de build
npm run preview
```

## Verificar Instalación

### Backend funcionando:
- Ir a http://localhost:5000
- Debe mostrar: `{"message":"API de Control de Activos - Transportes Moquegua"}`

### Frontend funcionando:
- Ir a http://localhost:3000
- Debe mostrar la pantalla de Login

## Problemas Comunes

### MongoDB no conecta
```
Error: MongoNetworkError
Solución: Verificar connection string y acceso de IP
```

### Puerto 5000 ocupado
```
Error: EADDRINUSE
Solución: Cambiar PORT en .env a otro puerto (ej: 5001)
```

### CORS error
```
Error: Access-Control-Allow-Origin
Solución: Verificar que backend esté en puerto 5000
```

## Estructura de Archivos Importante

```
project/
├── server/
│   ├── .env              # ← CREAR ESTE ARCHIVO
│   ├── .env.example      # ← USAR COMO PLANTILLA
│   ├── server.js
│   ├── models/
│   ├── routes/
│   └── middleware/
│
└── client/
    ├── src/
    ├── index.html
    └── vite.config.js
```

## Datos de Prueba

### Usuario Admin
```
Email: admin@transportesmoquegua.com
Password: admin123
```

### Agencias
```
- Tacna
- Moquegua
- Ilo
```

### Tipos de Activos
```
- Computadora
- Laptop
- Impresora
- Monitor
- Teclado
- Mouse
- Otro
```

## URLs del Sistema

| Servicio | URL | Descripción |
|----------|-----|-------------|
| API Backend | http://localhost:5000 | Servidor Express |
| API Docs | http://localhost:5000/api | Endpoints REST |
| Frontend | http://localhost:3000 | Aplicación React |

## Siguiente Paso

Una vez instalado, leer el archivo `README.md` para conocer todas las funcionalidades del sistema.
