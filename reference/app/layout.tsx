import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Inter } from "next/font/google";
import { Playfair_Display } from "next/font/google";
import { NotificationProvider } from "@/context/NotificationContext";
import NavBar from "@/components/ui/navbar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
  title: "ZeedChain - Startup Equity NFT Platform",
  description: "Decentralized platform for startup equity NFTs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>ZeedChain - Startup Equity NFT Platform</title>
        <meta
          name="description"
          content="Decentralized platform for startup equity NFTs"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`${inter.className} dark`}>
        <div className="relative flex min-h-svh flex-col bg-background">
          <div data-wrapper="" className="border-grid flex flex-1 flex-col">
            <NavBar />
            <main className="flex flex-1 flex-col">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
