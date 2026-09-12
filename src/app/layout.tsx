import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Lora } from "next/font/google";
import AuthSessionProvider from "@/components/session-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import NavBar from "../components/NavBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Editorial serif for headings — gives the authoritative news feel
const playfairDisplay = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700", "800"],
});

// Optimized for long-form body text readability
const lora = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "OpenNews",
    template: "%s — OpenNews",
  },
  description: "Curated world news with AI-powered summaries and sentiment analysis.",
  metadataBase: new URL("https://opennews.app"),
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} ${lora.variable} antialiased`}
      >
        <AuthSessionProvider>
          <NavBar />
          {children}
          <Toaster position="top-right" richColors closeButton />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
