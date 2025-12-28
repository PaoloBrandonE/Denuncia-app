import React from 'react';  
import { motion } from 'framer-motion';  
import { Users, CheckCircle2, AlertTriangle } from 'lucide-react';  
import { obtenerEstadisticas } from '../utils/ayudantes';  

const PanelAdmin = ({ denuncias, onActualizarEstado }) => {  
  const stats = obtenerEstadisticas(denuncias);  

  return (  
    <motion.div  
      className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-6 shadow-xl"  
      initial={{ opacity: 0 }}  
      animate={{ opacity: 1 }}  
      transition={{ duration: 0.5 }}  
    >  
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">  
        <Users className="w-6 h-6 text-blue-600" />  
        Panel de Administración  
      </h2>  

      <div className="grid md:grid-cols-3 gap-6 mb-8">  
        <motion.div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl text-center" whileHover={{ scale: 1.02 }}>  
          <h3 className="text-3xl font-bold text-blue-700">{stats.total}</h3>  
          <p className="text-blue-600">Total Denuncias</p>  
        </motion.div>  

        <motion.div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl text-center" whileHover={{ scale: 1.02 }}>  
          <h3 className="text-3xl font-bold text-green-700">{stats.resueltas}</h3>  
          <p className="text-green-600">Resueltas</p>  
        </motion.div>  

        <motion.div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-2xl text-center" whileHover={{ scale: 1.02 }}>  
          <h3 className="text-3xl font-bold text-yellow-700">{stats.porcentaje}%</h3>  
          <p className="text-yellow-600">Tasa de Resolución</p>  
        </motion.div>  
      </div>  

      <div className="space-y-4">  
        {denuncias  
          .filter(d => d.estado !== 'resuelta')  
          .map((denuncia) => (  
            <motion.div  
              key={denuncia.id}  
              className="flex justify-between items-center p-4 bg-gray-50 rounded-xl"  
              whileHover={{ scale: 1.01 }}  
            >  
              <div>  
                <h4 className="font-semibold">{denuncia.titulo}</h4>  
                <p className="text-sm text-gray-600">{denuncia.usuario} - {denuncia.estado}</p>  
              </div>  
              <motion.button  
                onClick={() => onActualizarEstado(denuncia.id, 'resuelta')}  
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"  
                whileTap={{ scale: 0.95 }}  
              >  
                <CheckCircle2 className="w-4 h-4 inline mr-1" />  
                Resolver  
              </motion.button>  
            </motion.div>  
          ))}  
      </div>  
    </motion.div>  
  );  
};  

export default PanelAdmin;