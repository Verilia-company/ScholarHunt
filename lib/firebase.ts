// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Firebase configuration object using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "",
};

// Check if we're in a valid Firebase environment
const isValidFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.storageBucket &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.appId
);

// Log configuration warnings only in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development" && !isValidFirebaseConfig) {
  console.warn(
    "Firebase configuration warning: Some environment variables are missing.",
    "Firebase features may not work properly."
  );
}

// Initialize Firebase with error handling
let app: ReturnType<typeof initializeApp>;
let auth: ReturnType<typeof getAuth>;
let db: ReturnType<typeof getFirestore>;
let rtdb: ReturnType<typeof getDatabase>;
let storage: ReturnType<typeof getStorage>;
let googleProvider: GoogleAuthProvider;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);

  // Initialize Firebase Authentication and get a reference to the service
  auth = getAuth(app);

  // Initialize Google Auth Provider
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: "select_account",
  });

  // Initialize Cloud Firestore and get a reference to the service
  db = getFirestore(app);

  // Initialize Realtime Database and get a reference to the service
  rtdb = getDatabase(app);

  // Initialize Cloud Storage and get a reference to the service
  storage = getStorage(app);
} catch (error) {
  console.error("Failed to initialize Firebase:", error);
  // Create mock objects to prevent runtime errors
  app = {} as ReturnType<typeof initializeApp>;
  auth = {} as ReturnType<typeof getAuth>;
  db = {} as ReturnType<typeof getFirestore>;
  rtdb = {} as ReturnType<typeof getDatabase>;
  storage = {} as ReturnType<typeof getStorage>;
  googleProvider = {} as GoogleAuthProvider;
}

// Export Firebase services
export { auth, db, rtdb, storage, googleProvider };

// Analytics initialization
let analytics: ReturnType<typeof getAnalytics> | null = null;

import type { FirebaseApp } from "firebase/app";

export async function initAnalytics(firebaseApp: FirebaseApp) {
  if (typeof window !== "undefined") {
    const supported = await isSupported();
    analytics = supported ? getAnalytics(firebaseApp) : null;
  }
  return analytics;
}

// Export the app for use in other parts of the application
export default app;