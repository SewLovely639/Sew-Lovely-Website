import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sew Lovely | Artisanal Indian Ethnic Wear",
  description: "Handcrafted Indian ethnic wear, jewellery and bespoke alterations in Gaborone.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
