"use client";

import { useEffect } from 'react';

export default function DynamicScripts() {
  useEffect(() => {
    // Google AdSense
    if (process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && 
        process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID !== 'ca-pub-0000000000000000') {
      const adsenseScript = document.createElement('script');
      adsenseScript.async = true;
      adsenseScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`;
      adsenseScript.crossOrigin = 'anonymous';
      document.head.appendChild(adsenseScript);
    }

    // Google Analytics
    if (process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && 
        process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID !== 'G-XXXXXXXXXXXX') {
      
      // Load Google Analytics script
      const gtmScript = document.createElement('script');
      gtmScript.async = true;
      gtmScript.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`;
      document.head.appendChild(gtmScript);

      // Configure Google Analytics
      const gtagScript = document.createElement('script');
      gtagScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}');
      `;
      document.head.appendChild(gtagScript);
    }

    // Google Identity Services
    if (!document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
      const gsiScript = document.createElement('script');
      gsiScript.src = 'https://accounts.google.com/gsi/client';
      gsiScript.async = true;
      gsiScript.defer = true;
      document.head.appendChild(gsiScript);
    }
  }, []);

  return null;
}
