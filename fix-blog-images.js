// Update blog posts to use SVG images
const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  doc,
  updateDoc,
  getDocs,
} = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyAkFHlppkuP8g_g4MpfEza_1Uc1AcGf9fg",
  authDomain: "scholarhunt-9b00f.firebaseapp.com",
  projectId: "scholarhunt-9b00f",
  storageBucket: "scholarhunt-9b00f.firebasestorage.app",
  messagingSenderId: "1075773829740",
  appId: "1:1075773829740:web:706163bd14e29a79c05e49",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateBlogImages() {
  try {
    const querySnapshot = await getDocs(collection(db, "blog"));

    const imageMap = {
      "complete-guide-scholarships-ugandan-students-2025":
        "/blog/scholarship-guide-2025.svg",
      "writing-winning-scholarship-essay-tips-techniques":
        "/blog/essay-writing-tips.svg",
      "top-universities-accept-ugandan-students-scholarships":
        "/blog/top-universities-scholarships.svg",
      "scholarship-interview-preparation-guide-success":
        "/blog/scholarship-interview-guide.svg",
      "why waiting to graduate": "/blog/scholarship-guide-2025.svg", // Default for our test post
    };

    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      const newImage =
        imageMap[data.slug] || "/blog/scholarship-guide-2025.svg";

      await updateDoc(doc(db, "blog", docSnap.id), {
        image: newImage,
        updatedAt: new Date(),
      });

      console.log(`✅ Updated ${data.title} with image: ${newImage}`);
    }

    console.log("🎉 All blog images updated!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

updateBlogImages();
