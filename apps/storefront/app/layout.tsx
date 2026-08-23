import type { Metadata, Viewport } from "next";
import { readContent } from "@sew-lovely/cms";
import { ClientErrorMonitor } from "./components/client-error-monitor";
import { StorefrontMarketingTools } from "./components/storefront-marketing-tools";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sew Lovely — Modern Heirlooms",
  description: "Sew Lovely — modern heirlooms for every celebration.",
  icons: { icon: "/sewlovelylogo.png" },
  openGraph: { title: "Sew Lovely", description: "Artisanal Indian ethnic wear, jewellery and bespoke alterations." },
};

export const dynamic = "force-dynamic";
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	const { site } = await readContent();
	return <html lang="en"><head><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" /><link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600&display=swap" rel="stylesheet" /></head><body><ClientErrorMonitor />{children}<StorefrontMarketingTools newsletterTitle={site.newsletterTitle} newsletterDescription={site.newsletterDescription} whatsappUrl={site.connect.whatsappUrl} heroTiles={site.homeCategories} /></body></html>;
}
