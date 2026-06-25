import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Servox — AI Server Training",
  description: "AI-powered hospitality training platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
