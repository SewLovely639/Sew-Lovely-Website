import type { Metadata } from "next";
import { ClientErrorMonitor } from "./components/client-error-monitor";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sew Lovely | Artisanal Indian Ethnic Wear",
  description: "Handcrafted Indian ethnic wear, jewellery and bespoke alterations in Gaborone.",
  icons: { icon: "/sewlovelylogo.png" },
  openGraph: { title: "Sew Lovely", description: "Artisanal Indian ethnic wear, jewellery and bespoke alterations." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><ClientErrorMonitor />{children}</body></html>;
}
