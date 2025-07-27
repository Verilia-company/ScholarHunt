// Script to fix the problematic blog post slug
import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAkFHlppkuP8g_g4MpfEza_1Uc1AcGf9fg",
  authDomain: "verilyblog-d1235.firebaseapp.com",
  projectId: "verilyblog-d1235",
  storageBucket: "verilyblog-d1235.firebasestorage.app",
  messagingSenderId: "1075773829740",
  appId: "1:1075773829740:web:706163bd14e29a79c05e49",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixBlogPost() {
  try {
    console.log("🔧 Fixing blog post slug...");

    // Get the document with the problematic slug
    const docRef = doc(db, "blog", "9kIqHuPwjTwBmMl7qwNd");
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.log("❌ Document not found");
      return;
    }

    const data = docSnap.data();
    console.log("Current slug:", data.slug);

    // Fix the slug by replacing spaces with hyphens and making it URL-friendly
    const fixedSlug =
      "why-waiting-to-graduate-first-is-no-longer-the-smartest-path";

    // Update the document
    await updateDoc(docRef, {
      slug: fixedSlug,
    });

    console.log("✅ Fixed slug to:", fixedSlug);
    console.log(
      "🔗 Blog post should now be accessible at: http://localhost:3000/blog/" +
        fixedSlug
    );
  } catch (error) {
    console.error("❌ Error fixing blog post:", error);

    if (error.code === "permission-denied") {
      console.log("\n🔐 Permission denied. Temporarily enabling writes...");
      console.log("Please run: firebase deploy --only firestore:rules");
      console.log("After temporarily changing the rules to allow writes.");
    }
  }
}

fixBlogPost();
