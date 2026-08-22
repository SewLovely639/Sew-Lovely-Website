import Image from "next/image";
import Link from "next/link";
import { NewsletterForm } from "./newsletter-form";
import { QuickAdd } from "./store-actions";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  images: string[];
};

type NavigationItem = { label: string; type: "category" | "brand" | "anchor"; value: string };

type Site = {
  navigation: NavigationItem[];
  footerDescription: string;
  storeAddress: string;
  phone: string;
  email: string;
  connect: { instagramUrl: string; instagramLabel: string };
  newsletterTitle: string;
  newsletterDescription: string;
};

export function AtelierProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const primary = product.images[0] ?? "";
  const alternate = product.images[1] ?? primary;

  return (
    <article className="atelier-product-card">
      <div className="atelier-product-image">
        <Link href={`/shop/${encodeURIComponent(product.id)}`} className="atelier-product-image-link" aria-label={`View ${product.name}`}>
          <Image src={primary} alt={product.name} fill unoptimized priority={priority} sizes="(max-width: 700px) 72vw, (max-width: 1100px) 42vw, 25vw" />
          {alternate !== primary && <Image className="atelier-product-hover" src={alternate} alt="" aria-hidden fill unoptimized sizes="(max-width: 700px) 72vw, (max-width: 1100px) 42vw, 25vw" />}
        </Link>
        <span className="atelier-product-tag">{product.category}</span>
        <div className="atelier-quick-add"><QuickAdd product={product} /></div>
      </div>
      <div className="atelier-product-copy">
        <div>
          <p className="atelier-product-brand">{product.brand}</p>
          <h3><Link href={`/shop/${encodeURIComponent(product.id)}`}>{product.name}</Link></h3>
          <p>{product.description}</p>
        </div>
        <strong>P{product.price.toFixed(2)}</strong>
      </div>
    </article>
  );
}

export function AtelierFooter({ site }: { site: Site }) {
  const navHref = (item: NavigationItem) => item.type === "anchor" ? `/#${item.value}` : `/shop?${item.type}=${encodeURIComponent(item.value)}`;
  return (
    <footer className="atelier-footer">
      <div className="atelier-footer-inner wrap">
        <section className="atelier-footer-brand">
          <img src="/sewlovelylogo.png" alt="Sew Lovely" />
          <p>{site.footerDescription}</p>
          <a className="atelier-social" href={site.connect.instagramUrl} target="_blank" rel="noreferrer">{site.connect.instagramLabel}</a>
        </section>
        <section className="atelier-footer-links">
          <div>
            <p className="atelier-footer-heading">Explore</p>
            {site.navigation.slice(0, 5).map((item) => <Link key={item.label} href={navHref(item)}>{item.label}</Link>)}
            <Link href="/shop">All pieces</Link>
          </div>
          <div>
            <p className="atelier-footer-heading">Visit</p>
            {site.storeAddress.split("\n").map((line) => <span key={line}>{line}</span>)}
            <a href={`tel:${site.phone.replaceAll(" ", "")}`}>{site.phone}</a>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </div>
        </section>
        <section className="atelier-footer-newsletter">
          <p className="atelier-footer-heading">Private notes</p>
          <h2>{site.newsletterTitle}</h2>
          <p>{site.newsletterDescription}</p>
          <NewsletterForm />
        </section>
      </div>
      <div className="atelier-footer-bottom wrap"><span>© 2026 Sew Lovely</span><span>Crafted with care in Gaborone</span><span>Privacy · Terms</span></div>
    </footer>
  );
}
