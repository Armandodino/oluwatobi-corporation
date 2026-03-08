import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OLUWATOBI CORPORATION - Votre quincaillerie en ligne",
  description: "Découvrez notre large sélection d'outils, matériaux et accessoires pour tous vos projets de bricolage. Livraison en Côte d'Ivoire.",
  keywords: ["quincaillerie", "outillage", "bricolage", "outils", "matériaux", "BTP", "construction", "Côte d'Ivoire"],
  authors: [{ name: "OLUWATOBI CORPORATION" }],
  icons: {
    icon: "/logo.jpeg",
  },
  openGraph: {
    title: "OLUWATOBI CORPORATION - Votre quincaillerie en ligne",
    description: "Outils, matériaux et accessoires pour tous vos projets de bricolage en Côte d'Ivoire",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
