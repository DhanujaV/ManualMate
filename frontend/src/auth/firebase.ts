import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

let auth: any = null;
let googleProvider: any = null;
let firebaseInitialized = false;

if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "undefined" && firebaseConfig.apiKey !== "") {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.error("Firebase Auth persistence configuration error:", err);
    });
    firebaseInitialized = true;
  } catch (err) {
    console.error("Failed to initialize Firebase Auth:", err);
  }
}

if (!firebaseInitialized) {
  console.warn("Firebase configuration is missing or invalid. Authentication is running in simulation mode.");
}

export { auth, googleProvider, firebaseInitialized };
