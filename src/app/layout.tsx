import type { Metadata } from "next";
import { Prompt, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jules Orchestrator",
  description: "Manage your GitHub issues with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${prompt.variable} ${geistMono.variable}`}>
      <body className="antialiased selection:bg-primary/30 min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
