import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import 'katex/dist/katex.min.css';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Exam Prep | Master JEE, NEET, UPSC, SSC, GATE",
  description: "AI-powered competitive exam preparation with timed mock tests, step-by-step solutions, and personalized revision schedules.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
