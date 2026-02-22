import type { Metadata } from "next";
import Script from "next/script";
import { Inter, JetBrains_Mono, Space_Grotesk, IBM_Plex_Serif } from "next/font/google";
import { ToastProvider } from "@/components/toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-serif",
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://scout-daily.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Scout Daily — Free Opportunity Briefs for Builders",
    template: "%s | Scout Daily",
  },
  description:
    "Daily AI-generated opportunity briefs from HN, Reddit, GitHub, and Product Hunt. Free, open-source market signals for founders and builders.",
  openGraph: {
    title: "Scout Daily — Free Opportunity Briefs for Builders",
    description:
      "Daily AI-generated opportunity briefs synthesized from thousands of conversations across HN, Reddit, GitHub, and Product Hunt.",
    url: BASE_URL,
    siteName: "Scout Daily",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Scout Daily — Free Opportunity Briefs for Builders",
    description:
      "Daily AI-generated opportunity briefs synthesized from thousands of conversations across HN, Reddit, GitHub, and Product Hunt.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} ${ibmPlexSerif.variable}`}
    >
      <head>
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <Script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className="min-h-screen bg-bg text-text font-sans antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
