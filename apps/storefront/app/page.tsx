import type { Metadata } from "next";
import { readContent } from "@sew-lovely/cms";
import { SaanjhHome, SaanjhShell } from "./components/saanjh-storefront";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Buy Lehenga & Abayas Online | Indian Dress Shop",
  description: "Shop elegant lehengas, abayas, and Indian dresses online. Browse occasion wear, thoughtful styling, and sizes for every celebration at Sew Lovely.",
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    title: "Buy Lehenga & Abayas Online | Indian Dress Shop | Sew Lovely",
    description: "Shop elegant lehengas, abayas, and Indian dresses online at Sew Lovely.",
  },
};

export default async function HomePage() {
  const { site, products } = await readContent();
  return <SaanjhShell site={site} products={products}><SaanjhHome site={site} products={products} /></SaanjhShell>;
}
