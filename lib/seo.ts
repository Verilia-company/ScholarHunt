import { DefaultSeoProps } from "next-seo";

export const defaultSEO: DefaultSeoProps = {
  titleTemplate: "%s | ScholarHunt Uganda",
  defaultTitle:
    "ScholarHunt Uganda - Find Your Perfect Scholarship Opportunity",
  description:
    "Discover scholarship opportunities for Ugandan students. Get access to international scholarships, study abroad programs, and educational funding opportunities. Apply now and transform your future.",
  canonical: "https://scholarhunt.ug",
  openGraph: {
    type: "website",
    locale: "en_UG",
    url: "https://scholarhunt.ug",
    siteName: "ScholarHunt Uganda",
    title: "ScholarHunt Uganda - Find Your Perfect Scholarship Opportunity",
    description:
      "Discover scholarship opportunities for Ugandan students. Get access to international scholarships, study abroad programs, and educational funding opportunities.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ScholarHunt Uganda - Scholarship Opportunities for Ugandan Students",
      },
    ],
  },
  twitter: {
    handle: "@scholarhunt_ug",
    site: "@scholarhunt_ug",
    cardType: "summary_large_image",
  },
  additionalMetaTags: [
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1",
    },
    {
      name: "keywords",
      content:
        "scholarships Uganda, study abroad, education funding, international scholarships, Ugandan students, university scholarships, graduate scholarships, undergraduate scholarships",
    },
    {
      name: "author",
      content: "ScholarHunt Uganda",
    },
    {
      name: "robots",
      content: "index, follow",
    },
    {
      name: "language",
      content: "en-UG",
    },
  ],
  additionalLinkTags: [
    {
      rel: "icon",
      href: "/favicon.ico",
    },
    {
      rel: "apple-touch-icon",
      href: "/apple-touch-icon.png",
      sizes: "180x180",
    },
    {
      rel: "manifest",
      href: "/site.manifest",
    },
  ],
};

export const jsonLdWebsite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ScholarHunt Uganda",
  url: "https://scholarhunt.ug",
  description: "Find scholarship opportunities for Ugandan students",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://scholarhunt.ug/opportunities?search={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ScholarHunt Uganda",
  url: "https://scholarhunt.ug",
  logo: "https://scholarhunt.ug/logo.png",
  sameAs: [
    "https://www.facebook.com/share/16g4GXRe6r/",
    "https://twitter.com/scholarhunt_ug",
    "https://linkedin.com/company/scholarhunt-uganda",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+256-700-000-000",
    contactType: "Customer Service",
    availableLanguage: ["English"],
  },
};
