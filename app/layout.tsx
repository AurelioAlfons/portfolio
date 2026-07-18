// root layout => puts the fluid background behind everything and the site on top
import type { Metadata } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

// display face => headers/hero, has the mecha/robot technical edge
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

// body face => paragraphs/UI copy, stays legible for recruiters skimming
const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

// utility face => tech chips, timestamps, kicker labels: data-like content
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
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${plusJakarta.variable} ${geistMono.variable}`}
    >
      <body className="relative min-h-screen overflow-x-hidden bg-black text-plate">

        {/* BACKGROUND => the fluid sim lives in its own iframe, pinned behind everything */}
        <iframe
          src="/fluid/index.html"
          className="fixed inset-0 z-0 h-screen w-screen border-none"
        />

        {/* OPTIONAL OVERLAY */}
        <div className="pointer-events-none fixed inset-0 z-10" />

        {/* CONTENT => the trick: this layer ignores clicks so the mouse reaches the fluid,
            and anything clickable turns itself back on with pointer-events-auto */}
        <div className="pointer-events-none relative z-20 min-h-screen">
          {children}
        </div>

      </body>
    </html>
  );
}