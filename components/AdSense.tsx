import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdSenseProps {
  adSlot: string;
  adFormat?: string;
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
}

export default function AdSense({
  adSlot,
  adFormat = "auto",
  fullWidthResponsive = true,
  style = { display: "block" },
}: AdSenseProps) {
  const pathname = usePathname();

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, [pathname]);

  return (
    <div className="text-center my-8">
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-5910844063168818" // AdSense publisher ID
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  );
}

// Pre-configured ad units for different positions
export const AdUnits = {
  // Banner ad for header/top of pages
  HEADER_BANNER: "XXXXXXXXXX",

  // In-content ads for blog posts and articles
  IN_CONTENT: "XXXXXXXXXX",

  // Sidebar ads
  SIDEBAR: "XXXXXXXXXX",

  // Footer banner
  FOOTER_BANNER: "XXXXXXXXXX",

  // Mobile banner
  MOBILE_BANNER: "XXXXXXXXXX",
};

// Common ad configurations
export const AdConfigs = {
  ResponsiveBanner: {
    style: { display: "block" },
    adFormat: "auto",
    fullWidthResponsive: true,
  },

  Rectangle: {
    style: { display: "block", width: "300px", height: "250px" },
    adFormat: "rectangle",
    fullWidthResponsive: false,
  },

  Leaderboard: {
    style: { display: "block", width: "728px", height: "90px" },
    adFormat: "leaderboard",
    fullWidthResponsive: false,
  },
};
