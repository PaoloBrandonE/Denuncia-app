import React from 'react';  
import { motion } from 'framer-motion';  
import { Shield, Heart } from 'lucide-react';  

const AcercaDe = () => {  
  return (  
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">  
      <div className="container mx-auto px-4 max-w-4xl">  
        <motion.div  
          className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 shadow-xl text-center"  
          initial={{ opacity: 0, y: 20 }}  
          animate={{ opacity: 1, y: 0 }}  
          transition={{ duration: 0.5 }}  
        >  
          <Shield className="w-16 h-16 text-blue-600 mx-auto mb-6" />  
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Acerca de DenunciaUrbana</h1>  
          <p className="text-gray-600 mb-6">Una plataforma simple para que los ciudadanos reporten problemas urbanos y las autoridades los resuelvan rápido. Contribuye a ciudades más sostenibles y seguras.</p>  
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">  
            <Heart className="w-4 h-4 text-red-500" />  
            Hecho con dedicación para tu comunidad.  
          </div>  
        </motion.div>  
      </div>  
    </div>  
  );  
};  

export default AcercaDe;