import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log("Intentando login con:", email);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login exitoso:", userCredential.user.uid);
    } catch (err) {
      console.error("Error completo en login:", err);
      console.error("Código de error:", err.code);
      console.error("Mensaje de error:", err.message);
      
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Email o contraseña incorrectos");
      } else if (err.code === "auth/invalid-email") {
        setError("Email inválido");
      } else if (err.code === "auth/too-many-requests") {
        setError("Demasiados intentos. Intenta más tarde");
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form 
        onSubmit={handleLogin} 
        className="p-8 shadow-lg rounded-xl bg-white w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Iniciar Sesión</h2>
        
        <div className="mb-4">
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
            disabled={loading}
            className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100" 
          />
        </div>

        <div className="mb-4">
          <input 
            type="password" 
            placeholder="Contraseña" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
            minLength={6}
            disabled={loading}
            className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100" 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-600 text-white p-3 w-full rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <p className="mt-6 text-sm text-center text-gray-600">
          ¿No tienes cuenta?{" "}
          <Link to="/registro" className="text-blue-600 hover:underline font-medium">
            Registrarse
          </Link>
        </p>
      </form>
    </div>
  );
}