import type { Metadata, Viewport } from "next";
import { Inter, Calistoga } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import InstallPrompt from "@/components/InstallPrompt";
import SWRegister from "@/components/SWRegister";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

const calistoga = Calistoga({
  variable: "--font-calistoga",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "Sang Penguasa Rasa",
    template: "%s | Sang Penguasa Rasa",
  },
  description: "Aplikasi loyalitas pelanggan Sang Penguasa Rasa",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sang Penguasa Rasa",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#DC2626",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${calistoga.variable} h-full`}
    >
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full flex flex-col pb-16 safe-area-bottom">
        <main className="flex-1 max-w-lg mx-auto w-full px-4 pt-4 safe-area-top">
          {children}
        </main>
        <Navbar />
        <InstallPrompt />
        <SWRegister />
      </body>
    </html>
  );
}
