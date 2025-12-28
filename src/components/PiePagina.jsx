import React from 'react';  
import { motion } from 'framer-motion';  
import { Heart, Shield } from 'lucide-react';  

const PiePagina = () => {  
  return (  
    <motion.footer  
      className="bg-gray-900/90 backdrop-blur-xl text-white py-8 mt-12"  
      initial={{ opacity: 0 }}  
      animate={{ opacity: 1 }}  
      transition={{ delay: 0.5 }}  
    >  
      <div className="container mx-auto px-4 text-center">  
        <div className="flex items-center justify-center gap-2 mb-4">  
          <Heart className="w-5 h-5 text-red-500" />  
          <p className="text-sm">Hecho con amor para ciudades mejores</p>  
        </div>  
        <div className="flex items-center justify-center gap-2">  
          <Shield className="w-4 h-4" />  
          <p className="text-xs text-gray-400">© 2024 DenunciaUrbana. Todos los derechos reservados.</p>  
        </div>  
      </div>  
    </motion.footer>  
  );  
};  

export default PiePagina;