import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBRmcyB6gUzaTDaN9CdiQ6RcU6eekBlhlk",
  authDomain: "pajaros-en-la-cabeza.firebaseapp.com",
  projectId: "pajaros-en-la-cabeza",
  storageBucket: "pajaros-en-la-cabeza.firebasestorage.app",
  messagingSenderId: "248465814698",
  appId: "1:248465814698:web:c33605229fbb2eddaf8cd3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and Storage services
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
