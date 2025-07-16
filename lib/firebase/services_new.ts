import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  QueryConstraint,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";

// Types
export interface User {
  id: string;
  email: string;
  displayName?: string;
  role: "admin" | "user";
  isActive: boolean;
  createdAt: unknown;
  lastLoginAt?: unknown;
  profilePicture?: string;
  bio?: string;
}

export interface Scholarship {
  id: string;
  title: string;
  description: string;
  amount: string;
  deadline: string;
  eligibility: string[];
  requirements: string[];
  status: "active" | "draft" | "expired";
  university: string;
  country: string;
  level: string;
  fieldOfStudy: string;
  provider?: string;
  location?: string;
  type?: string;
  applicationUrl?: string;
  contactEmail?: string;
  createdAt: unknown;
  updatedAt: unknown;
  createdBy?: string;
  views?: number;
  tags?: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  status: "published" | "draft" | "archived";
  featured: boolean;
  published: boolean;
  image?: string;
  readTime: number;
  createdAt: unknown;
  updatedAt: unknown;
  publishedAt?: unknown;
  views?: number;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  socialImage?: string;
}

export interface NewsletterSubscription {
  email: string;
  subscribedAt: unknown;
  isActive: boolean;
  unsubscribedAt?: unknown;
  source?: string;
}

export interface ScholarshipSubmission {
  id: string;
  title: string;
  description: string;
  provider: string;
  amount: string;
  deadline: string;
  level: string[];
  field: string;
  location: string;
  type: string;
  eligibility: string;
  applicationUrl?: string;
  contactEmail: string;
  submitterName: string;
  submitterEmail: string;
  submitterOrganization?: string;
  additionalNotes?: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: unknown;
  reviewedAt?: unknown;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface Activity {
  id: string;
  action: string;
  item: string;
  resourceType: "scholarship" | "blog" | "user" | "application";
  resourceId?: string;
  userId?: string;
  userName?: string;
  timestamp: unknown;
  metadata?: unknown;
}

export interface AdminStats {
  totalScholarships: number;
  totalBlogPosts: number;
  totalUsers: number;
  monthlyViews: number;
  pendingApplications: number;
  publishedBlogs: number;
  activeScholarships: number;
  newsletterSubscribers: number;
}

export interface SiteSettings {
  id: string;
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  adminEmail: string;
  maxScholarships: number;
  maxBlogPosts: number;
  enableRegistration: boolean;
  enableComments: boolean;
  maintenanceMode: boolean;
  seoSettings: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    ogImage?: string;
  };
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  updatedAt: string;
  updatedBy: string;
}

