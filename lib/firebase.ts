// Firebase configuration and initialization
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getDatabase, Database } from "firebase/database";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

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

// Check if database URL is valid (needed for Realtime Database)
const isValidDatabaseURL = Boolean(
  firebaseConfig.databaseURL &&
    firebaseConfig.databaseURL.includes("firebaseio.com")
);

// Initialize Firebase only if we have a valid configuration
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let rtdb: Database | null = null;
let storage: FirebaseStorage | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isValidFirebaseConfig) {
  try {
    // Initialize Firebase app
    app = initializeApp(firebaseConfig);

    // Initialize Authentication
    auth = getAuth(app);

    // Initialize Google Auth Provider
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: "select_account",
    });

    // Initialize Firestore
    db = getFirestore(app);

    // Initialize Realtime Database only if URL is valid
    if (isValidDatabaseURL) {
      rtdb = getDatabase(app);
    }

    // Initialize Storage
    storage = getStorage(app);

    console.log("Firebase initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
    // Reset all services if initialization fails
    app = null;
    auth = null;
    db = null;
    rtdb = null;
    storage = null;
    googleProvider = null;
  }
} else {
  console.warn(
    "Firebase configuration is invalid or missing. Firebase services will not be available."
  );
}

// Export Firebase services (they can be null)
export { app, auth, db, rtdb, storage, googleProvider };

// Analytics initialization (only if app is available)
let analytics: Analytics | null = null;

export async function initAnalytics(): Promise<Analytics | null> {
  if (typeof window !== "undefined" && app) {
    try {
      const supported = await isSupported();
      analytics = supported ? getAnalytics(app) : null;
    } catch (error) {
      console.error("Failed to initialize Analytics:", error);
      analytics = null;
    }
  }
  return analytics;
}

// Helper function to check if Firebase is available
export const isFirebaseAvailable = Boolean(app);

// Default export
export default app;
