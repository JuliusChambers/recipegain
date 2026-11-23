import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { AppStateProvider } from "@/context/AppState";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "RecipeGain — Save on this week’s flyer",
  description:
    "Enter your postal code to turn local grocery flyer deals into personalized meals and a phone-ready shopping list.",
  applicationName: "RecipeGain",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "RecipeGain",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#1f6b4a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <AppStateProvider>
          <SiteHeader />
          <div className="flex-1">{children}</div>
        </AppStateProvider>
      </body>
    </html>
  );
}
