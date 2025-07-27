// Client-side Firebase script to upload blog posts
// This uses the Firebase client SDK instead of Admin SDK
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase configuration using your environment variables
const firebaseConfig = {
  apiKey: "AIzaSyAkFHlppkuP8g_g4MpfEza_1Uc1AcGf9fg",
  authDomain: "verilyblog-d1235.firebaseapp.com",
  projectId: "verilyblog-d1235",
  storageBucket: "verilyblog-d1235.firebasestorage.app",
  messagingSenderId: "1075773829740",
  appId: "1:1075773829740:web:706163bd14e29a79c05e49",
  measurementId: "G-JZXQM863DH",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function uploadBlogPosts() {
  try {
    console.log("🚀 Starting blog posts upload...");

    // You would need to sign in as admin here
    // For now, we'll skip authentication and let Firestore rules handle it

    // Read blog data
    const blogData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "data/blog.json"), "utf8")
    );

    console.log(`Found ${blogData.length} blog posts to upload`);

    // Upload each blog post
    for (const post of blogData) {
      console.log(`📝 Uploading: ${post.title}`);

      const docData = {
        ...post,
        id: post.id.toString(),
        status: "published",
        published: true,
        featured: post.featured || false,
        views: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        publishedAt: serverTimestamp(),
      };

      // Use the slug as the document ID for easy querying
      await setDoc(doc(db, "blog", post.slug), docData);
      console.log(`✅ Uploaded: ${post.title}`);
    }

    console.log("🎉 All blog posts uploaded successfully!");
    console.log(
      "📖 You can now visit your blog at: http://localhost:3000/blog"
    );
  } catch (error) {
    console.error("❌ Error uploading blog posts:", error);

    if (error.code === "permission-denied") {
      console.log("\n🔐 Permission denied. This means:");
      console.log("1. You need to be signed in as an admin");
      console.log("2. Or temporarily modify Firestore rules to allow writes");
      console.log(
        "3. Use the web admin tool I created: upload-blogs-admin.html"
      );
    }
  }
}

// Run the upload
uploadBlogPosts();
