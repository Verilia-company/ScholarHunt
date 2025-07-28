import type { Metadata } from "next";
import "./globals.css";
import Layout from "../components/Layout";
import { AuthProvider } from "../contexts/AuthContext";
import { jsonLdWebsite, jsonLdOrganization } from "../lib/seo";
import DynamicScripts from "../components/DynamicScripts";

export const metadata: Metadata = {
  title: "ScholarHunt Uganda - Find Your Perfect Scholarship Opportunity",
  description:
    "Discover scholarship opportunities for Ugandan students. Get access to international scholarships, study abroad programs, and educational funding opportunities. Apply now and transform your future.",
  keywords: [
    "scholarships Uganda",
    "study abroad",
    "education funding",
    "international scholarships",
    "Ugandan students",
    "university scholarships",
    "graduate scholarships",
    "undergraduate scholarships",
  ],
  authors: [{ name: "ScholarHunt Uganda" }],
  creator: "ScholarHunt Uganda",
  publisher: "ScholarHunt Uganda",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdOrganization),
          }}
        />
      </head>
      <body className="antialiased">
        <DynamicScripts />
        <AuthProvider>
          <Layout>{children}</Layout>
        </AuthProvider>
      </body>
    </html>
  );
}
