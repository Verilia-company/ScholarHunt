import {
  collection,
  addDoc,
  updateDoc,
  doc as firestoreDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { trackEvents } from './analytics';

export interface UserActivity {
  id?: string;
  userId?: string;
  sessionId: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
  location?: {
    country?: string;
    city?: string;
    region?: string;
  };
}

export interface UserSession {
  id?: string;
  userId?: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  pageViews: number;
  actions: number;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser?: string;
  os?: string;
  referrer?: string;
  exitPage?: string;
}

class UserTrackingService {
  private sessionId: string;
  private sessionStartTime: Date;
  private pageViews: number = 0;
  private actions: number = 0;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = new Date();
    this.initializeSession();
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private async initializeSession() {
    if (typeof window === 'undefined') return;

    try {
      const sessionData: Omit<UserSession, 'id'> = {
        sessionId: this.sessionId,
        startTime: this.sessionStartTime,
        pageViews: 0,
        actions: 0,
        deviceType: this.getDeviceType(),
        browser: this.getBrowser(),
        os: this.getOS(),
        referrer: document.referrer || 'direct',
      };

      await addDoc(collection(db, 'userSessions'), {
        ...sessionData,
        startTime: serverTimestamp(),
      });

      // Store session ID for cross-tab tracking
      sessionStorage.setItem('userSessionId', this.sessionId);
    } catch (error) {
      console.error('Error initializing user session:', error);
    }
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private getBrowser(): string {
    if (typeof navigator === 'undefined') return 'unknown';
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  }

  private getOS(): string {
    if (typeof navigator === 'undefined') return 'unknown';
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Other';
  }

  async trackActivity(activity: Omit<UserActivity, 'sessionId' | 'timestamp'>) {
    try {
      const activityData: Omit<UserActivity, 'id'> = {
        ...activity,
        sessionId: this.sessionId,
        timestamp: new Date(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      };

      await addDoc(collection(db, 'userActivities'), {
        ...activityData,
        timestamp: serverTimestamp(),
      });

      this.actions++;
      await this.updateSession();

      // Also track in Google Analytics
      trackEvents.adminActionPerformed({
        action: activity.action,
        resource: activity.resource,
        resourceId: activity.resourceId,
        success: true,
      });
    } catch (error) {
      console.error('Error tracking user activity:', error);
    }
  }

  async trackPageView(page: string) {
    try {
      await this.trackActivity({
        action: 'page_view',
        resource: 'page',
        resourceId: page,
        metadata: {
          url: typeof window !== 'undefined' ? window.location.href : page,
          title: typeof document !== 'undefined' ? document.title : undefined,
        },
      });

      this.pageViews++;
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  async trackScholarshipInteraction(action: string, scholarshipId: string, metadata?: Record<string, any>) {
    await this.trackActivity({
      action: `scholarship_${action}`,
      resource: 'scholarship',
      resourceId: scholarshipId,
      metadata,
    });
  }

  async trackBlogInteraction(action: string, blogId: string, metadata?: Record<string, any>) {
    await this.trackActivity({
      action: `blog_${action}`,
      resource: 'blog',
      resourceId: blogId,
      metadata,
    });
  }

  async trackSearchActivity(searchTerm: string, resultsCount: number, filters?: Record<string, any>) {
    await this.trackActivity({
      action: 'search',
      resource: 'search',
      metadata: {
        searchTerm,
        resultsCount,
        filters,
      },
    });
  }

  async trackWhatsAppInteraction(action: string, metadata?: Record<string, any>) {
    await this.trackActivity({
      action: `whatsapp_${action}`,
      resource: 'whatsapp',
      metadata,
    });
  }

  private async updateSession() {
    try {
      const sessionsRef = collection(db, 'userSessions');
      const q = query(
        sessionsRef,
        where('sessionId', '==', this.sessionId),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const sessionDoc = querySnapshot.docs[0];
        await updateDoc(sessionDoc.ref, {
          pageViews: this.pageViews,
          actions: this.actions,
          duration: Date.now() - this.sessionStartTime.getTime(),
        });
      }
    } catch (error) {
      console.error('Error updating session:', error);
    }
  }

  async endSession(exitPage?: string) {
    try {
      const sessionsRef = collection(db, 'userSessions');
      const q = query(
        sessionsRef,
        where('sessionId', '==', this.sessionId),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const sessionDoc = querySnapshot.docs[0];
        await updateDoc(sessionDoc.ref, {
          endTime: serverTimestamp(),
          duration: Date.now() - this.sessionStartTime.getTime(),
          pageViews: this.pageViews,
          actions: this.actions,
          exitPage,
        });
      }
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }

  // Admin methods for retrieving analytics
  static async getRecentActivities(limitCount: number = 50): Promise<UserActivity[]> {
    try {
      const activitiesRef = collection(db, 'userActivities');
      const q = query(
        activitiesRef,
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as UserActivity[];
    } catch (error) {
      console.error('Error getting recent activities:', error);
      return [];
    }
  }

  static async getUserSessions(limitCount: number = 50): Promise<UserSession[]> {
    try {
      const sessionsRef = collection(db, 'userSessions');
      const q = query(
        sessionsRef,
        orderBy('startTime', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime?.toDate() || new Date(),
        endTime: doc.data().endTime?.toDate(),
      })) as UserSession[];
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return [];
    }
  }

  static async getActivityStats(): Promise<{
    totalActivities: number;
    totalSessions: number;
    averageSessionDuration: number;
    topActions: Array<{ action: string; count: number }>;
    deviceBreakdown: Record<string, number>;
  }> {
    try {
      // This would typically be done with aggregation queries
      // For now, we'll return mock data structure
      return {
        totalActivities: 0,
        totalSessions: 0,
        averageSessionDuration: 0,
        topActions: [],
        deviceBreakdown: {},
      };
    } catch (error) {
      console.error('Error getting activity stats:', error);
      return {
        totalActivities: 0,
        totalSessions: 0,
        averageSessionDuration: 0,
        topActions: [],
        deviceBreakdown: {},
      };
    }
  }
}

// Create singleton instance
export const userTracker = new UserTrackingService();

// Hook for React components
export function useUserTracking() {
  const trackPageView = (page: string) => userTracker.trackPageView(page);
  const trackActivity = (activity: Omit<UserActivity, 'sessionId' | 'timestamp'>) => 
    userTracker.trackActivity(activity);
  const trackScholarshipInteraction = (action: string, scholarshipId: string, metadata?: Record<string, any>) =>
    userTracker.trackScholarshipInteraction(action, scholarshipId, metadata);
  const trackBlogInteraction = (action: string, blogId: string, metadata?: Record<string, any>) =>
    userTracker.trackBlogInteraction(action, blogId, metadata);
  const trackSearchActivity = (searchTerm: string, resultsCount: number, filters?: Record<string, any>) =>
    userTracker.trackSearchActivity(searchTerm, resultsCount, filters);
  const trackWhatsAppInteraction = (action: string, metadata?: Record<string, any>) =>
    userTracker.trackWhatsAppInteraction(action, metadata);

  return {
    trackPageView,
    trackActivity,
    trackScholarshipInteraction,
    trackBlogInteraction,
    trackSearchActivity,
    trackWhatsAppInteraction,
  };
}

// Auto-track page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    userTracker.endSession(window.location.pathname);
  });

  // Track page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      userTracker.endSession(window.location.pathname);
    }
  });
}