// Analytics Services
export const analyticsService = {
  async logActivity(activity: {
    userId?: string;
    userName?: string;
    action: string;
    item: string;
    resourceType: "scholarship" | "blog" | "user" | "application";
    resourceId?: string;
    metadata?: unknown;
  }): Promise<void> {
    await addDoc(collection(db, "activities"), {
      ...activity,
      timestamp: serverTimestamp(),
    });
  },

  async getRecentActivities(limitCount: number = 10): Promise<Activity[]> {
    const q = query(
      collection(db, "activities"),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Activity[];
  },

  async getAdminStats(): Promise<AdminStats> {
    try {
      const [scholarships, blogPosts, users, newsletterSubs, submissions] =
        await Promise.all([
          scholarshipService.getScholarships(),
          blogService.getBlogPosts(),
          userService.getAllUsers(),
          newsletterService.getAllSubscriptions(),
          submissionService.getSubmissions(),
        ]);

      const activeScholarships = scholarships.filter(
        (s) => s.status === "active"
      ).length;
      const publishedBlogs = blogPosts.filter(
        (b) => b.status === "published"
      ).length;
      const pendingApplications = submissions.filter(
        (s) => s.status === "pending"
      ).length;

      // Calculate monthly views
      const monthlyViews =
        scholarships.reduce((total, s) => total + (s.views || 0), 0) +
        blogPosts.reduce((total, b) => total + (b.views || 0), 0);

      return {
        totalScholarships: scholarships.length,
        totalBlogPosts: blogPosts.length,
        totalUsers: users.length,
        monthlyViews,
        pendingApplications,
        publishedBlogs,
        activeScholarships,
        newsletterSubscribers: newsletterSubs.length,
      };
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      return {
        totalScholarships: 0,
        totalBlogPosts: 0,
        totalUsers: 0,
        monthlyViews: 0,
        pendingApplications: 0,
        publishedBlogs: 0,
        activeScholarships: 0,
        newsletterSubscribers: 0,
      };
    }
  },

  async incrementPageView(
    resourceType: string,
    resourceId: string
  ): Promise<void> {
    await addDoc(collection(db, "pageViews"), {
      resourceType,
      resourceId,
      timestamp: serverTimestamp(),
    });
  },
};

// User Services
export const userService = {
  async createUser(userData: Omit<User, "id" | "createdAt">): Promise<string> {
    const docRef = await addDoc(collection(db, "users"), {
      ...userData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async getUser(userId: string): Promise<User | null> {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User;
    }
    return null;
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const docRef = doc(db, "users", userId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  async getAllUsers(): Promise<User[]> {
    const querySnapshot = await getDocs(collection(db, "users"));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];
  },

  async deleteUser(userId: string): Promise<void> {
    const docRef = doc(db, "users", userId);
    await deleteDoc(docRef);
  },
};

// Scholarship Services
export const scholarshipService = {
  async createScholarship(
    scholarshipData: Omit<Scholarship, "id" | "createdAt" | "updatedAt">,
    createdBy?: { id: string; name: string }
  ): Promise<string> {
    const docRef = await addDoc(collection(db, "scholarships"), {
      ...scholarshipData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      views: 0,
    });

    // Log activity
    if (createdBy) {
      await analyticsService.logActivity({
        userId: createdBy.id,
        userName: createdBy.name,
        action: "New scholarship added",
        item: scholarshipData.title,
        resourceType: "scholarship",
        resourceId: docRef.id,
      });
    }

    return docRef.id;
  },

  async getScholarship(scholarshipId: string): Promise<Scholarship | null> {
    const docRef = doc(db, "scholarships", scholarshipId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Scholarship;
    }
    return null;
  },

  async updateScholarship(
    scholarshipId: string,
    updates: Partial<Scholarship>,
    updatedBy?: { id: string; name: string }
  ): Promise<void> {
    const docRef = doc(db, "scholarships", scholarshipId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    // Log activity
    if (updatedBy) {
      const scholarship = await this.getScholarship(scholarshipId);
      if (scholarship) {
        await analyticsService.logActivity({
          userId: updatedBy.id,
          userName: updatedBy.name,
          action: "Scholarship updated",
          item: scholarship.title,
          resourceType: "scholarship",
          resourceId: scholarshipId,
        });
      }
    }
  },

  async deleteScholarship(scholarshipId: string): Promise<void> {
    const docRef = doc(db, "scholarships", scholarshipId);
    await deleteDoc(docRef);
  },

  async getScholarships(filters?: {
    status?: string;
    level?: string;
    country?: string;
    limit?: number;
  }): Promise<Scholarship[]> {
    const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];

    if (filters?.status) {
      constraints.push(where("status", "==", filters.status));
    }
    if (filters?.level) {
      constraints.push(where("level", "==", filters.level));
    }
    if (filters?.country) {
      constraints.push(where("country", "==", filters.country));
    }
    if (filters?.limit) {
      constraints.push(limit(filters.limit));
    }

    const q = query(collection(db, "scholarships"), ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Scholarship[];
  },

  async incrementViews(scholarshipId: string): Promise<void> {
    const docRef = doc(db, "scholarships", scholarshipId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const currentViews = docSnap.data().views || 0;
      await updateDoc(docRef, {
        views: currentViews + 1,
      });
    }
  },

  async getActiveScholarships(): Promise<Scholarship[]> {
    return this.getScholarships({ status: "active" });
  },

  async searchScholarships(searchTerm: string): Promise<Scholarship[]> {
    const scholarships = await this.getScholarships();
    return scholarships.filter(
      (scholarship) =>
        scholarship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scholarship.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        scholarship.university
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        scholarship.fieldOfStudy
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  },
};

// Blog Services
export const blogService = {
  async createBlogPost(
    blogData: Omit<BlogPost, "id" | "createdAt" | "updatedAt">,
    createdBy?: { id: string; name: string }
  ): Promise<string> {
    const docRef = await addDoc(collection(db, "blog"), {
      ...blogData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      publishedAt: blogData.status === "published" ? serverTimestamp() : null,
      views: 0,
    });

    // Log activity
    if (createdBy) {
      await analyticsService.logActivity({
        userId: createdBy.id,
        userName: createdBy.name,
        action: "Blog post published",
        item: blogData.title,
        resourceType: "blog",
        resourceId: docRef.id,
      });
    }

    return docRef.id;
  },

  async getBlogPost(postId: string): Promise<BlogPost | null> {
    const docRef = doc(db, "blog", postId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as BlogPost;
    }
    return null;
  },

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    const q = query(collection(db, "blog"), where("slug", "==", slug));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as BlogPost;
    }
    return null;
  },

  async updateBlogPost(
    postId: string,
    updates: Partial<BlogPost>
  ): Promise<void> {
    const docRef = doc(db, "blog", postId);
    const updateData: Partial<BlogPost> = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    if (updates.status === "published") {
      updateData.publishedAt = serverTimestamp();
    }

    await updateDoc(docRef, updateData);
  },

  async deleteBlogPost(postId: string): Promise<void> {
    const docRef = doc(db, "blog", postId);
    await deleteDoc(docRef);
  },

  async getBlogPosts(filters?: {
    status?: string;
    category?: string;
    limit?: number;
  }): Promise<BlogPost[]> {
    const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];

    if (filters?.status) {
      constraints.push(where("status", "==", filters.status));
    }
    if (filters?.category) {
      constraints.push(where("category", "==", filters.category));
    }
    if (filters?.limit) {
      constraints.push(limit(filters.limit));
    }

    const q = query(collection(db, "blog"), ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as BlogPost[];
  },

  async getPublishedPosts(): Promise<BlogPost[]> {
    return this.getBlogPosts({ status: "published" });
  },

  async incrementViews(postId: string): Promise<void> {
    const docRef = doc(db, "blog", postId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const currentViews = docSnap.data().views || 0;
      await updateDoc(docRef, {
        views: currentViews + 1,
      });
    }
  },
};

// Newsletter Services
export const newsletterService = {
  async subscribe(email: string, source?: string): Promise<void> {
    const docRef = doc(db, "newsletter", email);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && docSnap.data().isActive) {
      throw new Error("Email already subscribed");
    }

    await setDoc(
      docRef,
      {
        email,
        subscribedAt: serverTimestamp(),
        isActive: true,
        source: source || "website",
      },
      { merge: true }
    );
  },

  async unsubscribe(email: string): Promise<void> {
    const docRef = doc(db, "newsletter", email);
    await updateDoc(docRef, {
      isActive: false,
      unsubscribedAt: serverTimestamp(),
    });
  },

  async getAllSubscriptions(): Promise<NewsletterSubscription[]> {
    const q = query(
      collection(db, "newsletter"),
      where("isActive", "==", true),
      orderBy("subscribedAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      email: doc.id,
      ...doc.data(),
    })) as NewsletterSubscription[];
  },

  async getSubscriptionCount(): Promise<number> {
    const subscriptions = await this.getAllSubscriptions();
    return subscriptions.length;
  },
};

// Submission Services
export const submissionService = {
  async createSubmission(
    submissionData: Omit<ScholarshipSubmission, "id" | "submittedAt" | "status">
  ): Promise<string> {
    const docRef = await addDoc(collection(db, "scholarshipSubmissions"), {
      ...submissionData,
      status: "pending",
      submittedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async getSubmission(
    submissionId: string
  ): Promise<ScholarshipSubmission | null> {
    const docRef = doc(db, "scholarshipSubmissions", submissionId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as ScholarshipSubmission;
    }
    return null;
  },

  async updateSubmission(
    submissionId: string,
    updates: Partial<ScholarshipSubmission>
  ): Promise<void> {
    const docRef = doc(db, "scholarshipSubmissions", submissionId);
    const updateData: Partial<ScholarshipSubmission> = { ...updates };

    if (updates.status && ["approved", "rejected"].includes(updates.status)) {
      updateData.reviewedAt = serverTimestamp();
    }

    await updateDoc(docRef, updateData);
  },

  async getSubmissions(status?: string): Promise<ScholarshipSubmission[]> {
    const constraints: QueryConstraint[] = [orderBy("submittedAt", "desc")];

    if (status) {
      constraints.push(where("status", "==", status));
    }

    const q = query(collection(db, "scholarshipSubmissions"), ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ScholarshipSubmission[];
  },

  async approveSubmission(
    submissionId: string,
    reviewedBy: string,
    reviewNotes?: string
  ): Promise<void> {
    await this.updateSubmission(submissionId, {
      status: "approved",
      reviewedBy,
      reviewNotes,
    });
  },

  async rejectSubmission(
    submissionId: string,
    reviewedBy: string,
    reviewNotes?: string
  ): Promise<void> {
    await this.updateSubmission(submissionId, {
      status: "rejected",
      reviewedBy,
      reviewNotes,
    });
  },
};

// Settings Service
export const settingsService = {
  async getSettings(): Promise<SiteSettings | null> {
    const docRef = doc(db, "settings", "site");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as SiteSettings;
    }
    return null;
  },

  async updateSettings(
    settings: Partial<Omit<SiteSettings, "id" | "updatedAt">>
  ): Promise<void> {
    const docRef = doc(db, "settings", "site");
    await setDoc(
      docRef,
      {
        ...settings,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  },
};

// Backup service
export const backupService = {
  async exportData(): Promise<{
    scholarships: Scholarship[];
    blogPosts: BlogPost[];
    users: User[];
    settings: SiteSettings | null;
    exportDate: string;
  }> {
    const [scholarships, blogPosts, users, settings] = await Promise.all([
      scholarshipService.getScholarships(),
      blogService.getBlogPosts(),
      userService.getAllUsers(),
      settingsService.getSettings(),
    ]);

    return {
      scholarships,
      blogPosts,
      users,
      settings,
      exportDate: new Date().toISOString(),
    };
  },
};

// Utility function for error handling
export const handleFirebaseError = (error: unknown): string => {
  console.error("Firebase Error:", error);

  if (error && typeof error === 'object' && 'code' in error) {
    switch ((error as { code: string }).code) {
      case "permission-denied":
        return "You do not have permission to perform this action.";
      case "not-found":
        return "The requested resource was not found.";
      case "already-exists":
        return "This resource already exists.";
      case "unavailable":
        return "Service is temporarily unavailable. Please try again later.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  }
  
  return "An unexpected error occurred. Please try again.";
};

// Export all services
export const firebaseServices = {
  user: userService,
  scholarship: scholarshipService,
  blog: blogService,
  newsletter: newsletterService,
  submission: submissionService,
  analytics: analyticsService,
  settings: settingsService,
  backup: backupService,
};
