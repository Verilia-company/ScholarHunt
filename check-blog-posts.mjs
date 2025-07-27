// Script to check what blog posts are in the database
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

async function checkBlogPosts() {
  try {
    console.log("📖 Checking blog posts in database...");

    const querySnapshot = await getDocs(collection(db, "blog"));

    if (querySnapshot.empty) {
      console.log("❌ No blog posts found in database");
      return;
    }

    console.log(`✅ Found ${querySnapshot.size} blog posts:`);
    console.log("=====================================");

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`ID: ${doc.id}`);
      console.log(`Title: ${data.title || "No title"}`);
      console.log(`Slug: ${data.slug || "No slug"}`);
      console.log(`Author: ${data.author || "No author"}`);
      console.log(`Status: ${data.status || "No status"}`);
      console.log(`Published: ${data.published || false}`);
      console.log("-------------------------------------");
    });
  } catch (error) {
    console.error("❌ Error checking blog posts:", error);
  }
}

checkBlogPosts();
