import type { Metadata, Viewport } from "next";
import { Inter, Montserrat } from "next/font/google";
import type { ReactNode } from "react";
import "@/styles/globals.css";
import { Providers } from "@/components/Providers";
import { CustomCursor } from "@/components/CustomCursor";
import { FloatingDock } from "@/components/FloatingDock";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "UMarket — campus circular market", template: "%s · UMarket" },
  description:
    "Buy and sell preloved goods, food pre-orders, tickets and services around Universiti Teknologi PETRONAS and Seri Iskandar, with live availability and AI-assisted listings.",
  applicationName: "UMarket",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
    { media: "(prefers-color-scheme: light)", color: "#f5f7fb" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`dark ${montserrat.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh font-sans antialiased">
        <Providers>
          <div className="mesh-bg fixed inset-0 -z-10" aria-hidden />
          <CustomCursor />
          <div className="relative z-10 min-h-dvh pb-36">{children}</div>
          <FloatingDock />
        </Providers>
      </body>
    </html>
  );
}
