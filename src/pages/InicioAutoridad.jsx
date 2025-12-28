import React, { useState, useEffect } from 'react';  
import { motion, AnimatePresence } from 'framer-motion';  
import { LogOut, ClipboardList, CheckCircle, Clock, AlertCircle, MapPin, User, TrendingUp, Timer, Search, X, Calendar, Image as ImageIcon } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, updateDoc, doc, onSnapshot } from 'firebase/firestore';

const InicioAutoridad = ({ usuario }) => {
  const navigate = useNavigate();
  const [denuncias, setDenuncias] = useState([]);
  const [filtro, setFiltro] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [denunciaSeleccionada, setDenunciaSeleccionada] = useState(null);
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
          
          // Limpiar GeoPoints
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
      setDenunciaSeleccionada(null);
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

  // Verificar que el usuario sea autoridad
  if (usuario?.tipo !== 'autoridad') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">Esta página es solo para autoridades.</p>
        </div>
      </div>
    );
  }

  let denunciasFiltradas = denuncias.filter(d => {
    if (filtro === 'todas') return true;
    return (d.estado || 'pendiente') === filtro;
  });

  // Aplicar búsqueda
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

  // Calcular estadísticas de efectividad
  const tasaResolucion = estadisticas.total > 0 ? Math.round((estadisticas.resueltas / estadisticas.total) * 100) : 0;

  // Estadísticas por categoría
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando denuncias...</p>
        </div>
      </div>
    );
  }

  return (  
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-xl">
              <User className="text-green-600" size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Panel de Autoridad</h1>
              <p className="text-sm text-gray-600">Bienvenido, {usuario.nombre} {usuario.apellido}</p>
            </div>
          </div>
          <button
            onClick={handleCerrarSesion}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Denuncias</p>
                <p className="text-4xl font-bold text-gray-800 mt-2">{estadisticas.total}</p>
              </div>
              <ClipboardList className="text-blue-500" size={48} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-yellow-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pendientes</p>
                <p className="text-4xl font-bold text-gray-800 mt-2">{estadisticas.pendientes}</p>
              </div>
              <AlertCircle className="text-yellow-500" size={48} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-orange-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">En Proceso</p>
                <p className="text-4xl font-bold text-gray-800 mt-2">{estadisticas.enProceso}</p>
              </div>
              <Clock className="text-orange-500" size={48} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-green-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Resueltas</p>
                <p className="text-4xl font-bold text-gray-800 mt-2">{estadisticas.resueltas}</p>
              </div>
              <CheckCircle className="text-green-500" size={48} />
            </div>
          </motion.div>
        </div>

        {/* Gráficos de estado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico circular de estados */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-2xl shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <TrendingUp className="text-purple-600" size={24} />
              Distribución por Estado
            </h2>
            <div className="flex items-center justify-center">
              <div className="relative w-64 h-64">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
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
                          className="transition-all duration-300 hover:opacity-80"
                        />
                      );
                    };
                    
                    return (
                      <>
                        {estadisticas.pendientes > 0 && createArc(pendientesAngle, '#EAB308')}
                        {estadisticas.enProceso > 0 && createArc(procesoAngle, '#F97316')}
                        {estadisticas.resueltas > 0 && createArc(resueltasAngle, '#22C55E')}
                      </>
                    );
                  })()}
                  <circle cx="50" cy="50" r="25" fill="white" />
                  <text x="50" y="50" textAnchor="middle" dy="0.3em" fontSize="14" fill="#1F2937" fontWeight="bold">
                    {estadisticas.total}
                  </text>
                </svg>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-sm text-gray-600">Pendientes</span>
                </div>
                <span className="font-bold text-gray-800">{estadisticas.pendientes}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span className="text-sm text-gray-600">En Proceso</span>
                </div>
                <span className="font-bold text-gray-800">{estadisticas.enProceso}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm text-gray-600">Resueltas</span>
                </div>
                <span className="font-bold text-gray-800">{estadisticas.resueltas}</span>
              </div>
            </div>
          </motion.div>

          {/* Gráfico de barras por categoría */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white p-6 rounded-2xl shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-6">Denuncias por Categoría</h2>
            <div className="space-y-4">
              {Object.entries(categorias).map(([cat, stats]) => (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 capitalize">{cat}</span>
                    <span className="text-sm font-bold text-gray-800">{stats.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div className="h-full flex">
                      <div
                        className="bg-yellow-500 transition-all duration-500"
                        style={{ width: `${(stats.pendientes / stats.total) * 100}%` }}
                        title={`Pendientes: ${stats.pendientes}`}
                      ></div>
                      <div
                        className="bg-orange-500 transition-all duration-500"
                        style={{ width: `${(stats.enProceso / stats.total) * 100}%` }}
                        title={`En proceso: ${stats.enProceso}`}
                      ></div>
                      <div
                        className="bg-green-500 transition-all duration-500"
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

        {/* Filtros y búsqueda */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white p-6 rounded-2xl shadow-lg mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Filtrar Denuncias</h2>
              <div className="flex flex-wrap gap-3">
                {['todas', 'pendiente', 'en_proceso', 'resuelta'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFiltro(f)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      filtro === f
                        ? 'bg-green-600 text-white shadow-md scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {f === 'todas' ? 'Todas' : f.charAt(0).toUpperCase() + f.slice(1).replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent w-full md:w-80"
              />
            </div>
          </div>
        </motion.div>

        {/* Lista de denuncias */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Denuncias ({denunciasFiltradas.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {denunciasFiltradas.map((denuncia, index) => (
              <motion.div
                key={denuncia.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Imagen */}
                <div className="relative h-40 bg-gradient-to-br from-gray-200 to-gray-300">
                  {denuncia.imagenURL || denuncia.imagenBase64 ? (
                    <img
                      src={denuncia.imagenURL || denuncia.imagenBase64}
                      alt={denuncia.titulo}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${
                    denuncia.estado === 'resuelto' ? 'bg-green-500 text-white' :
                    denuncia.estado === 'en_proceso' ? 'bg-orange-500 text-white' :
                    'bg-yellow-500 text-white'
                  }`}>
                    {(denuncia.estado || 'pendiente').toUpperCase()}
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                    {denuncia.titulo}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {denuncia.descripcion}
                  </p>

                  <div className="space-y-2 text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <User size={14} />
                      <span className="truncate">{denuncia.nombreUsuario || 'Anónimo'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      <span>{formatearFecha(denuncia.fecharegistro)}</span>
                    </div>
                    {(denuncia.latitud || denuncia.ubicacion) && (
                      <div className="flex items-center gap-2">
                        <MapPin size={14} />
                        <span className="truncate">
                          {denuncia.latitud ? `${denuncia.latitud.toFixed(4)}, ${denuncia.longitud.toFixed(4)}` : denuncia.ubicacion}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Botones de acción */}
                  {denuncia.estado !== 'resuelto' && (
                    <div className="flex gap-2">
                      {(denuncia.estado === 'pendiente' || !denuncia.estado) && (
                        <button
                          onClick={() => cambiarEstado(denuncia.id, 'en_proceso')}
                          disabled={actualizando === denuncia.id}
                          className="flex-1 px-3 py-2 bg-orange-500 text-white text-xs font-medium rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                        >
                          {actualizando === denuncia.id ? '...' : 'En Proceso'}
                        </button>
                      )}
                      <button
                        onClick={() => cambiarEstado(denuncia.id, 'resuelto')}
                        disabled={actualizando === denuncia.id}
                        className="flex-1 px-3 py-2 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {actualizando === denuncia.id ? '...' : 'Resolver'}
                      </button>
                    </div>
                  )}
                  
                  {denuncia.estado === 'resuelto' && (
                    <div className="flex items-center justify-center gap-2 py-2 bg-green-50 rounded-lg">
                      <CheckCircle className="text-green-600" size={16} />
                      <span className="text-xs font-medium text-green-700">Caso resuelto</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {denunciasFiltradas.length === 0 && (
            <div className="text-center py-16">
              <ClipboardList className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-400">No hay denuncias que coincidan</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>  
  );  
};  

export default InicioAutoridad;