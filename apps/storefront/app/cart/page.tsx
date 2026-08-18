import Link from "next/link";
import { readContent } from "@sew-lovely/cms";
import { BackArrow } from "../components/back-arrow";
import { CartClient } from "../components/cart-client";
import { FloatingWhatsApp, StoreActions } from "../components/store-actions";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const { site } = await readContent();

  return (
    <>
      <header className="navbar wrap" id="top">
        <Link className="logo-box" href="/">
          <span className="icon">SL</span>
          <span className="name">Sew Lovely</span>
        </Link>
        <nav className="nav-links">
          {site.navigation.map((item) => (
            <Link key={item.label} href={item.type === "anchor" ? `/#${item.value}` : `/shop?${item.type}=${encodeURIComponent(item.value)}`}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="nav-icons"><StoreActions /></div>
      </header>
      <BackArrow />
      <main className="wrap">
        <CartClient />
      </main>
      <FloatingWhatsApp />
    </>
  );
}
