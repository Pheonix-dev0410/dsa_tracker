import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DSA Tracker",
  description: "Track your DSA progress across multiple platforms",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="animated-background" />
        <div className="floating-shapes" />
        <div className="animated-circles">
          <div className="circle" />
          <div className="circle" />
          <div className="circle" />
        </div>
        <div className="gradient-lines">
          <div className="line" />
          <div className="line" />
          <div className="line" />
          <div className="line" />
        </div>
        <div className="background-pattern" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
} 