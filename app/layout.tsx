
import type { Metadata } from "next";

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
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Arial, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
