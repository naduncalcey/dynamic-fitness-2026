import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Playfair_Display } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieConsent } from "@/components/common/CookieConsent";
import { BackgroundMusic } from "@/components/common/BackgroundMusic";
import { JsonLd } from "@/components/common/JsonLd";
import { organizationJsonLd, webSiteJsonLd, SITE_NAME, SITE_URL } from "@/lib/seo";
import { LabelsProvider } from "@/lib/i18n/LabelsProvider";
import { DEFAULT_LOCALE } from "@/lib/i18n/locale";
import { HtmlLangSync } from "@/components/common/HtmlLangSync";
import { getAllUiLabels } from "@/lib/contentful/uiLabels";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Used for the italic serif highlight in the hero (matches the live site).
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["italic", "normal"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Premier Gym in Nawinna, Maharagama`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Nawinna's premier fitness destination. State-of-the-art equipment and expert trainers for your transformation.",
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_LK",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  // Fetch every locale's UI labels once; the provider picks the active locale
  // per-request from the URL (client-side), so chrome follows the language switch.
  const labels = await getAllUiLabels();

  return (
    <html
      lang={DEFAULT_LOCALE.htmlLang}
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {/* Sync <html lang> to the URL locale on the client (keeps ISR static). */}
        <HtmlLangSync />
        {/* Sitewide structured data: brand entity + search endpoint. */}
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={webSiteJsonLd()} />
        <LabelsProvider labels={labels}>
          <Header />
          {children}
          <Footer />
          <CookieConsent />
          <BackgroundMusic />
        </LabelsProvider>
      </body>
    </html>
  );
}
