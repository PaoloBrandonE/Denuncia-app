// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";         
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase usando variables de entorno
const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY || "dummy",
  authDomain: process.env.REACT_APP_PROJECT_ID
    ? `${process.env.REACT_APP_PROJECT_ID}.firebaseapp.com`
    : "dummy.firebaseapp.com",
  projectId: process.env.REACT_APP_PROJECT_ID || "dummy",
  storageBucket: process.env.REACT_APP_PROJECT_ID
    ? `${process.env.REACT_APP_PROJECT_ID}.appspot.com`
    : "dummy.appspot.com",
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID || "dummy",
  appId: process.env.REACT_APP_APP_ID || "dummy"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
