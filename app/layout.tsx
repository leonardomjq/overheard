import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScoutAgent — Venture Intelligence",
  description:
    "Transform raw X/Twitter discourse into structured market opportunities. Identify technical shifts and dev-friction points before they reach the mainstream.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-bg text-text font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
