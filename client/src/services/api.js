import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// INTERCEPTOR DE PETICIÓN: Se ejecuta ANTES de cada llamada a la API
api.interceptors.request.use(
  (config) => {
    // Buscamos el token más reciente en el localStorage justo antes de enviar
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// INTERCEPTOR DE RESPUESTA: Maneja errores como el 401 (Token expirado o inválido)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Si el servidor dice que no estamos autorizados, limpiamos y redirigimos
      localStorage.removeItem('token');
      // Evitamos redirecciones infinitas si ya estamos en el login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
