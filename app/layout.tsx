import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meritrix",
  description: "Premium learning platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="teal" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
