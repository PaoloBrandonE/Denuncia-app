
export const generarIdUnico = () => {  
  return Date.now().toString(36) + Math.random().toString(36).substr(2);  
};  

export const filtrarDenuncias = (denuncias, filtro) => {  
  if (filtro === 'todas') return denuncias;  
  console.log('Denuncias recibidas:', denuncias);
  console.log('Filtro:', filtro);
  console.log('Filtradas:', filtrarDenuncias(denuncias, filtro));

  return denuncias.filter(denuncia => denuncia.estado === filtro);  
};  

export const obtenerEstadisticas = (denuncias) => {  
  const total = denuncias.length;  
  const resueltas = denuncias.filter(d => d.estado === 'resuelta').length;  
  const porcentaje = total > 0 ? Math.round((resueltas / total) * 100) : 0;  
  return { total, resueltas, porcentaje };  
};

