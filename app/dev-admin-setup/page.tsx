"use client";

import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { promoteUserToAdmin } from "../../utils/adminUtils";
import { Shield, User, AlertCircle, CheckCircle } from "lucide-react";

export default function DevAdminSetup() {
  const { user, userProfile, loading, signInWithGoogle, initializeOneTap } =
    useAuth();
  const [isPromoting, setIsPromoting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Not Available
          </h1>
          <p className="text-gray-600">
            This page is only available in development mode.
          </p>
        </div>
      </div>
    );
  }

  const handlePromoteToAdmin = async () => {
    if (!user) return;

    setIsPromoting(true);
    setMessage(null);

    try {
      const success = await promoteUserToAdmin(user.uid);
      if (success) {
        setMessage({
          type: "success",
          text: "Successfully promoted to admin! Please refresh the page.",
        });
      } else {
        setMessage({
          type: "error",
          text: "Failed to promote to admin. Check console for details.",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "An error occurred while promoting to admin.",
      });
    } finally {
      setIsPromoting(false);
    }
  };

  const checkGoogleServices = () => {
    console.log("=== Google Services Debug ===");
    console.log("Google Script Loaded:", !!window.google);
    console.log("Google Accounts ID:", !!window.google?.accounts?.id);
    console.log("Client ID:", process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
    console.log("Current User:", user?.email);
    console.log("User Profile:", userProfile);
    console.log("Loading:", loading);
  };

  const testOneTap = () => {
    console.log("Testing One Tap...");
    try {
      initializeOneTap();
    } catch (error) {
      console.error("One Tap test failed:", error);
    }
  };

  const testPopupSignIn = async () => {
    console.log("Testing Popup Sign In...");
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Popup sign in failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Admin Setup Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Development Admin Setup & Auth Debug
            </h1>
            <p className="text-gray-600">
              Use this page to set up admin access and debug authentication
              issues
            </p>
          </div>

          {!user ? (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-4">
                Please sign in first to set up admin access
              </p>
              <div className="space-y-4">
                <button
                  onClick={testOneTap}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mr-4"
                >
                  Test One Tap Sign-In
                </button>
                <button
                  onClick={testPopupSignIn}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  Test Popup Sign-In
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">
                  Current User Info:
                </h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Name:</strong> {user.displayName}
                  </p>
                  <p>
                    <strong>UID:</strong> {user.uid}
                  </p>
                  <p>
                    <strong>Current Role:</strong>{" "}
                    {userProfile?.role || "Loading..."}
                  </p>
                </div>
              </div>

              {message && (
                <div
                  className={`p-4 rounded-lg flex items-center ${
                    message.type === "success"
                      ? "bg-green-50 text-green-800"
                      : "bg-red-50 text-red-800"
                  }`}
                >
                  {message.type === "success" ? (
                    <CheckCircle className="h-5 w-5 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 mr-2" />
                  )}
                  {message.text}
                </div>
              )}

              {userProfile?.role === "admin" ? (
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-green-800 font-medium">
                    You already have admin access!
                  </p>
                  <p className="text-green-700 text-sm mt-1">
                    You can now access the admin dashboard at /admin
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <button
                    onClick={handlePromoteToAdmin}
                    disabled={isPromoting}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPromoting
                      ? "Promoting..."
                      : "Promote Current User to Admin"}
                  </button>
                  <p className="text-sm text-gray-600 mt-2">
                    This will give your current account admin privileges
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Environment Check */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="font-medium w-40">Google Client ID:</span>
              <span
                className={`px-2 py-1 rounded text-sm ${
                  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
                  ? "Configured"
                  : "Missing"}
              </span>
            </div>
            <div className="flex items-center">
              <span className="font-medium w-40">Firebase Project:</span>
              <span
                className={`px-2 py-1 rounded text-sm ${
                  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "Missing"}
              </span>
            </div>
          </div>
        </div>

        {/* Google Services Check */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Google Services Status</h2>
          <div className="space-y-4">
            <button
              onClick={checkGoogleServices}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Check Google Services
            </button>
            <div className="text-sm text-gray-600">
              Check the browser console for detailed Google services
              information.
            </div>
          </div>
        </div>

        {/* Troubleshooting Guide */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting Guide</h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium">If One Tap doesn&apos;t appear:</h3>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>
                  Check that NEXT_PUBLIC_GOOGLE_CLIENT_ID is set correctly
                </li>
                <li>
                  Ensure your domain is added to Google OAuth authorized origins
                </li>
                <li>
                  Try in an incognito window (browser may have blocked One Tap)
                </li>
                <li>Check the console for specific error messages</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium">Common Console Errors:</h3>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>
                  <code>unregistered_origin</code> - Add your domain to Google
                  Console
                </li>
                <li>
                  <code>missing_client_id</code> - Google Client ID not
                  configured
                </li>
                <li>
                  <code>suppressed_by_user</code> - User previously dismissed
                  One Tap
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Development Only</p>
              <p>
                This page is only available in development mode. In production,
                admin roles should be assigned through secure backend processes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
