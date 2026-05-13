import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aurelio Portfolio",
  description: "Interactive portfolio showcasing my projects and skills",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="relative min-h-screen overflow-x-hidden bg-black text-white">
        <iframe
          src="/fluid/index.html"
          className="fixed inset-0 z-0 h-screen w-screen border-none"
        />

        <div className="pointer-events-none fixed inset-0 z-10" />

        <div className="pointer-events-auto relative z-20 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}