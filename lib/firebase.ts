// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Firebase configuration object using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-storage-bucket",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "demo-sender-id",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "demo-app-id",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL, // <-- add this line
};

// Check if we're in a valid Firebase environment
const isValidFirebaseConfig = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID
);

// Validate Firebase configuration in development/runtime only
if (typeof window !== "undefined" && !isValidFirebaseConfig) {
  console.warn(
    "Firebase configuration warning: Some environment variables are missing.",
    "Firebase features may not work properly."
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Realtime Database and get a reference to the service
export const rtdb = getDatabase(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

// Remove top-level await for analytics
let analytics: ReturnType<typeof getAnalytics> | null = null;

import type { FirebaseApp } from "firebase/app";

export async function initAnalytics(app: FirebaseApp) {
  if (typeof window !== "undefined") {
    const supported = await isSupported();
    analytics = supported ? getAnalytics(app) : null;
  }
  return analytics;
}

// Export the app for use in other parts of the application
export default app;
