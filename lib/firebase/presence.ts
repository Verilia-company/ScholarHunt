import {
  ref,
  onDisconnect,
  serverTimestamp,
  onValue,
  off,
  set,
  remove,
  DatabaseReference,
} from "firebase/database";
import { rtdb } from "../firebase";

export interface PresenceData {
  uid: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  role?: "admin" | "user";
  isOnline: boolean;
  lastSeen: unknown;
  userAgent?: string;
  location?: string; // Page/section they're viewing
}

export interface ActiveUserStats {
  totalOnline: number;
  adminOnline: number;
  userOnline: number;
  recentlyActive: number; // Active in last 5 minutes
}

class PresenceService {
  private presenceRef: DatabaseReference | null = null;
  private connectedRef: DatabaseReference | null = null;
  private isInitialized = false;

  /**
   * Initialize presence tracking for a user
   */
  async initializePresence(userData: {
    uid: string;
    displayName?: string;
    email?: string;
    photoURL?: string;
    role?: "admin" | "user";
  }): Promise<void> {
    if (this.isInitialized) {
      await this.cleanup();
    }

    try {
      // Check if rtdb is available
      if (!rtdb) {
        console.warn(
          "Realtime Database not available. Presence features disabled."
        );
        return;
      }

      // Reference to this user's presence
      this.presenceRef = ref(rtdb, `presence/${userData.uid}`);

      // Reference to check connection status
      this.connectedRef = ref(rtdb, ".info/connected");
      const presenceData: PresenceData = {
        uid: userData.uid,
        displayName: userData.displayName || undefined,
        email: userData.email || undefined,
        photoURL: userData.photoURL || undefined,
        role: userData.role || "user",
        isOnline: true,
        lastSeen: serverTimestamp(),
        userAgent:
          typeof window !== "undefined" ? navigator.userAgent : undefined,
        location:
          typeof window !== "undefined" ? window.location.pathname : undefined,
      };

      // When connected, update presence
      onValue(this.connectedRef, (snapshot) => {
        if (snapshot.val() === true && this.presenceRef) {
          // Set user as online
          set(this.presenceRef, presenceData);

          // When disconnected, set as offline
          onDisconnect(this.presenceRef).update({
            isOnline: false,
            lastSeen: serverTimestamp(),
          });
        }
      });

      // Update location when user navigates
      this.updateLocation(window.location.pathname);

      // Listen for page visibility changes
      if (typeof document !== "undefined") {
        document.addEventListener(
          "visibilitychange",
          this.handleVisibilityChange
        );
      }

      // Listen for beforeunload to mark as offline
      if (typeof window !== "undefined") {
        window.addEventListener("beforeunload", this.handleBeforeUnload);
      }

      this.isInitialized = true;
      console.log("Presence tracking initialized for user:", userData.uid);
    } catch (error) {
      console.error("Error initializing presence:", error);
    }
  }

  /**
   * Update user's current location/page
   */
  updateLocation(location: string): void {
    if (this.presenceRef && rtdb) {
      set(ref(rtdb, `presence/${this.presenceRef.key}/location`), location);
    }
  }

  /**
   * Handle page visibility changes
   */
  private handleVisibilityChange = (): void => {
    if (this.presenceRef && rtdb) {
      const isVisible = !document.hidden;
      set(ref(rtdb, `presence/${this.presenceRef.key}/isOnline`), isVisible);

      if (isVisible) {
        set(
          ref(rtdb, `presence/${this.presenceRef.key}/lastSeen`),
          serverTimestamp()
        );
      }
    }
  };

  /**
   * Handle page unload
   */
  private handleBeforeUnload = (): void => {
    if (this.presenceRef) {
      // Synchronously set as offline (though this might not always work)
      navigator.sendBeacon(
        "/api/presence/offline",
        JSON.stringify({
          uid: this.presenceRef.key,
        })
      );
    }
  };

  /**
   * Get all currently online users
   */
  getOnlineUsers(callback: (users: PresenceData[]) => void): () => void {
    if (!rtdb) {
      callback([]);
      return () => {}; // Return empty unsubscribe function
    }

    const presenceRef = ref(rtdb, "presence");

    const unsubscribe = onValue(presenceRef, (snapshot) => {
      const presenceData = snapshot.val();
      const onlineUsers: PresenceData[] = [];

      if (presenceData) {
        Object.keys(presenceData).forEach((uid) => {
          const userData = presenceData[uid];
          if (userData.isOnline) {
            onlineUsers.push({
              ...userData,
              uid,
            });
          }
        });
      }

      callback(onlineUsers);
    });

    return () => off(presenceRef, "value", unsubscribe);
  }

  /**
   * Get active user statistics
   */
  getActiveUserStats(callback: (stats: ActiveUserStats) => void): () => void {
    return this.getOnlineUsers((users) => {
      const now = Date.now();
      const fiveMinutesAgo = now - 5 * 60 * 1000;

      const stats: ActiveUserStats = {
        totalOnline: users.filter((user) => user.isOnline).length,
        adminOnline: users.filter(
          (user) => user.isOnline && user.role === "admin"
        ).length,
        userOnline: users.filter(
          (user) => user.isOnline && user.role === "user"
        ).length,
        recentlyActive: users.filter((user) => {
          if (user.isOnline) return true;
          // Check if they were active in the last 5 minutes
          const lastSeen = user.lastSeen;
          if (typeof lastSeen === "number") {
            return lastSeen > fiveMinutesAgo;
          }
          return false;
        }).length,
      };

      callback(stats);
    });
  }

