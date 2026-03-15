import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Story2Live – Turn Your Life Story into a Masterpiece",
  description:
    "Story2Live is an AI-powered platform that transforms your personal life stories into books, movies, or documentaries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-950 text-white font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
