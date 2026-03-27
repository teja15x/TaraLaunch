import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Manrope, Space_Grotesk } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#091b2b",
};

export const metadata: Metadata = {
  title: {
    default: "Career Agent - AI-Powered Career Discovery for Students",
    template: "%s | Career Agent",
  },
  description:
    "Discover your ideal career through fun assessment games powered by AI. Based on RIASEC, Gardner's Multiple Intelligences, and personality analysis. Built for Indian students ages 13-21.",
  keywords: [
    "career guidance",
    "career assessment",
    "AI career counseling",
    "RIASEC test",
    "Gardner multiple intelligences",
    "career aptitude test",
    "student career planning",
    "Indian careers",
    "career discovery",
    "personality assessment",
    "career games",
    "career buddy",
  ],
  authors: [{ name: "Career Agent" }],
  creator: "Career Agent",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Career Agent",
    title: "Career Agent - AI-Powered Career Discovery",
    description:
      "Play fun assessment games, chat with an AI Career Buddy, and discover careers that truly match who you are.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Career Agent - AI-Powered Career Discovery",
    description:
      "Play fun assessment games, chat with an AI Career Buddy, and discover careers that truly match who you are.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json?v=20260312v2" />
        <meta name="application-name" content="Career Agent" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Career Agent" />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body className={`${manrope.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable} font-sans antialiased`}>
        {children}
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </body>
    </html>
  );
}
