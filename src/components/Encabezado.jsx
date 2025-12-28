import React from 'react';  
import { motion } from 'framer-motion';  
import { Home, AlertTriangle, Users, Menu } from 'lucide-react';  
import { Link, useLocation } from 'react-router-dom';  

const Encabezado = ({ esAdmin }) => {  
  const location = useLocation();  

  return (  
    <motion.header
        style={{
          backgroundImage: 'linear-gradient(to right, #80a6f7ff, #384055ff)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(118, 152, 206, 0.3)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
          

        }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
 
      <div className="container mx-auto px-4 py-4">  
        <div className="flex items-center justify-between">  
          {/* Logo izquierdo (logoU) */}
          {/* CORREGIDO: Ruta actualizada a /imagenes/ */}
          <motion.div
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
          >
            <img 
              src="/imagenes/imagotipo.png"
              alt="Logo Universidad" 
              className="h-36 w-auto object-contain"
            />
          </motion.div>
          {/* Título central */}
            <motion.div
              className="absolute top-4 flex flex-col items-start"
              style={{ left: '400px' }}
              whileHover={{ scale: 1.05 }}
            >
              <h1
                style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: 'white',
                  fontFamily: 'serif',
                  lineHeight: '1.5',
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.6)'
                  
                }}
              >
                "EL BARRIO EN TUS MANOS ¡REPORTA Y MEJORA! "
              </h1>
              <span
                style={{
                  fontSize: '48px',
                  color: 'white',
                  fontFamily: 'serif',
                  marginTop: '4px',
                  marginLeft: '100px',
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.6)'
                }}
              >
              </span>
            </motion.div>


          {/* Navegación alineada a la derecha */}
          <nav className="hidden md:flex items-center gap-6 absolute top-4 right-4 z-50">

            <Link to="/" className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${location.pathname === '/' ? 'bg-white text-blue-700 font-semibold' : 'text-white hover:text-yellow-200 hover:bg-blue-600/50'}`}>
              <Home className="w-4 h-4" /> Inicio
            </Link>
            <Link to="/denuncias" className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${location.pathname === '/denuncias' ? 'bg-white text-blue-700 font-semibold' : 'text-white hover:text-yellow-200 hover:bg-blue-600/50'}`}>
              <AlertTriangle className="w-4 h-4" /> Denuncias
            </Link>
            {esAdmin && (
              <Link to="/administracion" className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${location.pathname === '/administracion' ? 'bg-white text-blue-700 font-semibold' : 'text-white hover:text-yellow-200 hover:bg-blue-600/50'}`}>
                <Users className="w-4 h-4" /> Admin
              </Link>
            )}
            
          </nav>
        </div>

        {/* Botón móvil */}
        <motion.button className="md:hidden absolute top-4 right-4" whileTap={{ scale: 0.95 }}>  
          <Menu className="w-6 h-6 text-white" />  
        </motion.button>
      </div>  
    </motion.header>  
  );  
};  

export default Encabezado;