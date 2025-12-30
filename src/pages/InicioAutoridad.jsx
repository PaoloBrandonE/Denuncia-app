import React, { useState, useEffect } from 'react';  
import { motion } from 'framer-motion';  
import { LogOut, ClipboardList, CheckCircle, Clock, AlertCircle, MapPin, User, TrendingUp, Search, Calendar, Image as ImageIcon } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import './p_inicio_autoridad.css';

const InicioAutoridad = ({ usuario }) => {
  const navigate = useNavigate();
  const [denuncias, setDenuncias] = useState([]);
  const [filtro, setFiltro] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actualizando, setActualizando] = useState(null);

  useEffect(() => {
    cargarDenunciasEnTiempoReal();
  }, []);

  const cargarDenunciasEnTiempoReal = () => {
    try {
      const q = query(collection(db, 'denuncias'), orderBy('fecharegistro', 'desc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log('📡 Datos recibidos (Autoridad):', snapshot.size, 'documentos');
        
        const denunciasData = [];
        snapshot.forEach((doc) => {
          const rawData = doc.data();
          const cleanData = { ...rawData };
          
          if (cleanData.latitud && typeof cleanData.latitud === 'object' && '_lat' in cleanData.latitud) {
            cleanData.latitud = cleanData.latitud._lat;
          }
          if (cleanData.longitud && typeof cleanData.longitud === 'object' && '_long' in cleanData.longitud) {
            cleanData.longitud = cleanData.longitud._long;
          }
          
          denunciasData.push({
            id: doc.id,
            ...cleanData
          });
        });
        
        setDenuncias(denunciasData);
        setLoading(false);
      }, (error) => {
        console.error('❌ Error al cargar denuncias:', error);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('❌ Error al configurar listener:', error);
      setLoading(false);
    }
  };

  const cambiarEstado = async (denunciaId, nuevoEstado) => {
    setActualizando(denunciaId);
    try {
      await updateDoc(doc(db, 'denuncias', denunciaId), {
        estado: nuevoEstado,
        fechaActualizacion: new Date().toISOString()
      });
      
      console.log('✅ Estado actualizado:', denunciaId, '→', nuevoEstado);
    } catch (error) {
      console.error('❌ Error al actualizar estado:', error);
      alert('Error al actualizar la denuncia: ' + error.message);
    } finally {
      setActualizando(null);
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

  if (usuario?.tipo !== 'autoridad') {
    return (
      <div className="center-screen">
        <motion.div 
          className="access-denied"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="access-denied-icon">🚫</div>
          <h2 className="access-denied-title">Acceso Denegado</h2>
          <p className="access-denied-text">Esta página es exclusiva para autoridades.</p>
        </motion.div>
      </div>
    );
  }

  let denunciasFiltradas = denuncias.filter(d => {
    if (filtro === 'todas') return true;
    return (d.estado || 'pendiente') === filtro;
  });

  if (searchTerm) {
    denunciasFiltradas = denunciasFiltradas.filter(d =>
      (d.titulo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (d.descripcion?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (d.nombreUsuario?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  }

  const estadisticas = {
    total: denuncias.length,
    pendientes: denuncias.filter(d => (d.estado || 'pendiente') === 'pendiente').length,
    enProceso: denuncias.filter(d => d.estado === 'en_proceso').length,
    resueltas: denuncias.filter(d => d.estado === 'resuelto').length
  };

  const categorias = {};
  denuncias.forEach(d => {
    const cat = d.categoria || 'otro';
    if (!categorias[cat]) {
      categorias[cat] = { total: 0, pendientes: 0, enProceso: 0, resueltas: 0 };
    }
    categorias[cat].total++;
    const estado = d.estado || 'pendiente';
    if (estado === 'pendiente') categorias[cat].pendientes++;
    else if (estado === 'en_proceso') categorias[cat].enProceso++;
    else if (estado === 'resuelto') categorias[cat].resueltas++;
  });

  const formatearFecha = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString('es-PE', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      }
      return new Date(timestamp).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="center-screen">
        <div className="loading-state">
          <div className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '3px' }}></div>
          <p className="loading-text">Cargando denuncias...</p>
        </div>
      </div>
    );
  }

  return (  
    <div className="autoridad-page">
      {/* Header */}
      <header className="autoridad-header">
        <div className="header-container">
          <div className="header-brand">
            <div className="brand-icon-autoridad">
              <User size={32} />
            </div>
            <div className="brand-info-autoridad">
              <h1 className="brand-title-autoridad">Panel de Autoridad</h1>
              <p className="brand-subtitle">Bienvenido, {usuario.nombre} {usuario.apellido}</p>
            </div>
          </div>
          <button onClick={handleCerrarSesion} className="btn-logout">
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </header>

      <main className="autoridad-main">
        {/* Stats Grid */}
        <div className="stats-grid">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="stat-card stat-blue"
          >
            <div className="stat-content">
              <div className="stat-text">
                <p className="stat-label">Total Denuncias</p>
                <p className="stat-value">{estadisticas.total}</p>
              </div>
              <ClipboardList className="stat-icon" size={48} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="stat-card stat-yellow"
          >
            <div className="stat-content">
              <div className="stat-text">
                <p className="stat-label">Pendientes</p>
                <p className="stat-value">{estadisticas.pendientes}</p>
              </div>
              <AlertCircle className="stat-icon" size={48} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="stat-card stat-orange"
          >
            <div className="stat-content">
              <div className="stat-text">
                <p className="stat-label">En Proceso</p>
                <p className="stat-value">{estadisticas.enProceso}</p>
              </div>
              <Clock className="stat-icon" size={48} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="stat-card stat-green"
          >
            <div className="stat-content">
              <div className="stat-text">
                <p className="stat-label">Resueltas</p>
                <p className="stat-value">{estadisticas.resueltas}</p>
              </div>
              <CheckCircle className="stat-icon" size={48} />
            </div>
          </motion.div>
        </div>

        {/* Charts Grid */}
        <div className="charts-grid">
          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="card chart-card"
          >
            <h2 className="chart-title">
              <TrendingUp className="title-icon" size={24} />
              Distribución por Estado
            </h2>
            <div className="chart-pie-container">
              <div className="pie-chart-wrapper">
                <svg viewBox="0 0 100 100" className="pie-chart">
                  {(() => {
                    const total = estadisticas.total || 1;
                    const pendientesAngle = (estadisticas.pendientes / total) * 360;
                    const procesoAngle = (estadisticas.enProceso / total) * 360;
                    const resueltasAngle = (estadisticas.resueltas / total) * 360;
                    
                    let currentAngle = 0;
                    
                    const createArc = (angle, color) => {
                      const start = currentAngle;
                      currentAngle += angle;
                      const end = currentAngle;
                      
                      const startRad = (start * Math.PI) / 180;
                      const endRad = (end * Math.PI) / 180;
                      
                      const x1 = 50 + 40 * Math.cos(startRad);
                      const y1 = 50 + 40 * Math.sin(startRad);
                      const x2 = 50 + 40 * Math.cos(endRad);
                      const y2 = 50 + 40 * Math.sin(endRad);
                      
                      const largeArc = angle > 180 ? 1 : 0;
                      
                      return (
                        <path
                          d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                          fill={color}
                          className="pie-slice"
                        />
                      );
                    };
                    
                    return (
                      <>
                        {estadisticas.pendientes > 0 && createArc(pendientesAngle, '#EAB308')}
                        {estadisticas.enProceso > 0 && createArc(procesoAngle, '#F97316')}
                        {estadisticas.resueltas > 0 && createArc(resueltasAngle, '#22C55E')}
                        <circle cx="50" cy="50" r="25" fill="white" />
                        <text x="50" y="50" textAnchor="middle" dy="0.3em" fontSize="14" fill="#1F2937" fontWeight="bold">
                          {estadisticas.total}
                        </text>
                      </>
                    );
                  })()}
                </svg>
              </div>
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color legend-yellow"></div>
                <span className="legend-label">Pendientes</span>
                <span className="legend-value">{estadisticas.pendientes}</span>
              </div>
              <div className="legend-item">
                <div className="legend-color legend-orange"></div>
                <span className="legend-label">En Proceso</span>
                <span className="legend-value">{estadisticas.enProceso}</span>
              </div>
              <div className="legend-item">
                <div className="legend-color legend-green"></div>
                <span className="legend-label">Resueltas</span>
                <span className="legend-value">{estadisticas.resueltas}</span>
              </div>
            </div>
          </motion.div>

          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="card chart-card"
          >
            <h2 className="chart-title">Denuncias por Categoría</h2>
            <div className="bar-chart">
              {Object.entries(categorias).map(([cat, stats]) => (
                <div key={cat} className="bar-item">
                  <div className="bar-header">
                    <span className="bar-label">{cat}</span>
                    <span className="bar-total">{stats.total}</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill">
                      <div
                        className="bar-segment bar-yellow"
                        style={{ width: `${(stats.pendientes / stats.total) * 100}%` }}
                        title={`Pendientes: ${stats.pendientes}`}
                      ></div>
                      <div
                        className="bar-segment bar-orange"
                        style={{ width: `${(stats.enProceso / stats.total) * 100}%` }}
                        title={`En proceso: ${stats.enProceso}`}
                      ></div>
                      <div
                        className="bar-segment bar-green"
                        style={{ width: `${(stats.resueltas / stats.total) * 100}%` }}
                        title={`Resueltas: ${stats.resueltas}`}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card filters-card"
        >
          <div className="filters-container">
            <div className="filters-left">
              <h2 className="filters-title">Filtrar Denuncias</h2>
              <div className="filter-buttons">
                {['todas', 'pendiente', 'en_proceso', 'resuelto'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFiltro(f)}
                    className={`filter-btn ${filtro === f ? 'active' : ''}`}
                  >
                    {f === 'todas' ? 'Todas' : f.charAt(0).toUpperCase() + f.slice(1).replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
            <div className="search-box">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Buscar denuncias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </motion.div>

        {/* Denuncias Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card denuncias-card"
        >
          <h2 className="denuncias-title">
            Denuncias ({denunciasFiltradas.length})
          </h2>
          <div className="denuncias-grid">
            {denunciasFiltradas.map((denuncia, index) => (
              <motion.div
                key={denuncia.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="denuncia-card"
              >
                {/* Image */}
                <div className="denuncia-image">
                  {denuncia.imagenURL || denuncia.imagenBase64 ? (
                    <img
                      src={denuncia.imagenURL || denuncia.imagenBase64}
                      alt={denuncia.titulo}
                    />
                  ) : (
                    <div className="no-image">
                      <ImageIcon size={48} />
                    </div>
                  )}
                  <span className={`status-badge status-${
                    denuncia.estado === 'resuelto' ? 'green' :
                    denuncia.estado === 'en_proceso' ? 'orange' : 'yellow'
                  }`}>
                    {(denuncia.estado || 'pendiente').toUpperCase()}
                  </span>
                </div>

                {/* Content */}
                <div className="denuncia-content">
                  <h3 className="denuncia-title">{denuncia.titulo}</h3>
                  <p className="denuncia-description">{denuncia.descripcion}</p>

                  <div className="denuncia-meta">
                    <div className="meta-item">
                      <User size={14} />
                      <span>{denuncia.nombreUsuario || 'Anónimo'}</span>
                    </div>
                    <div className="meta-item">
                      <Calendar size={14} />
                      <span>{formatearFecha(denuncia.fecharegistro)}</span>
                    </div>
                    {(denuncia.latitud || denuncia.ubicacion) && (
                      <div className="meta-item">
                        <MapPin size={14} />
                        <span>
                          {denuncia.latitud ? `${denuncia.latitud.toFixed(4)}, ${denuncia.longitud.toFixed(4)}` : denuncia.ubicacion}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {denuncia.estado !== 'resuelto' && (
                    <div className="denuncia-actions">
                      {(denuncia.estado === 'pendiente' || !denuncia.estado) && (
                        <button
                          onClick={() => cambiarEstado(denuncia.id, 'en_proceso')}
                          disabled={actualizando === denuncia.id}
                          className="action-btn action-orange"
                        >
                          {actualizando === denuncia.id ? '...' : 'En Proceso'}
                        </button>
                      )}
                      <button
                        onClick={() => cambiarEstado(denuncia.id, 'resuelto')}
                        disabled={actualizando === denuncia.id}
                        className="action-btn action-green"
                      >
                        {actualizando === denuncia.id ? '...' : 'Resolver'}
                      </button>
                    </div>
                  )}
                  
                  {denuncia.estado === 'resuelto' && (
                    <div className="resolved-badge">
                      <CheckCircle size={16} />
                      <span>Caso resuelto</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {denunciasFiltradas.length === 0 && (
            <div className="empty-state">
              <ClipboardList className="empty-icon" size={80} />
              <p className="empty-text">No hay denuncias que coincidan</p>
            </div>
          )}
        </motion.div>
      </main>
    </div>  
  );  
};  

export default InicioAutoridad;