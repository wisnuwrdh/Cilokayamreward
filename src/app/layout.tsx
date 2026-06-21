import type { Metadata, Viewport } from "next";
import { Inter, Calistoga } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import InstallPrompt from "@/components/InstallPrompt";
import SWRegister from "@/components/SWRegister";
import ContextMenuBlocker from "@/components/ContextMenuBlocker";

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
    default: "CilokReward",
    template: "%s | CilokReward",
  },
  description: "Aplikasi loyalitas pelanggan CilokReward",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CilokReward",
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
        <ContextMenuBlocker />
        <div className="max-w-lg mx-auto w-full px-4 safe-area-top">
          <Header />
        </div>
        <main className="flex-1 max-w-lg mx-auto w-full px-4 safe-area-top pt-3">{children}</main>
        <Navbar />
        <InstallPrompt />
        <SWRegister />
      </body>
    </html>
  );
}
