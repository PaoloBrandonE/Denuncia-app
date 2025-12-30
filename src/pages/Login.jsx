import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, AlertCircle } from "lucide-react";
import './p_auth.css';

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
    <div className="auth-page">
      <div className="auth-container">
        <motion.div 
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="auth-header">
            <div className="auth-icon">
              <LogIn size={32} />
            </div>
            <h2 className="auth-title">Iniciar Sesión</h2>
            <p className="auth-subtitle">Accede a tu cuenta para continuar</p>
          </div>

          {/* Error Alert */}
          {error && (
            <motion.div 
              className="alert alert-error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle size={20} />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label className="form-label">
                <Mail size={16} />
                <span>Email</span>
              </label>
              <input 
                type="email" 
                placeholder="tu@email.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
                disabled={loading}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Lock size={16} />
                <span>Contraseña</span>
              </label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
                minLength={6}
                disabled={loading}
                className="form-input"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary btn-full"
            >
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  <span>Ingresando...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Ingresar</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <p className="footer-text">
              ¿No tienes cuenta?{" "}
              <Link to="/registro" className="footer-link">
                Registrarse
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}