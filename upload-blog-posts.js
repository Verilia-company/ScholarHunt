const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Initialize Firebase Admin (replace with your service account key path if needed)
// For development, you can use the Firebase CLI login
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    projectId: "verilyblog-d1235",
  });
}

const db = getFirestore();

async function uploadBlogPosts() {
  try {
    // Read blog data
    const blogData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "data/blog.json"), "utf8")
    );

    console.log(`Found ${blogData.length} blog posts to upload`);

    // Upload each blog post
    for (const post of blogData) {
      const docData = {
        ...post,
        id: post.id.toString(), // Ensure ID is string
        status: "published",
        published: true,
        featured: post.featured || false,
        views: 0,
        createdAt: new Date(post.publishedAt || Date.now()),
        updatedAt: new Date(post.updatedAt || Date.now()),
        publishedAt: new Date(post.publishedAt || Date.now()),
      };

      // Use the slug as the document ID for easy querying
      await db.collection("blog").doc(post.slug).set(docData);
      console.log(`✅ Uploaded: ${post.title}`);
    }

    console.log("✅ All blog posts uploaded successfully!");
  } catch (error) {
    console.error("❌ Error uploading blog posts:", error);
  }
}

// Also add a sample blog post with the slug you're testing
async function addSamplePost() {
  const samplePost = {
    id: "sample-why-waiting",
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
    tags: ["career", "education", "gap year", "graduation", "personal growth"],
    readTime: 5,
    status: "published",
    published: true,
    featured: false,
    views: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: new Date(),
    seo: {
      metaTitle:
        "Why Waiting to Graduate Might Be the Best Decision | ScholarHunt",
      metaDescription:
        "Discover why taking time before graduating can benefit your career, finances, and personal growth. Expert advice on making the most of gap time.",
      keywords: [
        "gap year",
        "graduation delay",
        "career advice",
        "education planning",
      ],
    },
  };

  await db.collection("blog").doc(samplePost.slug).set(samplePost);
  console.log("✅ Sample post added:", samplePost.title);
}

// Run the upload
uploadBlogPosts()
  .then(() => addSamplePost())
  .then(() => {
    console.log("🎉 All done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
