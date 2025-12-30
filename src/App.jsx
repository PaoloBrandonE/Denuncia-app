import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Inicio from "./pages/inicio";
import InicioAdmin from "./pages/InicioAdmin";
import InicioAutoridad from "./pages/InicioAutoridad";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

const App = () => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true); // Estado de carga
  const [denuncias, setDenuncias] = useState([]);

  // Mantener sesión iniciada y cargar datos del usuario
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log("🔐 Estado de autenticación cambió:", user ? user.uid : "No hay usuario");
      
      if (user) {
        try {
          console.log("📥 Buscando datos en Firestore para:", user.uid);
          
          // Cargar datos completos del usuario desde Firestore
          const docRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            console.log("✅ Datos encontrados:", docSnap.data());
            setUsuario({ 
              uid: user.uid, 
              email: user.email, 
              ...docSnap.data() 
            });
          } else {
            // Si no existen datos en Firestore, cerrar sesión
            console.error("❌ Usuario sin datos en Firestore");
            alert("Error: No se encontraron datos del usuario en la base de datos. Por favor contacta al administrador.");
            await auth.signOut();
            setUsuario(null);
          }
        } catch (error) {
          console.error("❌ Error al cargar datos del usuario:", error);
          alert("Error al cargar datos del usuario");
          setUsuario(null);
        }
      } else {
        console.log("👤 No hay usuario autenticado");
        setUsuario(null);
      }
      setLoading(false); // Termina la carga
    });

    return () => unsubscribe();
  }, []);

  // Mostrar pantalla de carga mientras verifica autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {!usuario ? (
          <>
            <Route path="/login" element={<Login setUsuario={setUsuario} />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <>
            {/* Rutas según tipo de usuario */}
            {usuario.tipo === "admin" ? (
              <>
                <Route path="/" element={<InicioAdmin usuario={usuario} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            ) : usuario.tipo === "autoridad" ? (
              <>
                <Route path="/" element={<InicioAutoridad usuario={usuario} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            ) : (
              <>
                {/* Ciudadano */}
                <Route 
                  path="/" 
                  element={
                    <Inicio 
                      usuario={usuario} 
                      denuncias={denuncias} 
                      setDenuncias={setDenuncias} 
                    />
                  } 
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </>
        )}
      </Routes>
    </Router>
  );
};

export default App;