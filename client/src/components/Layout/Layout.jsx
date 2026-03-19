import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

import logoEmpresa from '../../assets/logoTM2.jpg';

const Layout = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-brand">
          <img 
            src={logoEmpresa} 
            alt="Logo Moquegua" 
            className="img-logo-nav" 
          />
          <span className="brand-name">Transportes Moquegua</span>
        </div>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>

        <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          <NavLink to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
            Dashboard
          </NavLink>
          <NavLink to="/activos" className="nav-link" onClick={() => setMenuOpen(false)}>
            Activos
          </NavLink>
          <NavLink to="/personal" className="nav-link" onClick={() => setMenuOpen(false)}>
            Personal
          </NavLink>
          <NavLink to="/agencias" className="nav-link" onClick={() => setMenuOpen(false)}>
            Agencias
          </NavLink>
          <NavLink to="/asignaciones" className="nav-link" onClick={() => setMenuOpen(false)}>
            Asignaciones
          </NavLink>
          <NavLink to="/bajas" className="nav-link" onClick={() => setMenuOpen(false)}>
            Bajas
          </NavLink>
        </div>

        <div className="navbar-user">
          <span className="user-name">{user?.nombre}</span>
          <button onClick={logout} className="btn btn-secondary btn-sm">
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>

      {/* Marca de agua añadida al final */}
      <footer className="footer-watermark">
        Copyright © 2026 Ryan Russell Laura Chambilla
      </footer>
    </div>
  );
};

export default Layout;
