import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, User, Image as ImageIcon } from 'lucide-react';

const ListaDenuncias = ({ denuncias, filtro }) => {
  if (!denuncias || denuncias.length === 0) {
    return (
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
    );
  }

  const formatearFecha = (timestamp) => {
    if (!timestamp) return 'Fecha no disponible';
    
    try {
      // Si es un Timestamp de Firebase
      if (timestamp.toDate) {
        const fecha = timestamp.toDate();
        return fecha.toLocaleDateString('es-PE', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      // Si es una fecha normal
      const fecha = new Date(timestamp);
      return fecha.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha inválida';
    }
  };

  const obtenerColorEstado = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'en proceso':
      case 'enproceso':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'resuelto':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rechazado':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const obtenerEmojiCategoria = (categoria) => {
    const emojis = {
      'baches': '🕳️',
      'alumbrado': '💡',
      'basura': '🗑️',
      'agua': '💧',
      'señalizacion': '🚦',
      'seguridad': '🚨',
      'otro': '📌'
    };
    return emojis[categoria?.toLowerCase()] || '📌';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {denuncias.map((denuncia, index) => (
        <motion.div
          key={denuncia.id}
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          {/* Imagen o placeholder */}
          <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
            {denuncia.imagenURL ? (
              <img
                src={denuncia.imagenURL}
                alt={denuncia.titulo}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : denuncia.imagenBase64 ? (
              <img
                src={denuncia.imagenBase64}
                alt={denuncia.titulo}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            
            {/* Placeholder si no hay imagen */}
            {!denuncia.imagenURL && !denuncia.imagenBase64 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="w-16 h-16 text-gray-400" />
              </div>
            )}

            {/* Badge de categoría */}
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
              {obtenerEmojiCategoria(denuncia.categoria)} {denuncia.categoria || 'Sin categoría'}
            </div>

            {/* Badge de estado */}
            <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold border ${obtenerColorEstado(denuncia.estado)}`}>
              {(denuncia.estado || 'Pendiente').toUpperCase()}
            </div>
          </div>

          {/* Contenido */}
          <div className="p-5">
            {/* Título */}
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
              {denuncia.titulo || 'Sin título'}
            </h3>

            {/* Descripción */}
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
              {denuncia.descripcion || 'Sin descripción'}
            </p>

            {/* Información adicional */}
            <div className="space-y-2 text-xs text-gray-500">
              {/* Usuario */}
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">
                  {denuncia.nombreUsuario || 'Usuario anónimo'}
                </span>
              </div>

              {/* Ubicación */}
              {denuncia.ubicacion && denuncia.ubicacion !== 'Sin ubicación' && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{denuncia.ubicacion}</span>
                </div>
              )}

              {/* Fecha */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>{formatearFecha(denuncia.fecharegistro)}</span>
              </div>
            </div>

            {/* Coordenadas (si existen) */}
            {denuncia.latitud && denuncia.longitud && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <a
                  href={`https://www.google.com/maps?q=${denuncia.latitud},${denuncia.longitud}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3" />
                  Ver en Google Maps
                </a>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ListaDenuncias;