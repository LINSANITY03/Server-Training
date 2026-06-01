import type { Metadata } from "next";
import { DM_Sans, Playfair_Display, } from "next/font/google";
import "./globals.css";

// Load fonts optimally
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Server Training",
  description: "Interactive UI/UX for dishoom server training.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable}`}>
      <head>
        {/* Tabler Icons for consistent, clean UI icons */}
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.44.0/tabler-icons.min.css" />
      </head>
      <body className="bg-(--bg) text-(--text) font-sans antialiased overflow-hidden">
        {children}
      </body>
    </html>
  );
}