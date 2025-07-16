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
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { BlogPost } from "./services";

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

  // Simplified query - fetch all and filter client-side (temporary solution)
  async getPublishedPosts(): Promise<BlogPost[]> {
    try {
      // Simple query without composite index requirement
      const q = query(collection(db, "blog"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const allPosts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as BlogPost[];

      // Filter for published posts client-side
      return allPosts.filter((post) => post.status === "published");
    } catch (error) {
      console.warn("Query failed, falling back to simple fetch:", error);

      // Fallback: Get all documents and filter client-side
      const querySnapshot = await getDocs(collection(db, "blog"));
      const allPosts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as BlogPost[];

      return allPosts
        .filter((post) => post.status === "published")
        .sort((a, b) => {
          // Client-side sorting by createdAt
          const aTime = a.createdAt?.toDate?.() || new Date(0);
          const bTime = b.createdAt?.toDate?.() || new Date(0);
          return bTime.getTime() - aTime.getTime();
        });
    }
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
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return bTime.getTime() - aTime.getTime();
      });
    }
  },

  async updateBlogPost(
    postId: string,
    updates: Partial<BlogPost>
  ): Promise<void> {
    const docRef = doc(db, "blog", postId);
    const updateData: any = {
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
