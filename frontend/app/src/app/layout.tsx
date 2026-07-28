import AuthProvider from "@/components/AuthProvider";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Servox — AI Server Training",
  description: "AI-powered hospitality training platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <link rel="icon" href="/favicon.ico?v=1" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.ico?v=1" />
      </head>
      <body>
        <AuthProvider session={undefined}>{children}</AuthProvider>
      </body>
    </html>
  );
}
