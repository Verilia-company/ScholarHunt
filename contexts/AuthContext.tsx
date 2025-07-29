"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithPopup,
  signInWithCredential,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth, googleProvider, db } from "../lib/firebase";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { presenceService } from "../lib/firebase/presence";
import { useRouter, usePathname } from "next/navigation";

// Helper function to check if email is admin
const isAdminEmail = (email: string | null): boolean => {
  if (!email) return false;
  const adminEmails =
    process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",").map((e) => e.trim()) || [];
  return adminEmails.includes(email);
};

// Extend Window interface for Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: any) => void;
          cancel: () => void;
        };
      };
    };
  }
}

// Define a more detailed User Profile structure
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: "user" | "admin"; // Basic role system
  isActive?: boolean; // User status (active/inactive)
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  // Add any other fields you need, e.g., savedScholarships, preferences
}

interface AuthContextType {
  user: User | null; // Firebase Auth User
  userProfile: UserProfile | null; // Firestore User Profile
  loading: boolean;
  isAdmin: boolean; // Convenience flag for role checking
  signInWithGoogle: () => Promise<void>;
  silentSignIn: () => Promise<boolean>; // Try to sign in silently
  initializeOneTap: () => void; // Initialize Google One Tap
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  isAdmin: false,
  signInWithGoogle: async () => {},
  silentSignIn: async () => false,
  initializeOneTap: () => {},
  logout: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        // Check for force logout flag
        if (typeof window !== "undefined") {
          const forceLogout = sessionStorage.getItem("forceLogout");
          if (forceLogout === "true") {
            console.log("🔄 Force logout detected, clearing user state");
            sessionStorage.removeItem("forceLogout");
            setUser(null);
            setUserProfile(null);
            setLoading(false);
            return;
          }
        }

