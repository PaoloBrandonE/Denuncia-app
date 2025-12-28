import React, { useState, useEffect } from 'react';  
import { motion } from 'framer-motion';  
import { LogOut, Users, FileText, BarChart3, Shield, Check, X, LayoutDashboard, UserCheck, ClipboardList, Menu, X as CloseIcon } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, updateDoc, doc } from 'firebase/firestore';

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
      // Cargar usuarios
      const usuariosSnap = await getDocs(collection(db, "usuarios"));
      const usuariosData = usuariosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsuarios(usuariosData);

      // Cargar denuncias
      const denunciasSnap = await getDocs(query(collection(db, "denuncias"), orderBy("fecharegistro", "desc")));
      const denunciasData = denunciasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDenuncias(denunciasData);

      // Calcular estadísticas
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">Cargando panel administrativo...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-blue-100 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform md:translate-x-0 md:static md:inset-0`}>
        <div className="p-6 border-b border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Shield className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Admin Panel</h2>
                <p className="text-sm text-gray-600">{usuario.nombre}</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-gray-500 hover:text-gray-700"
            >
              <CloseIcon size={24} />
            </button>
          </div>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false); // Cerrar sidebar en móvil
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon size={20} />
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleCerrarSesion}
            className="w-full flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto md:ml-0">
        <header className="bg-white shadow-sm border-b border-blue-100 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-3xl font-bold text-gray-800">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h1>
          </div>
        </header>

        <div className="p-6">
          {activeTab === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {/* Tarjetas de estadísticas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Usuarios</p>
                      <p className="text-3xl font-bold text-gray-800 mt-1">{estadisticas.totalUsuarios}</p>
                    </div>
                    <Users className="text-blue-500" size={40} />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Denuncias</p>
                      <p className="text-3xl font-bold text-gray-800 mt-1">{estadisticas.totalDenuncias}</p>
                    </div>
                    <FileText className="text-green-500" size={40} />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-yellow-500 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Pendientes</p>
                      <p className="text-3xl font-bold text-gray-800 mt-1">{estadisticas.denunciasPendientes}</p>
                    </div>
                    <BarChart3 className="text-yellow-500" size={40} />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Resueltas</p>
                      <p className="text-3xl font-bold text-gray-800 mt-1">{estadisticas.denunciasResueltas}</p>
                    </div>
                    <Shield className="text-purple-500" size={40} />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-emerald-500 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Aprobadas</p>
                      <p className="text-3xl font-bold text-gray-800 mt-1">{estadisticas.denunciasAprobadas}</p>
                    </div>
                    <Check className="text-emerald-500" size={40} />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-red-500 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-medium">Rechazadas</p>
                      <p className="text-3xl font-bold text-gray-800 mt-1">{estadisticas.denunciasRechazadas}</p>
                    </div>
                    <X className="text-red-500" size={40} />
                  </div>
                </motion.div>
              </div>

              {/* Resumen rápido */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Resumen del Sistema</h3>
                <p className="text-gray-600">
                  Bienvenido al panel de administración. Aquí puedes gestionar usuarios y denuncias. 
                  Usa las pestañas laterales para navegar entre secciones.
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'usuarios' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Users className="text-blue-600" size={24} />
                Usuarios Registrados
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 rounded-tl-lg">Nombre</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">DNI</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 rounded-tr-lg">Tipo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {usuarios.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-800 font-medium">{user.nombre} {user.apellido}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{user.dni}</td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            user.tipo === 'admin' ? 'bg-red-100 text-red-700' :
                            user.tipo === 'autoridad' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
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

          {activeTab === 'denuncias' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FileText className="text-green-600" size={24} />
                Gestión de Denuncias
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 rounded-tl-lg">Título</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Descripción</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Categoría</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Usuario</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ubicación</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Foto</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Estado</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fecha</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 rounded-tr-lg">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {denuncias.map((denuncia) => (
                      <tr key={denuncia.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-800 font-medium">{denuncia.titulo}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate" title={denuncia.descripcion}>
                          {denuncia.descripcion}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{denuncia.categoria}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{denuncia.usuarioNombre}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {denuncia.ubicacion
                            ? (denuncia.ubicacion.latitude !== undefined
                                ? `${denuncia.ubicacion.latitude.toFixed(4)}, ${denuncia.ubicacion.longitude.toFixed(4)}`
                                : (typeof denuncia.ubicacion.lat === 'number' && typeof denuncia.ubicacion.lng === 'number'
                                    ? `${denuncia.ubicacion.lat.toFixed(4)}, ${denuncia.ubicacion.lng.toFixed(4)}`
                                    : 'N/A'))
                            : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          {denuncia.foto ? (
                            <img
                              src={denuncia.foto}
                              alt="Foto de la denuncia"
                              className="w-48 h-72 object-cover rounded shadow-sm"
                            />
                          ) : (
                            <span className="text-gray-400 text-xs">Sin foto</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            denuncia.estado === 'resuelta' ? 'bg-green-100 text-green-700' :
                            denuncia.estado === 'aprobada' ? 'bg-green-100 text-green-700' :
                            denuncia.estado === 'rechazada' ? 'bg-red-100 text-red-700' :
                            denuncia.estado === 'en_proceso' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {denuncia.estado || 'pendiente'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {denuncia.fecharegistro?.toDate?.()?.toLocaleDateString() || 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          {denuncia.estado === 'pendiente' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => aprobarDenuncia(denuncia.id)}
                                className="flex items-center gap-1 px-3 py-1 bg-emerald-500 text-white text-xs rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
                              >
                                <Check size={14} />
                                Aprobar
                              </button>
                              <button
                                onClick={() => rechazarDenuncia(denuncia.id)}
                                className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                              >
                                <X size={14} />
                                Rechazar
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