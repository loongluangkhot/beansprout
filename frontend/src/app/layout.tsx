/**
 * Application Layout
 * Root layout component for the beansprout application
 */

import type { Metadata } from "next";
import { Manrope, Newsreader } from "next/font/google";
import { SessionValidator } from "@/components/providers/session-validator";
import { Header } from "@/components/features/header";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
});

export const metadata: Metadata = {
  title: "beansprout - Book Club Facilitation",
  description: "A warm, inviting platform for book club facilitation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${newsreader.variable} font-manrope antialiased bg-surface text-foreground`}>
        <SessionValidator>
          <Header />
          {children}
        </SessionValidator>
      </body>
    </html>
  );
}
