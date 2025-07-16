import type { Metadata } from "next";
import "./globals.css";
import Layout from "../components/Layout";
import { AuthProvider } from "../contexts/AuthContext";
import { jsonLdWebsite, jsonLdOrganization } from "../lib/seo";

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
        {/* Google AdSense */}
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID &&
          process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID !==
            "ca-pub-XXXXXXXXXXXXXXXXX_PLACEHOLDER" && (
            <script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
              crossOrigin="anonymous"
            />
          )}
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID &&
          process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID !==
            "GA_MEASUREMENT_ID_PLACEHOLDER" && (
            <>
              <script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
              />
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}');
                `,
                }}
              />
            </>
          )}
        {/* Google Identity Services for One Tap Sign-in */}
        <script src="https://accounts.google.com/gsi/client" async defer />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <Layout>{children}</Layout>
        </AuthProvider>
      </body>
    </html>
  );
}
