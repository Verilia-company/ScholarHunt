// Admin utilities for user management
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db, isFirebaseAvailable } from "../lib/firebase";

// Helper function to check if Firestore is available
const ensureFirestore = () => {
  if (!isFirebaseAvailable || !db) {
    throw new Error("Firestore is not available. Please check your Firebase configuration.");
  }
  return db;
};

/**
 * Promotes a user to admin role
 * This should only be used in development or by existing admins
 */
export async function promoteUserToAdmin(uid: string): Promise<boolean> {
  try {
    const userDocRef = doc(ensureFirestore(), "users", uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.error("User document not found:", uid);
      return false;
    }

    await updateDoc(userDocRef, {
      role: "admin",
    });

    console.log("User promoted to admin:", uid);
    return true;
  } catch (error) {
    console.error("Error promoting user to admin:", error);
    return false;
  }
}

/**
 * Demotes an admin user back to regular user
 */
export async function demoteAdminToUser(uid: string): Promise<boolean> {
  try {
    const userDocRef = doc(ensureFirestore(), "users", uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.error("User document not found:", uid);
      return false;
    }

    await updateDoc(userDocRef, {
      role: "user",
    });

    console.log("Admin demoted to user:", uid);
    return true;
  } catch (error) {
    console.error("Error demoting admin to user:", error);
    return false;
  }
}

/**
 * Gets all users from Firestore (admin only function)
 */
export async function getAllUsers(): Promise<any[]> {
  try {
    // This should only be called from admin components
    // In production, add server-side admin verification
    return [];
  } catch (error) {
    console.error("Error getting all users:", error);
    return [];
  }
}
