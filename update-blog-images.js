// Update blog posts to use placeholder images and ensure proper date sorting
const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  doc,
  updateDoc,
  getDocs,
} = require("firebase/firestore");

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAkFHlppkuP8g_g4MpfEza_1Uc1AcGf9fg",
  authDomain: "scholarhunt-9b00f.firebaseapp.com",
  projectId: "scholarhunt-9b00f",
  storageBucket: "scholarhunt-9b00f.firebasestorage.app",
  messagingSenderId: "1075773829740",
  appId: "1:1075773829740:web:706163bd14e29a79c05e49",
  measurementId: "G-JZXQM863DH",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateBlogImages() {
  try {
    // Get all blog posts
    const querySnapshot = await getDocs(collection(db, "blog"));

    console.log(`Found ${querySnapshot.docs.length} blog posts to update`);

    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();

      // Create a placeholder image URL or use a default
      const defaultImage =
        "https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=ScholarHunt+Blog";

      // Update the document with proper image and dates
      const updateData = {
        image: defaultImage,
        // Ensure dates are properly formatted
        createdAt: data.createdAt || new Date(),
        updatedAt: new Date(),
        publishedAt: data.publishedAt || data.createdAt || new Date(),
      };

      await updateDoc(doc(db, "blog", docSnap.id), updateData);
      console.log(`✅ Updated: ${data.title}`);
    }

    console.log("🎉 All blog posts updated with placeholder images!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating blog posts:", error);
    process.exit(1);
  }
}

updateBlogImages();