        setUser(user);
        setLoading(false);
      },
      (error) => {
        console.error("Firebase auth state change error:", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);
  useEffect(() => {
    const fetchOrCreateUserProfile = async (firebaseUser: User) => {
      try {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          // Update last login time
          const profileData = userDoc.data() as UserProfile;
          const updatedProfile = {
            ...profileData,
            lastLoginAt: Timestamp.now(),
          };

          await setDoc(userDocRef, updatedProfile, { merge: true });
          setUserProfile(updatedProfile);
        } else {
          // Create new user profile
          // Set admin emails from environment variable as the designated admins
          const isAdmin = isAdminEmail(firebaseUser.email);
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: isAdmin ? "admin" : "user",
            isActive: true, // Set users as active by default
            createdAt: Timestamp.now(),
            lastLoginAt: Timestamp.now(),
          };

          await setDoc(userDocRef, newProfile);
          setUserProfile(newProfile);
          console.log("New user profile created:", firebaseUser.email);
        } // Start presence tracking for authenticated user
        const isAdmin = isAdminEmail(firebaseUser.email);

        // Add a small delay to ensure user profile is set before presence tracking
        setTimeout(async () => {
          try {
            await presenceService.initializePresence({
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || undefined,
              email: firebaseUser.email || undefined,
              photoURL: firebaseUser.photoURL || undefined,
              role: isAdmin ? "admin" : "user",
            });
          } catch (presenceError) {
            console.error("Error starting presence tracking:", presenceError);
          }
        }, 1000);
      } catch (error) {
        console.error("Error managing user profile:", error);
        // Still set a minimal profile if Firestore fails
        setUserProfile({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: "user",
          isActive: true, // Default to active
          createdAt: Timestamp.now(),
          lastLoginAt: Timestamp.now(),
        }); // Still try to start presence tracking
        try {
          const isAdmin = isAdminEmail(firebaseUser.email);
          await presenceService.initializePresence({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || undefined,
            email: firebaseUser.email || undefined,
            photoURL: firebaseUser.photoURL || undefined,
            role: isAdmin ? "admin" : "user",
          });
        } catch (presenceError) {
          console.error("Error starting presence tracking:", presenceError);
        }
      }
    };

    if (user) {
      fetchOrCreateUserProfile(user);
    } else {
      setUserProfile(null);
      // Stop presence tracking when user logs out
      presenceService.cleanup().catch(console.error);
    }
  }, [user]);
  const signInWithGoogle = async () => {
    try {
      setLoading(true);

      // Configure popup settings for better UX
      googleProvider.setCustomParameters({
        prompt: "select_account", // Always show account selector
      });

      // Set popup window dimensions for better mobile experience
      const popupOptions = {
        width: 500,
        height: 600,
        scrollbars: "yes",
        resizable: "yes",
        status: "no",
        location: "no",
        toolbar: "no",
        menubar: "no",
      };

      const result = await signInWithPopup(auth, googleProvider);

      // Optional: You can access additional user info here
      // const credential = GoogleAuthProvider.credentialFromResult(result);
      // const token = credential?.accessToken;      console.log("User signed in:", result.user.email);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  // Silent sign-in function - tries to sign in user if they're already logged into Google
  const silentSignIn = async (): Promise<boolean> => {
    try {
      // Check if user is already authenticated with Firebase
      if (user) {
        return true;
      }

      // Try to get current user without showing popup
      // Firebase handles this automatically with onAuthStateChanged
      // But we can also use Google Identity Services for true silent sign-in
      return false;
    } catch (error) {
      console.error("Silent sign-in failed:", error);
      return false;
    }
  }; // Initialize Google One Tap
  const initializeOneTap = () => {
    if (typeof window === "undefined" || !window.google || user) {
      return; // Don't show if already signed in
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn(
        "Google Client ID not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in your environment variables."
      );
      return;
    }

    // Additional check for production environment
    const isDev = process.env.NODE_ENV === "development";
    const currentDomain = window.location.hostname;

    console.log("One Tap initialization:", {
      isDev,
      currentDomain,
      clientId: clientId.substring(0, 20) + "...",
      googleLoaded: !!window.google?.accounts?.id,
    });

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          try {
            setLoading(true);
            console.log("One Tap callback triggered on:", currentDomain);

            // Handle the One Tap credential
            const credential = GoogleAuthProvider.credential(
              response.credential
            );
            const result = await signInWithCredential(auth, credential);

            console.log("One Tap sign-in successful", result.user.email);

            // Track successful One Tap sign-in
            if (typeof window !== "undefined" && window.gtag) {
              window.gtag("event", "login", {
                method: "google_one_tap",
                environment: isDev ? "development" : "production",
              });
            }
          } catch (error) {
            console.error("One Tap sign-in failed:", error);
            // Fallback to regular popup sign-in if One Tap fails
            console.log("Falling back to popup sign-in");
          } finally {
            setLoading(false);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
        // Add FedCM support
        use_fedcm_for_prompt: true,
        // Improved UX settings
        context: "signin",
        ux_mode: "popup",
        // Add error handling
        error_callback: (error: any) => {
          console.log("One Tap error on", currentDomain, ":", error);
        },
        // Production-specific settings
        itp_support: true, // Support for Safari's Intelligent Tracking Prevention
      });

      // Add a delay to ensure DOM is ready
      setTimeout(() => {
        if (window.google?.accounts?.id) {
          // Show the One Tap prompt
          window.google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed()) {
              const reason = notification.getNotDisplayedReason();
              console.log(
                "One Tap not displayed on",
                currentDomain,
                ":",
                reason
              );

              // Log additional context for production debugging
              if (!isDev) {
                console.log("Production One Tap debug:", {
                  reason,
                  userAgent: navigator.userAgent,
                  domain: currentDomain,
                  protocol: window.location.protocol,
                  referrer: document.referrer,
                });
              }

              // Common reasons and their meanings:
              if (reason === "unregistered_origin") {
                console.warn(
                  "Origin not registered in Google Console. Please add",
                  currentDomain,
                  "to authorized origins."
                );
              } else if (reason === "missing_client_id") {
                console.warn("Google Client ID is missing or invalid.");
              } else if (reason === "suppressed_by_user") {
                console.log("User has suppressed One Tap for this site.");
              } else if (reason === "browser_not_supported") {
                console.log("Browser does not support One Tap.");
              }
            } else if (notification.isSkippedMoment()) {
              const reason = notification.getSkippedReason();
              console.log("One Tap skipped on", currentDomain, ":", reason);
            } else if (notification.isDismissedMoment()) {
              const reason = notification.getDismissedReason();
              console.log("One Tap dismissed on", currentDomain, ":", reason);
            } else {
              console.log("One Tap displayed successfully on", currentDomain);
            }
          });
        }
      }, 100);
    } catch (error) {
      console.error(
        "Failed to initialize One Tap on",
        currentDomain,
        ":",
        error
      );
    }
  };

  const logout = async () => {
    try {
      console.log("Starting logout process...");
      console.log("Current user before logout:", user?.email);

      // Clean up presence tracking before signing out
      if (user) {
        try {
          await presenceService.cleanup();
        } catch (presenceError) {
          console.warn("Presence cleanup failed:", presenceError);
        }
      }

      // Force sign out from Firebase
      await signOut(auth);

      // Force state update
      setUser(null);
      setUserProfile(null);

      console.log("User signed out successfully");

      // Clear all auth-related storage
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }
    } catch (error) {
      console.error("Error signing out:", error);

      // Force refresh as fallback
      if (typeof window !== "undefined") {
        window.location.reload();
      }

      throw error;
    }
  }; // Debug environment variables in production
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("Environment Debug:", {
        NODE_ENV: process.env.NODE_ENV,
        hasGoogleClientId: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        hasFirebaseApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        domain: window.location.hostname,
        protocol: window.location.protocol,
      });
    }
  }, []);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    isAdmin: userProfile?.role === "admin",
    signInWithGoogle,
    silentSignIn,
    initializeOneTap,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
