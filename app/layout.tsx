
import "./globals.css";
import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "AS U GO | Travel Service",
  description:
    "AS U GO Travel Service Company, Kalihati, Tangail, Bangladesh.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <body style={{ margin: 0, fontFamily: "Arial, sans-serif" }}>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
