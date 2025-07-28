// Simple Node.js script to add blog post to Firestore
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, doc, setDoc } = require("firebase/firestore");

// Firebase config (same as your app)
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

async function addBlogPost() {
  try {
    const blogPost = {
      id: "why-waiting-to-graduate",
      slug: "why waiting to graduate",
      title: "Why Waiting to Graduate Might Be the Best Decision You Make",
      excerpt:
        "Sometimes taking a gap year or delaying graduation can open doors to unexpected opportunities and personal growth.",
      content: `# Why Waiting to Graduate Might Be the Best Decision You Make

In today's fast-paced world, there's immense pressure to complete your education as quickly as possible and jump straight into the workforce. However, sometimes taking a step back and waiting to graduate can be one of the most beneficial decisions you'll ever make.

## The Benefits of Taking Your Time

### 1. Gain Real-World Experience
Taking time before graduating allows you to gain valuable work experience, internships, or volunteer opportunities that can significantly enhance your resume and give you clarity about your career path.

### 2. Financial Stability
Working for a year or two can help you save money for your final year of studies, reducing student debt and financial stress.

### 3. Personal Growth
Time away from academic pressure allows for personal development, travel opportunities, and the chance to discover new interests and passions.

### 4. Network Building
Working in your field of interest helps you build professional networks that can be invaluable when you do graduate and start looking for permanent employment.

## Making the Most of Your Gap Time

If you decide to delay graduation, make sure to:
- Set clear goals for what you want to achieve
- Stay connected with your academic institution
- Keep learning through online courses or certifications
- Document your experiences for future applications

## Conclusion

Remember, education is a marathon, not a sprint. Taking time to grow personally and professionally before graduating can set you up for greater success in the long run. The key is to be intentional about how you use this time and ensure it aligns with your long-term goals.`,
      author: "ScholarHunt Team",
      authorImage: "/team/default.jpg",
      authorBio:
        "The ScholarHunt team is dedicated to helping students make informed decisions about their education and career paths.",
      category: "Career Advice",
      tags: [
        "career",
        "education",
        "gap year",
        "graduation",
        "personal growth",
      ],
      readTime: 5,
      status: "published",
      published: true,
      featured: false,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: new Date(),
      metaTitle:
        "Why Waiting to Graduate Might Be the Best Decision | ScholarHunt",
      metaDescription:
        "Discover why taking time before graduating can benefit your career, finances, and personal growth. Expert advice on making the most of gap time.",
      focusKeyword: "gap year graduation delay",
    };

    // Add the document with the slug as the document ID
    await setDoc(doc(db, "blog", blogPost.slug), blogPost);
    console.log("✅ Blog post added successfully!");

    // Also add the posts from blog.json
    const blogData = require("./data/blog.json");
    console.log(`\nAdding ${blogData.length} blog posts from blog.json...`);

    for (const post of blogData) {
      const docData = {
        ...post,
        id: post.id.toString(),
        status: "published",
        published: true,
        featured: post.featured || false,
        views: 0,
        createdAt: new Date(post.publishedAt || Date.now()),
        updatedAt: new Date(post.updatedAt || Date.now()),
        publishedAt: new Date(post.publishedAt || Date.now()),
      };

      await setDoc(doc(db, "blog", post.slug), docData);
      console.log(`✅ Added: ${post.title}`);
    }

    console.log("\n🎉 All blog posts added successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding blog post:", error);
    process.exit(1);
  }
}

addBlogPost();
