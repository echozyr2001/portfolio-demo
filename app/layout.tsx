import type { Metadata } from "next";
import { Calistoga, Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const calistoga = Calistoga({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Bibibai | Full Stack Developer",
  description:
    "Professional portfolio showcasing full stack development projects with expertise in modern web technologies and performance optimization",
  keywords: [
    "full stack developer",
    "web development",
    "React",
    "Next.js",
    "Node.js",
    "TypeScript",
    "portfolio",
    "Bibibai",
  ],
  authors: [{ name: "Bibibai" }],
  openGraph: {
    title: "Bibibai | Full Stack Developer",
    description:
      "Professional portfolio showcasing full stack development projects with expertise in modern web technologies",
    url: "https://your-actual-domain.com", // Update with your actual domain
    siteName: "Bibibai Portfolio",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Bibibai - Full Stack Developer Portfolio",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bibibai | Full Stack Developer",
    description:
      "Professional portfolio showcasing full stack development projects",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icon.png", type: "image/png" }],
    apple: { url: "/apple-icon.png", type: "image/png" },
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${calistoga.variable} antialiased font-sans bg-gray-900 text-white`}
      >
        {children}
      </body>
    </html>
  );
}
