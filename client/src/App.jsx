import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Activos from './pages/Activos';
import Personal from './pages/Personal';
import Agencias from './pages/Agencias';
import Asignaciones from './pages/Asignaciones';
import Bajas from './pages/Bajas';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="activos" element={<Activos />} />
            <Route path="personal" element={<Personal />} />
            <Route path="agencias" element={<Agencias />} />
            <Route path="asignaciones" element={<Asignaciones />} />
            <Route path="bajas" element={<Bajas />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
