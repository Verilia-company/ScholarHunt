// Temporary Blog Service without Complex Queries
// Use this during development until indexes are set up

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  QueryConstraint,
  where,
  limit,
} from "firebase/firestore";
import { db } from "../firebase";

// Types
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

export const tempBlogService = {
  async createBlogPost(
    blogData: Omit<BlogPost, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const docRef = await addDoc(collection(db, "blog"), {
      ...blogData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      publishedAt: blogData.status === "published" ? serverTimestamp() : null,
      views: 0,
    });
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

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        publishedAt: data.publishedAt,
      } as BlogPost;
    });
  },

  async getAllPosts(): Promise<BlogPost[]> {
    try {
      const q = query(collection(db, "blog"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as BlogPost[];
    } catch (error) {
      console.warn("Query failed, falling back to simple fetch:", error);

      const querySnapshot = await getDocs(collection(db, "blog"));
      const allPosts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as BlogPost[];

      return allPosts.sort((a, b) => {
        const aTime = (a.createdAt && typeof a.createdAt === "object" && a.createdAt !== null && "toDate" in a.createdAt && typeof (a.createdAt as { toDate: unknown }).toDate === "function")
          ? (a.createdAt as { toDate: () => Date }).toDate()
          : new Date(a.createdAt as string | number | Date);
        const bTime = (b.createdAt && typeof b.createdAt === "object" && b.createdAt !== null && "toDate" in b.createdAt && typeof (b.createdAt as { toDate: unknown }).toDate === "function")
          ? (b.createdAt as { toDate: () => Date }).toDate()
          : new Date(b.createdAt as string | number | Date);
        return bTime.getTime() - aTime.getTime();
      });
    }
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
};
