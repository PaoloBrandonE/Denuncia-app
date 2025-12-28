import React from 'react';  
import { motion } from 'framer-motion';  
import ListaDenuncias from '../components/ListaDenuncias';  
import { filtrarDenuncias } from '../utils/ayudantes';

const Denuncias = ({ denuncias }) => {  
  const [filtro, setFiltro] = React.useState('todas');  

  const botonesFiltro = [  
    { key: 'todas', label: 'Todas' },  
    { key: 'pendiente', label: 'Pendientes' },  
    { key: 'en_revision', label: 'En Revisión' },  
    { key: 'resuelta', label: 'Resueltas' }  
  ];  

  return (  
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">  
      <div className="container mx-auto px-4 max-w-4xl">  
        <motion.h1  
          className="text-3xl font-bold text-gray-900 mb-8 text-center"  
          initial={{ opacity: 0 }}  
          animate={{ opacity: 1 }}  
        >  
          Mis Denuncias  
        </motion.h1>  

        <div className="flex flex-wrap gap-2 justify-center mb-8 bg-white/90 backdrop-blur-xl p-4 rounded-2xl">  
          {botonesFiltro.map((btn) => (  
            <motion.button  
              key={btn.key}  
              onClick={() => setFiltro(btn.key)}  
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${filtro === btn.key ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}  
              whileHover={{ scale: 1.05 }}  
            >  
              {btn.label}  
            </motion.button>  
          ))}  
        </div>  

        <ListaDenuncias denuncias={denuncias} filtro={filtro} />  
      </div>  
    </div>  
  );  
};  

export default Denuncias;