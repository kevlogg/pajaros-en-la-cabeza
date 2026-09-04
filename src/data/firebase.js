import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBRmcyB6gUzaTDaN9CdiQ6RcU6eekBlhlk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "pajaros-en-la-cabeza.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "pajaros-en-la-cabeza",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "pajaros-en-la-cabeza.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "248465814698",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:248465814698:web:c33605229fbb2eddaf8cd3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and Storage services
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
