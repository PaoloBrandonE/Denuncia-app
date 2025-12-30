import React, { useState } from "react";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, Mail, Lock, User, CreditCard, AlertCircle, CheckCircle } from "lucide-react";
import './p_auth.css';

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

      // 3. Cerrar sesión inmediatamente
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
    <div className="auth-page">
      <div className="auth-container">
        <motion.div 
          className="auth-card auth-card-wide"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="auth-header">
            <div className="auth-icon auth-icon-success">
              <UserPlus size={32} />
            </div>
            <h2 className="auth-title">Crear Cuenta</h2>
            <p className="auth-subtitle">Regístrate para comenzar a reportar</p>
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
          <form onSubmit={handleRegistro} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <User size={16} />
                  <span>Nombre</span>
                </label>
                <input
                  type="text"
                  placeholder="Juan"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  disabled={loading}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <User size={16} />
                  <span>Apellido</span>
                </label>
                <input
                  type="text"
                  placeholder="Pérez"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  required
                  disabled={loading}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <CreditCard size={16} />
                <span>DNI</span>
              </label>
              <input
                type="text"
                placeholder="12345678"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                required
                disabled={loading}
                className="form-input"
              />
            </div>

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
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
                className="form-input"
              />
              <span className="form-hint">La contraseña debe tener al menos 6 caracteres</span>
            </div>

            <div className="form-group">
              <label className="form-label">
                <CheckCircle size={16} />
                <span>Tipo de Usuario</span>
              </label>
              <select 
                value={tipo} 
                onChange={(e) => setTipo(e.target.value)} 
                disabled={loading}
                className="form-select"
              >
                <option value="ciudadano">Ciudadano</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  <span>Registrando...</span>
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Registrarse</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <p className="footer-text">
              ¿Ya tienes cuenta?{" "}
              <span
                className="footer-link"
                onClick={() => !loading && navigate("/login")}
              >
                Inicia sesión
              </span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Registro;