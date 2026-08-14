import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// `opsz` is Inter v4's optical-size axis: 14 ≈ Inter Text, 32 ≈ Inter Display.
// The hero pins it to 32 to match the source's Display metrics.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  axes: ["opsz"],
});

// Display face used for the wordmark and the hero tagline.
const clashGrotesk = localFont({
  variable: "--font-clash",
  display: "swap",
  src: [
    {
      path: "./fonts/ClashGrotesk-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/ClashGrotesk-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: "Dynamic Fitness",
  description: "Expert coaching and a plan that works.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${clashGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
