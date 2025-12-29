// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";         
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBpv9DmaOw71OuX81mepLpPA3jsnoQgabk",
  authDomain: "desarrollosoftawre.firebaseapp.com",
  projectId: "desarrollosoftawre",
  storageBucket: "desarrollosoftawre.appspot.com",
  messagingSenderId: "451680575470",
  appId: "1:451680575470:web:eb9cf80178c10cd08678ff"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);