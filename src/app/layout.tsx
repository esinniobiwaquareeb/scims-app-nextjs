import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";

import { Toaster } from 'sonner';
import { Providers } from '@/components/Providers';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { ThemeToggle } from '@/components/ThemeToggle';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SCIMS - Complete Business Management System | POS, Inventory & FREE Website",
    template: "%s | SCIMS"
  },
  description: "Transform your business with SCIMS - complete POS, inventory management, business analytics, and a FREE professional website (worth ₦500,000). Support for retail, restaurant, pharmacy, and service businesses. 14-day free trial!",
  keywords: ["POS system", "inventory management", "business management software", "retail management", "restaurant POS", "pharmacy management", "service business software", "free business website"],
  manifest: "/manifest.json",
  themeColor: "#3B82F6",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SCIMS",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/icons/icon-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-384x384.png", sizes: "384x384", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: [
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "SCIMS",
    "msapplication-TileColor": "#3B82F6",
    "msapplication-config": "/browserconfig.xml",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180x180.png" />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SCIMS" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
        {/* OpenGraph meta tags for WhatsApp and social media */}
        <meta property="og:title" content="SCIMS - Complete Business Management System | POS, Inventory & FREE Website" />
        <meta property="og:description" content="Transform your business with SCIMS - complete POS, inventory management, business analytics, and a FREE professional website (worth ₦500,000). Support for retail, restaurant, pharmacy, and service businesses. 14-day free trial!" />
        <meta property="og:image" content="https://scims.app/og-home.png" />
        <meta property="og:image:url" content="https://scims.app/og-home.png" />
        <meta property="og:image:secure_url" content="https://scims.app/og-home.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="SCIMS - Complete Business Management Solution with FREE Website" />
        <meta property="og:url" content="https://scims.app" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="SCIMS - Stock Control & Inventory Management System" />
        <meta property="og:locale" content="en_US" />
        {/* Twitter Card meta tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SCIMS - Complete Business Management System | POS, Inventory & FREE Website" />
        <meta name="twitter:description" content="Transform your business with SCIMS - complete POS, inventory management, business analytics, and a FREE professional website (worth ₦500,000). 14-day free trial!" />
        <meta name="twitter:image" content="https://scims.app/og-home.png" />
        {/* Optional: Add your Twitter handle if you have one */}
        {/* <meta name="twitter:site" content="@yourhandle" /> */}
        {/* <meta name="twitter:creator" content="@yourhandle" /> */}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <Providers>
          {children}
          <PWAInstallPrompt />
          <ThemeToggle />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
