import React, { useState } from 'react';  
import { motion } from 'framer-motion';  
import { Camera, MapPin, Upload, X, AlertCircle } from 'lucide-react';  
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase'; // SIN storage

const FormularioDenuncia = ({ onAgregarDenuncia }) => {  
  const [titulo, setTitulo] = useState('');  
  const [descripcion, setDescripcion] = useState('');  
  const [categoria, setCategoria] = useState('baches');
  const [archivoFoto, setArchivoFoto] = useState(null);
  const [previsualizacion, setPrevisualizacion] = useState('');
  const [imagenBase64, setImagenBase64] = useState('');
  const [ubicacion, setUbicacion] = useState({ lat: '', lng: '' });  
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const manejarUbicacion = () => {
    setError('');
    
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización');
      alert('Tu navegador no soporta geolocalización');
      return;
    }

    console.log('Solicitando ubicación...');
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log('Ubicación obtenida:', pos.coords);
        setUbicacion({ 
          lat: pos.coords.latitude, 
          lng: pos.coords.longitude 
        });
        alert('✓ Ubicación obtenida exitosamente');
      },
      (error) => {
        console.error('Error de geolocalización:', error);
        let mensaje = 'No se pudo obtener la ubicación. ';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            mensaje += 'Permiso denegado. En Brave: Click en el escudo 🛡️ → Configuración avanzada → Permitir Ubicación';
            break;
          case error.POSITION_UNAVAILABLE:
            mensaje += 'Información de ubicación no disponible';
            break;
          case error.TIMEOUT:
            mensaje += 'Tiempo de espera agotado';
            break;
          default:
            mensaje += 'Error desconocido';
        }
        
        setError(mensaje);
        alert(mensaje);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const convertirABase64 = (archivo) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(archivo);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const manejarCambioFoto = async (e) => {
    const archivo = e.target.files[0];
    
    if (archivo) {
      // Validar tamaño (máximo 1MB para Base64)
      if (archivo.size > 1 * 1024 * 1024) {
        alert('La imagen es muy grande. Máximo 1MB para este método');
        return;
      }
      
      // Validar tipo
      if (!archivo.type.startsWith('image/')) {
        alert('Solo se permiten imágenes');
        return;
      }
      
      try {
        console.log('Convirtiendo imagen a Base64...');
        const base64 = await convertirABase64(archivo);
        console.log('Imagen convertida, tamaño:', base64.length, 'caracteres');
        
        setArchivoFoto(archivo);
        setPrevisualizacion(URL.createObjectURL(archivo));
        setImagenBase64(base64);
      } catch (error) {
        console.error('Error al convertir imagen:', error);
        alert('Error al procesar la imagen');
      }
    }
  };

  const eliminarFoto = () => {
    if (previsualizacion) {
      URL.revokeObjectURL(previsualizacion);
    }
    setArchivoFoto(null);
    setPrevisualizacion('');
    setImagenBase64('');
  };

  const manejarSubmit = async (e) => {  
    e.preventDefault();
    setError('');
    
    if (!titulo || !descripcion) {
      setError('Por favor completa todos los campos obligatorios');
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    if (!auth.currentUser) {
      setError('Debes iniciar sesión para enviar una denuncia');
      alert('Debes iniciar sesión para enviar una denuncia');
      return;
    }

    setCargando(true);
    console.log('Iniciando envío de denuncia...');

    try {
      // Crear objeto de denuncia
      const nuevaDenuncia = {
        titulo,
        descripcion,
        categoria,
        imagenBase64: imagenBase64 || '', // Guardar imagen como Base64
        ubicacion: ubicacion.lat ? `${ubicacion.lat}, ${ubicacion.lng}` : 'Sin ubicación',
        latitud: ubicacion.lat ? Number(ubicacion.lat) : null,
        longitud: ubicacion.lng ? Number(ubicacion.lng) : null,
        estado: 'pendiente',
        fecharegistro: serverTimestamp(),
        usuarioId: auth.currentUser.uid,
        nombreUsuario: auth.currentUser.email || 'Usuario Anónimo'
      };

      console.log('Guardando en Firestore...');

      // Guardar en Firestore
      const docRef = await addDoc(collection(db, 'denuncias'), nuevaDenuncia);
      console.log('Documento creado con ID:', docRef.id);
      
      // Actualizar estado local si existe la función
      if (onAgregarDenuncia) {
        onAgregarDenuncia({ ...nuevaDenuncia, id: docRef.id });
      }

      alert('✓ ¡Denuncia enviada exitosamente!');

      // Limpiar formulario
      setTitulo('');  
      setDescripcion('');  
      setCategoria('baches');
      eliminarFoto();
      setUbicacion({ lat: '', lng: '' });

    } catch (error) {
      console.error('Error completo:', error);
      const mensajeError = `Error al enviar la denuncia: ${error.message}`;
      setError(mensajeError);
      alert(mensajeError);
    } finally {
      setCargando(false);
    }
  };  

  return (  
    <motion.form  
      onSubmit={manejarSubmit}  
      className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-6 space-y-6 shadow-xl"  
      initial={{ opacity: 0, scale: 0.95 }}  
      animate={{ opacity: 1, scale: 1 }}  
      transition={{ duration: 0.4 }}  
    >  
      <h2 className="text-2xl font-bold text-gray-900 text-center">Reporta un Problema</h2>  

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {!auth.currentUser && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
          <p className="text-sm text-yellow-700">
            ⚠️ Debes iniciar sesión para enviar una denuncia
          </p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3">
        <p className="text-xs text-blue-700">
          ℹ️ Modo Base64: Las imágenes se guardan directamente en la BD (máx 1MB)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Título del problema <span className="text-red-500">*</span>
        </label>
        <input  
          type="text"  
          placeholder="Ej: Bache en Av. Principal con Jr. Los Olivos"  
          value={titulo}  
          onChange={(e) => setTitulo(e.target.value)}  
          className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"  
          required
          disabled={cargando}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categoría <span className="text-red-500">*</span>
        </label>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={cargando}
        >
          <option value="baches">Baches</option>
          <option value="alumbrado">Alumbrado Público</option>
          <option value="basura">Acumulación de Basura</option>
          <option value="agua">Fuga de Agua</option>
          <option value="señalizacion">Señalización</option>
          <option value="seguridad">Seguridad</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción detallada <span className="text-red-500">*</span>
        </label>
        <textarea  
          placeholder="Describe el problema con el mayor detalle posible..."  
          value={descripcion}  
          onChange={(e) => setDescripcion(e.target.value)}  
          rows="4"  
          className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"  
          required
          disabled={cargando}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">  
        <motion.button  
          type="button"  
          onClick={manejarUbicacion}  
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"  
          whileHover={{ scale: cargando ? 1 : 1.02 }}
          disabled={cargando}
        >  
          <MapPin className="w-5 h-5 text-gray-600" />  
          <span className="text-sm">
            {ubicacion.lat ? `✓ Ubicación obtenida` : 'Obtener ubicación GPS'}
          </span>
        </motion.button>  

        <label className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl hover:bg-gray-100 cursor-pointer transition-colors">  
          <Camera className="w-5 h-5 text-gray-600" />  
          <span className="text-sm">{archivoFoto ? '✓ Foto seleccionada' : 'Adjuntar foto (máx 1MB)'}</span>  
          <input  
            type="file"  
            accept="image/*"  
            onChange={manejarCambioFoto}  
            className="hidden"
            disabled={cargando}
          />  
        </label>  
      </div>

      {ubicacion.lat && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-3">
          <p className="text-sm text-green-700">
            📍 Coordenadas: {ubicacion.lat.toFixed(6)}, {ubicacion.lng.toFixed(6)}
          </p>
        </div>
      )}

      {previsualizacion && (
        <div className="relative">
          <img 
            src={previsualizacion} 
            alt="Vista previa" 
            className="w-full h-64 object-cover rounded-2xl border-2 border-gray-200" 
          />
          <button
            type="button"
            onClick={eliminarFoto}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            disabled={cargando}
          >
            <X size={20} />
          </button>
        </div>
      )}

      <motion.button  
        type="submit"  
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-2xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"  
        whileHover={{ scale: cargando ? 1 : 1.02 }}  
        whileTap={{ scale: cargando ? 1 : 0.98 }}
        disabled={cargando || !auth.currentUser}
      >  
        {cargando ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Enviando...</span>
          </div>
        ) : (
          <>
            <Upload className="w-5 h-5 inline mr-2" />  
            Enviar Denuncia
          </>
        )}
      </motion.button>

      <p className="text-xs text-gray-500 text-center">
        Los campos marcados con <span className="text-red-500">*</span> son obligatorios
      </p>
    </motion.form>  
  );  
};  

export default FormularioDenuncia;