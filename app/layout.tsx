import type { Metadata, Viewport } from "next";
import "./globals.css";
import Layout from "../components/Layout";
import { AuthProvider } from "../contexts/AuthContext";
import { jsonLdWebsite, jsonLdOrganization } from "../lib/seo";
import DynamicScripts from "../components/DynamicScripts";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

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
  icons: {
    icon: [
      { url: "/scholarHuntLogo.jpg", sizes: "32x32", type: "image/jpeg" },
      { url: "/scholarHuntLogo.jpg", sizes: "16x16", type: "image/jpeg" },
    ],
    shortcut: "/scholarHuntLogo.jpg",
    apple: "/scholarHuntLogo.jpg",
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/scholarHuntLogo.jpg",
      },
    ],
  },
  manifest: "/site.webmanifest",
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
    <html lang="en" style={{ colorScheme: "light" }}>
      <head>
        <meta name="color-scheme" content="light" />

        {/* ScholarHunt Favicon and Icons */}
        <link rel="icon" href="/scholarHuntLogo.jpg" type="image/jpeg" />
        <link
          rel="shortcut icon"
          href="/scholarHuntLogo.jpg"
          type="image/jpeg"
        />
        <link rel="apple-touch-icon" href="/scholarHuntLogo.jpg" />
        <link rel="apple-touch-icon-precomposed" href="/scholarHuntLogo.jpg" />
        <meta name="msapplication-TileImage" content="/scholarHuntLogo.jpg" />
        <meta name="msapplication-TileColor" content="#4F94FE" />

        <style
          dangerouslySetInnerHTML={{
            __html: `
            html { color-scheme: light !important; }
            * { color-scheme: light !important; }
          `,
          }}
        />
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
        {/* Hydration error warning for users with browser extensions */}
        <noscript>
          <div style={{ color: "red", textAlign: "center", padding: "1em" }}>
            If you see hydration errors, try disabling browser extensions or use
            incognito mode.
          </div>
        </noscript>
        <AuthProvider>
          <Layout>{children}</Layout>
        </AuthProvider>
      </body>
    </html>
  );
}
