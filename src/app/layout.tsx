import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/header/Header";
import ClientProviders from "./client-providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://flow-scope-js.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: "FlowScope JS",
  description: "Inspect backend flows and traces",

  alternates: {
    canonical: "/",
  },

  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
    ],
  },

  openGraph: {
    title: "FlowScope JS",
    description: "Inspect backend flows and traces",
    url: siteUrl,
    siteName: "FlowScope JS",
    images: [
      {
        url: "/og-image-1200x630.png",
        width: 1200,
        height: 630,
        alt: "FlowScope JS — inspect backend flows",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "FlowScope JS",
    description: "Inspect backend flows and traces",
    images: ["/og-image-1200x630.png"],
  },

  viewport: {
    width: "device-width",
    initialScale: 1,
    minimumScale: 0.5,
    maximumScale: 3,
    userScalable: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`
        ${geistSans.variable}
        ${geistMono.variable}
        antialiased
        h-full
        bg-zinc-950
        text-zinc-100
      `}
      >
        <ClientProviders>
          <div
            className="flex flex-col overflow-hidden"
            style={{ height: "100dvh" }}
          >
            <Header />
            <main className="flex-1 w-full overflow-hidden">{children}</main>
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
