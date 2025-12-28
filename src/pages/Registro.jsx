import React, { useState } from "react";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Registro = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [dni, setDni] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tipo, setTipo] = useState("ciudadano");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegistro = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // 1. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Guardar datos en Firestore
      await setDoc(doc(db, "usuarios", userCredential.user.uid), {
        nombre,
        apellido,
        dni,
        email,
        tipo,
        fecharegistro: serverTimestamp()
      });

      // 3. CERRAR SESIÓN INMEDIATAMENTE (esto evita el bucle)
      await signOut(auth);

      // 4. Mostrar mensaje de éxito y redirigir a login
      alert("Cuenta creada exitosamente. Por favor inicia sesión.");
      navigate("/login", { replace: true });

    } catch (error) {
      console.error("Error al registrar:", error);
      
      if (error.code === "auth/email-already-in-use") {
        setError("Este email ya está registrado");
      } else if (error.code === "auth/weak-password") {
        setError("La contraseña debe tener al menos 6 caracteres");
      } else if (error.code === "auth/invalid-email") {
        setError("Email inválido");
      } else {
        setError("Error al registrar usuario");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={handleRegistro}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">Registro de Usuario</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          disabled={loading}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
        />
        
        <input
          type="text"
          placeholder="Apellido"
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
          required
          disabled={loading}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
        />
        
        <input
          type="text"
          placeholder="DNI"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          required
          disabled={loading}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
        />
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
        />
        
        <input
          type="password"
          placeholder="Contraseña (mínimo 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          disabled={loading}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
        />
        
        <select 
          value={tipo} 
          onChange={(e) => setTipo(e.target.value)} 
          disabled={loading}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
        >
          <option value="ciudadano">Ciudadano</option>
          <option value="admin">Admin</option>
          <option value="autoridad">Autoridad</option>
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          disabled={loading}
        >
          {loading ? "Registrando..." : "Registrarse"}
        </button>

        <p className="text-sm text-center text-gray-500">
          ¿Ya tienes cuenta?{" "}
          <span
            className="text-blue-600 cursor-pointer hover:underline font-medium"
            onClick={() => !loading && navigate("/login")}
          >
            Inicia sesión
          </span>
        </p>
      </form>
    </div>
  );
};

export default Registro;