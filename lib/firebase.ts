// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getDatabase } from "firebase/database"; // Temporarily disabled
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
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "your_api_key_here"
);

// Validate Firebase configuration in development/runtime only
if (typeof window !== "undefined" && !isValidFirebaseConfig) {
  console.error(
    "🔥 Firebase Setup Required:",
    "\n1. Copy .env.example to .env.local",
    "\n2. Add your Firebase config values to .env.local",
    "\n3. Get values from: https://console.firebase.google.com/"
  );
}

// Initialize Firebase
let app;
try {
  if (isValidFirebaseConfig) {
    app = initializeApp(firebaseConfig);
  } else {
    // Create a dummy app for development when Firebase is not configured
    app = initializeApp({
      apiKey: "demo-key",
      authDomain: "demo.firebaseapp.com",
      projectId: "demo-project",
      storageBucket: "demo-project.appspot.com",
      messagingSenderId: "123456789",
      appId: "1:123456789:web:abcdef123456",
    });
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
  // Fallback to demo configuration
  app = initializeApp({
    apiKey: "demo-key",
    authDomain: "demo.firebaseapp.com",
    projectId: "demo-project",
    storageBucket: "demo-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456",
  });
}

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
// Temporarily disabled to fix initialization errors
// let rtdb: ReturnType<typeof getDatabase> | null;
// try {
//   if (process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL) {
//     rtdb = getDatabase(app);
//   } else {
//     console.warn("Firebase Realtime Database URL not configured. Skipping RTDB initialization.");
//     rtdb = null;
//   }
// } catch (error) {
//   console.warn("Failed to initialize Firebase Realtime Database:", error);
//   rtdb = null;
// }
// export { rtdb };
export const rtdb = null; // Temporarily disabled

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
