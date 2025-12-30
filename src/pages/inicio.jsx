import React, { useState, useEffect } from 'react';  
import { motion, AnimatePresence } from 'framer-motion';  
import { LogOut, RefreshCw, Filter } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import FormularioDenuncia from '../components/FormularioDenuncia';  
import ListaDenuncias from '../components/ListaDenuncias';
import './p_inicio.css'; // Importar estilos específicos

const Inicio = ({ usuario }) => {
  const navigate = useNavigate();
  const [denuncias, setDenuncias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('todas');

  useEffect(() => {
    if (!auth.currentUser) {
      setCargando(false);
      return;
    }

    console.log('📡 Configurando listener de Firestore...');
    setError('');

    try {
      let q;
      
      if (filtro === 'mias') {
        q = query(
          collection(db, 'denuncias'),
          where('usuarioId', '==', auth.currentUser.uid),
          orderBy('fecharegistro', 'desc')
        );
      } else {
        q = query(
          collection(db, 'denuncias'),
          orderBy('fecharegistro', 'desc')
        );
      }

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          console.log('✅ Datos recibidos:', snapshot.size, 'documentos');
          
          const denunciasData = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            
            if (data.latitud && typeof data.latitud === 'object' && '_lat' in data.latitud) {
              data.latitud = data.latitud._lat;
            }
            if (data.longitud && typeof data.longitud === 'object' && '_long' in data.longitud) {
              data.longitud = data.longitud._long;
            }
            
            denunciasData.push({
              id: doc.id,
              ...data
            });
          });
          
          console.log('📦 Denuncias procesadas:', denunciasData);
          setDenuncias(denunciasData);
          setCargando(false);
        },
        (error) => {
          console.error('❌ Error al cargar denuncias:', error);
          setError(`Error al cargar denuncias: ${error.message}`);
          setCargando(false);
        }
      );

      return () => {
        console.log('🔌 Desconectando listener de Firestore');
        unsubscribe();
      };
    } catch (error) {
      console.error('❌ Error al configurar listener:', error);
      setError(`Error: ${error.message}`);
      setCargando(false);
    }
  }, [filtro]);

  const manejarAgregar = (nuevaDenuncia) => {
    console.log('➕ Nueva denuncia agregada:', nuevaDenuncia);
  };

  const handleCerrarSesion = async () => {
    try {
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const recargarDenuncias = () => {
    setCargando(true);
    setError('');
    setFiltro(filtro === 'todas' ? 'mias' : 'todas');
    setTimeout(() => setFiltro(filtro), 100);
  };

  if (usuario?.tipo !== 'ciudadano') {
    return (
      <div className="center-screen">
        <motion.div 
          className="access-denied"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="access-denied-icon">🚫</div>
          <h2 className="access-denied-title">Acceso Denegado</h2>
          <p className="access-denied-text">Esta página es exclusiva para ciudadanos registrados.</p>
        </motion.div>
      </div>
    );
  }

  return (  
    <div className="inicio-page">
      
      {/* Header con navegación */}
      <motion.header 
        className="inicio-header"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="site-container">
          <div className="header-content">
            {/* Logo / Brand */}
            <div className="header-brand">
              <div className="brand-logo">
                <span>R</span>
              </div>
              <h1 className="brand-title">Reporta</h1>
            </div>

            {/* User info & logout */}
            <div className="header-actions">
              {usuario && (
                <motion.div 
                  className="user-info"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="user-avatar">
                    <span>
                      {usuario.nombre?.charAt(0)}{usuario.apellido?.charAt(0)}
                    </span>
                  </div>
                  <div className="user-details">
                    <p className="user-name">
                      {usuario.nombre} {usuario.apellido}
                    </p>
                    <p className="user-role">Ciudadano</p>
                  </div>
                </motion.div>
              )}
              
              <button onClick={handleCerrarSesion} className="btn-logout">
                <LogOut size={18} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="site-container inicio-main">
        
        {/* Hero Section */}
        <motion.section
          className="hero-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="hero-title text-gradient">
            Reporta Problemas Urbanos
          </h2>
          <p className="hero-description">
            Ayuda a mejorar tu ciudad denunciando incidencias. Tu voz importa.
          </p>
        </motion.section>

        {/* Formulario de Denuncia */}
        <motion.section
          className="form-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="form-wrapper">
            <FormularioDenuncia onAgregarDenuncia={manejarAgregar} usuario={usuario} />
          </div>
        </motion.section>

        {/* Sección de Denuncias */}
        <motion.section
          className="denuncias-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          
          {/* Header con filtros */}
          <div className="denuncias-header">
            <div className="denuncias-info">
              <h3 className="denuncias-title">Denuncias Recientes</h3>
              <p className="denuncias-count">
                {denuncias.length} {filtro === 'todas' ? 'totales' : 'tuyas'}
              </p>
            </div>
            
            <div className="denuncias-controls">
              {/* Filtros */}
              <div className="filter-tabs">
                <button
                  onClick={() => setFiltro('todas')}
                  className={`filter-tab ${filtro === 'todas' ? 'active' : ''}`}
                >
                  <Filter size={16} />
                  <span>Todas</span>
                  <span className="filter-badge">{denuncias.length}</span>
                </button>
                
                <div className="filter-divider"></div>
                
                <button
                  onClick={() => setFiltro('mias')}
                  className={`filter-tab ${filtro === 'mias' ? 'active' : ''}`}
                >
                  Mis Denuncias
                </button>
              </div>

              {/* Botón recargar */}
              <button
                onClick={recargarDenuncias}
                disabled={cargando}
                className="btn-refresh"
                title="Recargar denuncias"
              >
                <RefreshCw size={18} className={cargando ? 'spinning' : ''} />
              </button>
            </div>
          </div>

          {/* Mensajes de Error */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                className="alert alert-error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="alert-content">
                  <p>{error}</p>
                  <button onClick={recargarDenuncias} className="alert-action">
                    Reintentar
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading State */}
          {cargando && (
            <motion.div
              className="loading-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '3px' }}></div>
              <p className="loading-text">Cargando denuncias...</p>
            </motion.div>
          )}

          {/* Empty State */}
          {!cargando && !error && denuncias.length === 0 && (
            <motion.div
              className="empty-state card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="empty-state-icon">📝</div>
              <h3 className="empty-state-title">
                {filtro === 'mias' ? 'No tienes denuncias aún' : 'No hay denuncias registradas'}
              </h3>
              <p className="empty-state-description">
                {filtro === 'mias' 
                  ? 'Crea tu primera denuncia usando el formulario de arriba'
                  : 'Sé el primero en reportar un problema en tu comunidad'
                }
              </p>
            </motion.div>
          )}

          {/* Lista de Denuncias */}
          {!cargando && !error && denuncias.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <ListaDenuncias denuncias={denuncias} filtro={filtro} />
            </motion.div>
          )}
          
        </motion.section>

      </main>

      {/* Footer */}
      <footer className="inicio-footer">
        <div className="site-container">
          <p className="footer-text">
            © {new Date().getFullYear()} Reporta. Mejorando nuestras ciudades juntos.
          </p>
        </div>
      </footer>

    </div>  
  );  
};  

export default Inicio;