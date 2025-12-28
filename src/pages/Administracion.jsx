import React from 'react';  
import PanelAdmin from '../components/PanelAdmin';  
import { motion } from 'framer-motion';  

const Administracion = ({ denuncias, setDenuncias }) => {  
  const manejarActualizar = (id, nuevoEstado) => {  
    setDenuncias(prev => prev.map(d => d.id === id ? { ...d, estado: nuevoEstado } : d));  
  };  

  return (  
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">  
      <div className="container mx-auto px-4 max-w-6xl">  
        <motion.h1  
          className="text-3xl font-bold text-gray-900 mb-8 text-center"  
          initial={{ opacity: 0 }}  
          animate={{ opacity: 1 }}  
        >  
          Dashboard de Autoridades  
        </motion.h1>  

        <PanelAdmin denuncias={denuncias} onActualizarEstado={manejarActualizar} />  
      </div>  
    </div>  
  );  
};  

export default Administracion;