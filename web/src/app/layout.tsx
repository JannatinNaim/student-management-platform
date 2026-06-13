import type { Metadata } from "next";
import { Inter, Noto_Sans_Bengali } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ToastViewport } from "@/components/ui/Toast";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

// Bangla glyphs aren't covered by Inter; this variable font backs the `bn` locale.
const notoBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-bengali",
});

// metadataBase only resolves relative OG/canonical URLs, so a sane default is
// fine when NEXT_PUBLIC_SITE_URL is unset or blank (dev). Set it in production.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Smart Notes — Share & Discover Study Notes",
    template: "%s | Smart Notes",
  },
  description:
    "Upload, discover, rate and discuss high-quality study notes. Built by students, for students.",
  keywords: ["study notes", "notes sharing", "education", "students", "exam prep"],
  openGraph: {
    type: "website",
    siteName: "Smart Notes",
    title: "Smart Notes — Share & Discover Study Notes",
    description:
      "Upload, discover, rate and discuss high-quality study notes. Built by students, for students.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${notoBengali.variable} font-sans`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <ToastViewport />
        </Providers>
      </body>
    </html>
  );
}
