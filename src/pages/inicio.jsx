import React, { useState, useEffect } from 'react';  
import { motion } from 'framer-motion';  
import { LogOut, RefreshCw } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import FormularioDenuncia from '../components/FormularioDenuncia';  
import ListaDenuncias from '../components/ListaDenuncias';  

const Inicio = ({ usuario }) => {
  const navigate = useNavigate();
  const [denuncias, setDenuncias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('todas'); // 'todas', 'mias'

  // Cargar denuncias desde Firestore en tiempo real
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
        // Solo denuncias del usuario actual
        q = query(
          collection(db, 'denuncias'),
          where('usuarioId', '==', auth.currentUser.uid),
          orderBy('fecharegistro', 'desc')
        );
      } else {
        // Todas las denuncias
        q = query(
          collection(db, 'denuncias'),
          orderBy('fecharegistro', 'desc')
        );
      }

      // Listener en tiempo real
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          console.log('✅ Datos recibidos:', snapshot.size, 'documentos');
          
          const denunciasData = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            
            // Convertir GeoPoint si existe
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

      // Cleanup: cancelar listener cuando el componente se desmonte
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
    // El listener de onSnapshot actualizará automáticamente la lista
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
    // El useEffect se ejecutará nuevamente
    setFiltro(filtro === 'todas' ? 'mias' : 'todas');
    setTimeout(() => setFiltro(filtro), 100);
  };

  // Verificar que el usuario sea ciudadano (seguridad adicional)
  if (usuario?.tipo !== 'ciudadano') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">Esta página es solo para ciudadanos.</p>
        </div>
      </div>
    );
  }

  return (  
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12">
      {/* Botón de cerrar sesión */}
      <div className="absolute top-4 right-4">
        <button
          onClick={handleCerrarSesion}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"
        >
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </div>

      <div className="container mx-auto px-4 max-w-5xl">  

        {/* Cabecera con título y descripción */}
        <motion.div  
          className="text-center mb-12"  
          initial={{ opacity: 0, y: 20 }}  
          animate={{ opacity: 1, y: 0 }}  
          transition={{ duration: 0.6 }}  
        >  
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Reporta Problemas Urbanos
          </h1>  
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Ayuda a mejorar tu ciudad denunciando incidencias con fotos y ubicación. ¡Tu voz cuenta!
          </p>
          {usuario && (
            <div className="mt-4 inline-block bg-white px-6 py-3 rounded-full shadow-md">
              <p className="text-sm text-gray-600">
                Bienvenido, <span className="font-bold text-blue-600">{usuario.nombre} {usuario.apellido}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Usuario: Ciudadano
              </p>
            </div>
          )}
        </motion.div>  

        {/* Formulario de denuncia */}
        <div className="mb-12">
          <FormularioDenuncia onAgregarDenuncia={manejarAgregar} usuario={usuario} />
        </div>

        {/* Sección de denuncias recientes */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Denuncias Recientes
            </h2>
            
            <div className="flex gap-2">
              {/* Filtros */}
              <div className="flex bg-white rounded-lg shadow-md overflow-hidden">
                <button
                  onClick={() => setFiltro('todas')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    filtro === 'todas' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Todas ({denuncias.length})
                </button>
                <button
                  onClick={() => setFiltro('mias')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    filtro === 'mias' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Mis Denuncias
                </button>
              </div>

              {/* Botón recargar */}
              <button
                onClick={recargarDenuncias}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
                disabled={cargando}
              >
                <RefreshCw size={16} className={cargando ? 'animate-spin' : ''} />
                <span className="text-sm font-medium">Recargar</span>
              </button>
            </div>
          </div>

          {/* Mensajes de error */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
              <button 
                onClick={recargarDenuncias}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Estado de carga */}
          {cargando && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">Cargando denuncias...</p>
            </div>
          )}

          {/* Sin denuncias */}
          {!cargando && !error && denuncias.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl shadow-md">
              <p className="text-xl text-gray-600 mb-2">
                {filtro === 'mias' ? '📝 No tienes denuncias aún' : '📝 No hay denuncias registradas'}
              </p>
              <p className="text-sm text-gray-500">
                {filtro === 'mias' 
                  ? 'Crea tu primera denuncia usando el formulario de arriba'
                  : 'Sé el primero en reportar un problema'
                }
              </p>
            </div>
          )}

          {/* Lista de denuncias */}
          {!cargando && !error && denuncias.length > 0 && (
            <ListaDenuncias denuncias={denuncias} filtro={filtro} />
          )}
        </div>  

      </div>  
    </div>  
  );  
};  

export default Inicio;