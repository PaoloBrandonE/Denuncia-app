import React, { useState, useEffect } from 'react';  
import { motion } from 'framer-motion';  
import { LogOut, Users, FileText, BarChart3, Shield, Check, X, LayoutDashboard, UserCheck, ClipboardList, Menu, X as CloseIcon } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import './p_inicio_admin.css';

const InicioAdmin = ({ usuario }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [estadisticas, setEstadisticas] = useState({
    totalUsuarios: 0,
    totalDenuncias: 0,
    denunciasPendientes: 0,
    denunciasResueltas: 0,
    denunciasAprobadas: 0,
    denunciasRechazadas: 0
  });
  const [usuarios, setUsuarios] = useState([]);
  const [denuncias, setDenuncias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const usuariosSnap = await getDocs(collection(db, "usuarios"));
      const usuariosData = usuariosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsuarios(usuariosData);

      const denunciasSnap = await getDocs(query(collection(db, "denuncias"), orderBy("fecharegistro", "desc")));
      const denunciasData = denunciasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDenuncias(denunciasData);

      setEstadisticas({
        totalUsuarios: usuariosData.length,
        totalDenuncias: denunciasData.length,
        denunciasPendientes: denunciasData.filter(d => d.estado === 'pendiente').length,
        denunciasResueltas: denunciasData.filter(d => d.estado === 'resuelta').length,
        denunciasAprobadas: denunciasData.filter(d => d.estado === 'aprobada').length,
        denunciasRechazadas: denunciasData.filter(d => d.estado === 'rechazada').length
      });

      setLoading(false);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setLoading(false);
    }
  };

  const aprobarDenuncia = async (id) => {
    try {
      await updateDoc(doc(db, "denuncias", id), { estado: 'aprobada' });
      cargarDatos();
    } catch (error) {
      console.error("Error al aprobar denuncia:", error);
    }
  };

  const rechazarDenuncia = async (id) => {
    try {
      await updateDoc(doc(db, "denuncias", id), { estado: 'rechazada' });
      cargarDatos();
    } catch (error) {
      console.error("Error al rechazar denuncia:", error);
    }
  };

  const handleCerrarSesion = async () => {
    try {
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (loading) {
    return (
      <div className="center-screen">
        <div className="loading-state">
          <div className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '3px' }}></div>
          <p className="loading-text">Cargando panel administrativo...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'usuarios', label: 'Usuarios', icon: UserCheck },
    { id: 'denuncias', label: 'Denuncias', icon: ClipboardList }
  ];

  return (  
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-icon">
              <Shield size={24} />
            </div>
            <div className="brand-info">
              <h2 className="brand-name">Admin Panel</h2>
              <p className="brand-user">{usuario.nombre}</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="sidebar-close"
          >
            <CloseIcon size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                >
                  <tab.icon size={20} />
                  <span>{tab.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleCerrarSesion} className="btn-logout-sidebar">
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <button
              onClick={() => setSidebarOpen(true)}
              className="menu-toggle"
            >
              <Menu size={24} />
            </button>
            <h1 className="page-title">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h1>
          </div>
        </header>

        <div className="admin-content">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="dashboard-view"
            >
              {/* Stats Grid */}
              <div className="stats-grid">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="stat-card stat-blue"
                >
                  <div className="stat-content">
                    <div className="stat-text">
                      <p className="stat-label">Usuarios</p>
                      <p className="stat-value">{estadisticas.totalUsuarios}</p>
                    </div>
                    <Users className="stat-icon" size={40} />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="stat-card stat-green"
                >
                  <div className="stat-content">
                    <div className="stat-text">
                      <p className="stat-label">Denuncias</p>
                      <p className="stat-value">{estadisticas.totalDenuncias}</p>
                    </div>
                    <FileText className="stat-icon" size={40} />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="stat-card stat-yellow"
                >
                  <div className="stat-content">
                    <div className="stat-text">
                      <p className="stat-label">Pendientes</p>
                      <p className="stat-value">{estadisticas.denunciasPendientes}</p>
                    </div>
                    <BarChart3 className="stat-icon" size={40} />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="stat-card stat-purple"
                >
                  <div className="stat-content">
                    <div className="stat-text">
                      <p className="stat-label">Resueltas</p>
                      <p className="stat-value">{estadisticas.denunciasResueltas}</p>
                    </div>
                    <Shield className="stat-icon" size={40} />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="stat-card stat-emerald"
                >
                  <div className="stat-content">
                    <div className="stat-text">
                      <p className="stat-label">Aprobadas</p>
                      <p className="stat-value">{estadisticas.denunciasAprobadas}</p>
                    </div>
                    <Check className="stat-icon" size={40} />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="stat-card stat-red"
                >
                  <div className="stat-content">
                    <div className="stat-text">
                      <p className="stat-label">Rechazadas</p>
                      <p className="stat-value">{estadisticas.denunciasRechazadas}</p>
                    </div>
                    <X className="stat-icon" size={40} />
                  </div>
                </motion.div>
              </div>

              {/* Summary */}
              <div className="card summary-card">
                <h3 className="summary-title">Resumen del Sistema</h3>
                <p className="summary-text">
                  Bienvenido al panel de administración. Aquí puedes gestionar usuarios y denuncias. 
                  Usa las pestañas laterales para navegar entre secciones.
                </p>
              </div>
            </motion.div>
          )}

          {/* Usuarios */}
          {activeTab === 'usuarios' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card table-card"
            >
              <h2 className="table-title">
                <Users className="title-icon" size={24} />
                Usuarios Registrados
              </h2>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>DNI</th>
                      <th>Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((user) => (
                      <tr key={user.id}>
                        <td className="font-medium">{user.nombre} {user.apellido}</td>
                        <td>{user.email}</td>
                        <td>{user.dni}</td>
                        <td>
                          <span className={`badge badge-${
                            user.tipo === 'admin' ? 'red' :
                            user.tipo === 'autoridad' ? 'blue' :
                            'green'
                          }`}>
                            {user.tipo}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Denuncias */}
          {activeTab === 'denuncias' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card table-card"
            >
              <h2 className="table-title">
                <FileText className="title-icon" size={24} />
                Gestión de Denuncias
              </h2>
              <div className="table-wrapper">
                <table className="data-table denuncias-table">
                  <thead>
                    <tr>
                      <th>Título</th>
                      <th>Descripción</th>
                      <th>Categoría</th>
                      <th>Usuario</th>
                      <th>Ubicación</th>
                      <th>Foto</th>
                      <th>Estado</th>
                      <th>Fecha</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {denuncias.map((denuncia) => (
                      <tr key={denuncia.id}>
                        <td className="font-medium">{denuncia.titulo}</td>
                        <td className="truncate-cell" title={denuncia.descripcion}>
                          {denuncia.descripcion}
                        </td>
                        <td>{denuncia.categoria}</td>
                        <td>{denuncia.usuarioNombre}</td>
                        <td>
                          {denuncia.ubicacion
                            ? (denuncia.ubicacion.latitude !== undefined
                                ? `${denuncia.ubicacion.latitude.toFixed(4)}, ${denuncia.ubicacion.longitude.toFixed(4)}`
                                : (typeof denuncia.ubicacion.lat === 'number' && typeof denuncia.ubicacion.lng === 'number'
                                    ? `${denuncia.ubicacion.lat.toFixed(4)}, ${denuncia.ubicacion.lng.toFixed(4)}`
                                    : 'N/A'))
                            : 'N/A'}
                        </td>
                        <td>
                          {denuncia.foto ? (
                            <img
                              src={denuncia.foto}
                              alt="Foto de la denuncia"
                              className="denuncia-photo"
                            />
                          ) : (
                            <span className="no-photo">Sin foto</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge badge-${
                            denuncia.estado === 'resuelta' || denuncia.estado === 'aprobada' ? 'green' :
                            denuncia.estado === 'rechazada' ? 'red' :
                            denuncia.estado === 'en_proceso' ? 'blue' :
                            'yellow'
                          }`}>
                            {denuncia.estado || 'pendiente'}
                          </span>
                        </td>
                        <td>
                          {denuncia.fecharegistro?.toDate?.()?.toLocaleDateString() || 'N/A'}
                        </td>
                        <td>
                          {denuncia.estado === 'pendiente' && (
                            <div className="action-buttons">
                              <button
                                onClick={() => aprobarDenuncia(denuncia.id)}
                                className="btn-action btn-approve"
                              >
                                <Check size={14} />
                                <span>Aprobar</span>
                              </button>
                              <button
                                onClick={() => rechazarDenuncia(denuncia.id)}
                                className="btn-action btn-reject"
                              >
                                <X size={14} />
                                <span>Rechazar</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>  
  );  
};  

export default InicioAdmin;