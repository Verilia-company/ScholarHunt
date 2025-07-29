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
  writeBatch,
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
  aboutPage: {
    contactEmail: string;
    contactPhone: string;
    teamMembers: Array<{
      name: string;
      role: string;
      bio: string;
      image: string;
    }>;
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

  // Helper function to format blog post content
  formatBlogPostContent(post: Record<string, unknown>): BlogPost {
    // Function to format content for HTML display
    const formatContent = (content: string) => {
      if (!content) return "";

      // Convert markdown-style headings to HTML
      let formattedContent = content
        .replace(/^### (.*$)/gim, "<h3>$1</h3>")
        .replace(/^## (.*$)/gim, "<h2>$1</h2>")
        .replace(/^# (.*$)/gim, "<h1>$1</h1>");

      // Convert double line breaks to paragraph breaks
      formattedContent = formattedContent
        .split("\n\n")
        .map((paragraph) => {
          // Skip empty paragraphs
          if (!paragraph.trim()) return "";

          // Don't wrap headings in paragraphs
          if (paragraph.trim().startsWith("<h")) {
            return paragraph.trim();
          }

          // Handle lists (lines starting with -)
          if (paragraph.includes("\n-")) {
            const lines = paragraph.split("\n");
            let result = "";
            let inList = false;

            for (const line of lines) {
              if (line.trim().startsWith("-")) {
                if (!inList) {
                  result += "<ul>";
                  inList = true;
                }
                result += `<li>${line.trim().substring(1).trim()}</li>`;
              } else {
                if (inList) {
                  result += "</ul>";
                  inList = false;
                }
                if (line.trim()) {
                  result += `<p>${line.trim()}</p>`;
                }
              }
            }

            if (inList) {
              result += "</ul>";
            }

            return result;
          }

          // Handle numbered lists (lines starting with digits)
          if (paragraph.includes("\n") && /^\d+\./.test(paragraph.trim())) {
            const lines = paragraph.split("\n");
            let result = "<ol>";

            for (const line of lines) {
              if (/^\d+\./.test(line.trim())) {
                const content = line.trim().replace(/^\d+\.\s*/, "");
                result += `<li>${content}</li>`;
              }
            }

            result += "</ol>";
            return result;
          }

          // Regular paragraph
          return `<p>${paragraph.trim()}</p>`;
        })
        .filter((p) => p !== "")
        .join("\n");

      return formattedContent;
    };

    // Function to get appropriate backup image
    const getBackupImage = (title: string) => {
      const slug = title.toLowerCase();
      if (slug.includes("scholarship") && slug.includes("guide")) {
        return "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop";
      } else if (slug.includes("interview")) {
        return "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop";
      } else if (slug.includes("university") || slug.includes("universities")) {
        return "https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=400&fit=crop";
      } else if (slug.includes("essay") || slug.includes("writing")) {
        return "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=400&fit=crop";
      } else {
        return "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=400&fit=crop";
      }
    };

    return {
      ...post,
      // Format content for proper HTML display
      content: formatContent((post as { content?: string }).content || ""),
      // Use local SVG if available, otherwise use professional backup images
      image:
        (post as { image?: string }).image &&
        (post as { image: string }).image.startsWith("/blog/") &&
        (post as { image: string }).image.endsWith(".svg")
          ? (post as { image: string }).image
          : getBackupImage((post as { title?: string }).title || ""),
      // Ensure proper date handling
      createdAt: (post as { createdAt?: Date }).createdAt || new Date(),
      publishedAt:
        (post as { publishedAt?: Date }).publishedAt ||
        (post as { createdAt?: Date }).createdAt ||
        new Date(),
      updatedAt: (post as { updatedAt?: Date }).updatedAt || new Date(),
    } as BlogPost;
  },

  async getBlogPost(postId: string): Promise<BlogPost | null> {
    const docRef = doc(db, "blog", postId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const rawPost = { id: docSnap.id, ...docSnap.data() };
      return this.formatBlogPostContent(rawPost);
    }
    return null;
  },

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    const q = query(collection(db, "blog"), where("slug", "==", slug));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const rawPost = { id: doc.id, ...doc.data() };
      return this.formatBlogPostContent(rawPost);
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
    let q;

    // If no filters, just order by createdAt
    if (!filters?.status && !filters?.category) {
      q = query(collection(db, "blog"), orderBy("createdAt", "desc"));
    } else {
      // Use simple queries to avoid index requirements
      const constraints: QueryConstraint[] = [];

      if (filters?.status) {
        constraints.push(where("status", "==", filters.status));
      }
      if (filters?.category) {
        constraints.push(where("category", "==", filters.category));
      }
      if (filters?.limit) {
        constraints.push(limit(filters.limit));
      }

      q = query(collection(db, "blog"), ...constraints);
    }

    const querySnapshot = await getDocs(q);

    let posts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as BlogPost[];

    // Process posts to add default image and fix dates
    posts = posts.map((post) => {
      // Function to get appropriate backup image
      const getBackupImage = (title: string) => {
        const slug = title.toLowerCase();
        if (slug.includes("scholarship") && slug.includes("guide")) {
          return "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop";
        } else if (slug.includes("interview")) {
          return "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop";
        } else if (
          slug.includes("university") ||
          slug.includes("universities")
        ) {
          return "https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=400&fit=crop";
        } else if (slug.includes("essay") || slug.includes("writing")) {
          return "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=400&fit=crop";
        } else {
          return "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=400&fit=crop";
        }
      };

      // Function to format content for HTML display
      const formatContent = (content: string) => {
        if (!content) return "";

        // Convert markdown-style headings to HTML
        let formattedContent = content
          .replace(/^### (.*$)/gim, "<h3>$1</h3>")
          .replace(/^## (.*$)/gim, "<h2>$1</h2>")
          .replace(/^# (.*$)/gim, "<h1>$1</h1>");

        // Convert double line breaks to paragraph breaks
        formattedContent = formattedContent
          .split("\n\n")
          .map((paragraph) => {
            // Skip empty paragraphs
            if (!paragraph.trim()) return "";

            // Don't wrap headings in paragraphs
            if (paragraph.trim().startsWith("<h")) {
              return paragraph.trim();
            }

            // Handle lists (lines starting with -)
            if (paragraph.includes("\n-")) {
              const lines = paragraph.split("\n");
              let result = "";
              let inList = false;

              for (const line of lines) {
                if (line.trim().startsWith("-")) {
                  if (!inList) {
                    result += "<ul>";
                    inList = true;
                  }
                  result += `<li>${line.trim().substring(1).trim()}</li>`;
                } else {
                  if (inList) {
                    result += "</ul>";
                    inList = false;
                  }
                  if (line.trim()) {
                    result += `<p>${line.trim()}</p>`;
                  }
                }
              }

              if (inList) {
                result += "</ul>";
              }

              return result;
            }

            // Handle numbered lists (lines starting with digits)
            if (paragraph.includes("\n") && /^\d+\./.test(paragraph.trim())) {
              const lines = paragraph.split("\n");
              let result = "<ol>";

              for (const line of lines) {
                if (/^\d+\./.test(line.trim())) {
                  const content = line.trim().replace(/^\d+\.\s*/, "");
                  result += `<li>${content}</li>`;
                }
              }

              result += "</ol>";
              return result;
            }

            // Regular paragraph
            return `<p>${paragraph.trim()}</p>`;
          })
          .filter((p) => p !== "")
          .join("\n");

        return formattedContent;
      };

      return {
        ...post,
        // Format content for proper HTML display
        content: formatContent(post.content || ""),
        // Use local SVG if available, otherwise use professional backup images
        image:
          post.image &&
          post.image.startsWith("/blog/") &&
          post.image.endsWith(".svg")
            ? post.image
            : getBackupImage(post.title),
        // Ensure proper date handling
        createdAt: post.createdAt || new Date(),
        publishedAt: post.publishedAt || post.createdAt || new Date(),
        updatedAt: post.updatedAt || new Date(),
      };
    });

    // Filter and sort in memory to avoid index requirements
    if (filters?.status) {
      posts = posts.filter((post) => post.status === filters.status);
    }
    if (filters?.category) {
      posts = posts.filter((post) => post.category === filters.category);
    }

    // Sort by createdAt in memory (most recent first)
    posts.sort((a, b) => {
      // Handle various date formats
      const getDateValue = (dateField: unknown) => {
        if (!dateField) return 0;
        if (dateField instanceof Date) return dateField.getTime();
        if (typeof dateField === "string") return new Date(dateField).getTime();
        if (
          typeof dateField === "object" &&
          dateField &&
          "toDate" in dateField &&
          typeof (dateField as { toDate: unknown }).toDate === "function"
        ) {
          return (dateField as { toDate: () => Date }).toDate().getTime(); // Firestore Timestamp
        }
        if (
          typeof dateField === "object" &&
          dateField &&
          "seconds" in dateField &&
          typeof (dateField as { seconds: unknown }).seconds === "number"
        ) {
          return new Date(
            (dateField as { seconds: number }).seconds * 1000
          ).getTime(); // Firestore Timestamp object
        }
        return 0; // fallback for unknown date formats
      };

      const aDate = getDateValue(a.publishedAt || a.createdAt);
      const bDate = getDateValue(b.publishedAt || b.createdAt);

      return bDate - aDate; // Most recent first
    });

    // Apply limit after sorting
    if (filters?.limit) {
      posts = posts.slice(0, filters.limit);
    }

    return posts;
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
  async initializeDefaultSettings(): Promise<SiteSettings> {
    const defaultSettings: Omit<SiteSettings, "id"> = {
      siteName: "ScholarHunt",
      siteDescription: "Find and apply for scholarships in Uganda and beyond",
      contactEmail: "contact@scholarhunt.com",
      adminEmail: "admin@scholarhunt.com",
      maxScholarships: 100,
      maxBlogPosts: 50,
      enableRegistration: true,
      enableComments: false,
      maintenanceMode: false,
      seoSettings: {
        metaTitle: "ScholarHunt - Find Scholarships in Uganda",
        metaDescription:
          "Discover scholarship opportunities in Uganda and beyond. Apply for education funding and achieve your academic dreams.",
        metaKeywords: [
          "scholarships",
          "Uganda",
          "education",
          "funding",
          "students",
        ],
      },
      socialMedia: {},
      aboutPage: {
        contactEmail: "info@scholarhunt.ug",
        contactPhone: "+256 XXX XXX XXX",
        teamMembers: [
          {
            name: "Sarah Mukasa",
            role: "Founder & CEO",
            bio: "Education advocate with 10+ years of experience in student services.",
            image: "/team/sarah-mukasa.jpg",
          },
        ],
      },
      updatedAt: new Date().toISOString(),
      updatedBy: "system",
    };

    const docRef = doc(db, "settings", "site");
    await setDoc(docRef, defaultSettings);
    return { id: "site", ...defaultSettings };
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

  async importScholarships(scholarships: Scholarship[]): Promise<void> {
    const batch = writeBatch(db);
    scholarships.forEach((scholarship) => {
      const docRef = doc(collection(db, "scholarships"));
      batch.set(docRef, {
        ...scholarship,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });
    await batch.commit();
  },

  async importBlogPosts(blogPosts: BlogPost[]): Promise<void> {
    const batch = writeBatch(db);
    blogPosts.forEach((post) => {
      const docRef = doc(collection(db, "blog"));
      batch.set(docRef, {
        ...post,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });
    await batch.commit();
  },
};

// Utility function for error handling
export const handleFirebaseError = (error: unknown): string => {
  console.error("Firebase Error:", error);

  if (error && typeof error === "object" && "code" in error) {
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
