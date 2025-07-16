// Debug script to check and fix admin permissions
// Run this in your browser console when signed in

async function debugAdminPermissions() {
  // Check current auth state
  const user = firebase.auth().currentUser;
  if (!user) {
    console.log("❌ No user signed in");
    return;
  }

  console.log("✅ Current user:", user.email, user.uid);

  // Check user document in Firestore
  try {
    const userDoc = await firebase
      .firestore()
      .collection("users")
      .doc(user.uid)
      .get();

    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log("📄 User document:", userData);

      if (userData.role === "admin") {
        console.log("✅ User is already admin");
      } else {
        console.log("❌ User is not admin, current role:", userData.role);

        // Try to promote to admin
        console.log("🔄 Attempting to promote to admin...");
        await firebase.firestore().collection("users").doc(user.uid).update({
          role: "admin",
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        console.log("✅ Successfully promoted to admin!");
      }
    } else {
      console.log("❌ User document does not exist");

      // Create admin user document
      console.log("🔄 Creating admin user document...");
      await firebase.firestore().collection("users").doc(user.uid).set({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: "admin",
        isActive: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      console.log("✅ Created admin user document!");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run the debug function
debugAdminPermissions();