  /**
   * Get users in a specific location/page
   */
  getUsersInLocation(
    location: string,
    callback: (users: PresenceData[]) => void
  ): () => void {
    return this.getOnlineUsers((users) => {
      const usersInLocation = users.filter(
        (user) => user.isOnline && user.location === location
      );
      callback(usersInLocation);
    });
  }

  /**
   * Update user's admin status in presence
   */
  updateUserRole(uid: string, role: "admin" | "user"): void {
    if (!rtdb) {
      console.warn("Realtime Database not available. Cannot update user role.");
      return;
    }
    const roleRef = ref(rtdb, `presence/${uid}/role`);
    set(roleRef, role);
  }

  /**
   * Clean up presence tracking
   */
  async cleanup(): Promise<void> {
    try {
      if (this.presenceRef) {
        // Set as offline before cleanup
        await set(this.presenceRef, {
          isOnline: false,
          lastSeen: serverTimestamp(),
        });
      }

      // Remove event listeners
      if (typeof document !== "undefined") {
        document.removeEventListener(
          "visibilitychange",
          this.handleVisibilityChange
        );
      }

      if (typeof window !== "undefined") {
        window.removeEventListener("beforeunload", this.handleBeforeUnload);
      }

      // Clear references
      if (this.connectedRef) {
        off(this.connectedRef);
      }

      this.presenceRef = null;
      this.connectedRef = null;
      this.isInitialized = false;

      console.log("Presence tracking cleaned up");
    } catch (error) {
      console.error("Error cleaning up presence:", error);
    }
  }
  /**
   * Subscribe to online users list
   */
  subscribeToOnlineUsers(callback: (userIds: string[]) => void): () => void {
    return this.getOnlineUsers((users) => {
      const userIds = users.map((user) => user.uid);
      callback(userIds);
    });
  }

  /**
   * Subscribe to user presence data
   */
  subscribeToUserPresence(
    callback: (
      presenceData: Record<string, { lastSeen: Date; isOnline: boolean }>
    ) => void
  ): () => void {
    if (!rtdb) {
      callback({});
      return () => {}; // Return empty unsubscribe function
    }

    const presenceRef = ref(rtdb, "presence");

    const unsubscribe = onValue(presenceRef, (snapshot) => {
      const presenceData = snapshot.val();
      const userPresence: Record<
        string,
        { lastSeen: Date; isOnline: boolean }
      > = {};

      if (presenceData) {
        Object.keys(presenceData).forEach((uid) => {
          const userData = presenceData[uid];
          userPresence[uid] = {
            isOnline: userData.isOnline || false,
            lastSeen: userData.lastSeen
              ? typeof userData.lastSeen === "number"
                ? new Date(userData.lastSeen)
                : new Date()
              : new Date(),
          };
        });
      }

      callback(userPresence);
    });

    return () => off(presenceRef, "value", unsubscribe);
  }

  /**
   * Force remove a user from presence (admin only)
   */
  async removeUserPresence(uid: string): Promise<void> {
    if (!rtdb) {
      console.warn(
        "Realtime Database not available. Cannot remove user presence."
      );
      return;
    }

    try {
      const userPresenceRef = ref(rtdb, `presence/${uid}`);
      await remove(userPresenceRef);
      console.log("Removed presence for user:", uid);
    } catch (error) {
      console.error("Error removing user presence:", error);
    }
  }

  /**
   * Check if service is initialized
   */
  get initialized(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
export const presenceService = new PresenceService();

// Export utility functions
export const formatLastSeen = (lastSeen: unknown): string => {
  if (!lastSeen) return "Never";

  const now = Date.now();
  const lastSeenTime =
    typeof lastSeen === "number"
      ? lastSeen
      : typeof lastSeen === "object" &&
        lastSeen !== null &&
        "toDate" in lastSeen &&
        typeof (lastSeen as { toDate: unknown }).toDate === "function"
      ? (lastSeen as { toDate: () => Date }).toDate()?.getTime() || now
      : now;
  const diff = now - lastSeenTime;

  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
  return `${Math.floor(diff / 86400000)} days ago`;
};

export const getOnlineStatusColor = (
  isOnline: boolean,
  lastSeen?: unknown
): string => {
  if (isOnline) return "text-green-500";

  if (!lastSeen) return "text-gray-400";

  const now = Date.now();
  const lastSeenTime =
    typeof lastSeen === "number"
      ? lastSeen
      : typeof lastSeen === "object" &&
        lastSeen !== null &&
        "toDate" in lastSeen &&
        typeof (lastSeen as { toDate: unknown }).toDate === "function"
      ? (lastSeen as { toDate: () => Date }).toDate()?.getTime() || 0
      : 0;
  const diff = now - lastSeenTime;

  if (diff < 300000) return "text-yellow-500"; // 5 minutes
  if (diff < 3600000) return "text-orange-500"; // 1 hour
  return "text-gray-400";
};
