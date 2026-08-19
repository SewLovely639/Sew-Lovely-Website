import Image from "next/image";
import Link from "next/link";
import { readContent } from "@sew-lovely/cms";
import { NewsletterForm } from "./components/newsletter-form";
import { FloatingWhatsApp, QuickAdd } from "./components/store-actions";
import { HeroSlideshow } from "./components/hero-slideshow";
import { GiftBox } from "./components/gift-box";
import { SiteNav } from "./components/site-nav";
import { ScrollReveal } from "./components/scroll-reveal";

export const dynamic = "force-dynamic";

type Content = Awaited<ReturnType<typeof readContent>>;
type Product = Content["products"][number];
type Site = Content["site"];

function ProductCard({ product }: { product: Product }) {
  return <article className="product-card"><Link href={`/shop/${encodeURIComponent(product.id)}`} className="product-card-link"><div className="thumb"><Image src={product.images[0]} alt={product.name} fill unoptimized sizes="(max-width: 900px) 50vw, 25vw" /></div><p className="name">{product.name}</p></Link><div className="meta"><strong className="price">P{product.price.toFixed(2)}</strong><QuickAdd product={product} /></div></article>;
}

function Footer({ site }: { site: Site }) {
  return <footer><div className="wrap footer-grid"><div className="footer-brand"><img src="/sewlovelylogo.png" alt="Sew Lovely" /><p>{site.footerDescription}</p></div><div className="footer-col"><p className="head">Quick Links</p><ul>{site.navigation.slice(0, 4).map((item) => <li key={item.label}><Link href={item.type === "anchor" ? `/#${item.value}` : `/shop?${item.type}=${encodeURIComponent(item.value)}`}>{item.label}</Link></li>)}</ul></div><div className="footer-col"><p className="head">Visit Us</p><ul>{site.storeAddress.split("\n").map((line) => <li key={line}><span>{line}</span></li>)}</ul></div><div className="footer-col"><p className="head">Contact</p><ul><li><a href={`tel:${site.phone.replaceAll(" ", "")}`}>{site.phone}</a></li><li><a href={`mailto:${site.email}`}>{site.email}</a></li><li><a href={site.connect.instagramUrl}>{site.connect.instagramLabel}</a></li></ul></div></div><div className="wrap footer-bottom"><span>© 2026 Sew Lovely. All Rights Reserved.</span><span>Saheda Subedar - African Mall</span></div></footer>;
}

export default async function HomePage() {
  const { products, site } = await readContent();
  const featured = products.slice(0, 6);
  const heroSlides = site.heroSlides?.length ? site.heroSlides : [{ id: "legacy-hero", eyebrow: site.hero.eyebrow, title: site.hero.title, emphasis: site.hero.emphasis, description: site.hero.description, image: site.hero.image, imageAlt: "Sew Lovely editorial hero", cta: "Explore the edit" }];
  return <><SiteNav navigation={site.navigation} /><main><HeroSlideshow slides={heroSlides} /><ScrollReveal><section className="product-section wrap" id="services"><div className="section-header"><h2>{site.arrivalsTitle} <span className="rule" /></h2><Link className="view-all" href="/shop">View All</Link></div><p className="section-copy">{site.arrivalsDescription}</p><div className="product-grid">{featured.map((product) => <ProductCard key={product.id} product={product} />)}</div></section></ScrollReveal><ScrollReveal delay={80}><section className="categories" id="categories"><h2><span className="rule" /> Popular Categories <span className="rule" /></h2><div className="cat-grid wrap">{site.homeCategories.map((category) => <Link className="cat-tile" key={category.name} href={`/shop?category=${encodeURIComponent(category.name)}`}><Image src={category.image} alt={category.name} fill unoptimized sizes="(max-width: 900px) 50vw, 25vw" /><span>{category.name}</span></Link>)}</div></section></ScrollReveal><ScrollReveal><section className="product-section wrap" id="products"><div className="section-header"><h2>{site.collectionsTitle} <span className="rule" /></h2><Link className="view-all" href="/shop">View All</Link></div><p className="section-copy">{site.collectionsDescription}</p><div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div></section></ScrollReveal><ScrollReveal delay={80}><GiftBox products={featured} /></ScrollReveal><ScrollReveal><section className="lookbook wrap" id="lookbook"><div className="lookbook-box"><div className="lookbook-thumbs">{site.lookbook.images.slice(0, 3).map((imageUrl, index) => <div className="t" key={imageUrl}><Image src={imageUrl} alt={`${site.lookbook.title} ${index + 1}`} fill unoptimized sizes="150px" /></div>)}</div><div className="lookbook-copy"><p className="eyebrow">{site.lookbook.eyebrow}</p><h3>{site.lookbook.title}</h3><Link className="shop-now" href="/shop">{site.lookbook.cta}</Link></div></div></section></ScrollReveal><ScrollReveal><section className="newsletter wrap"><div><h3>{site.newsletterTitle}</h3><p>{site.newsletterDescription}</p><NewsletterForm /></div><div><p className="insta-title">{site.instagramTitle}</p><div className="insta-grid">{site.instagramImages.slice(0, 4).map((imageUrl, index) => { const link = site.instagramLinks?.[index] || ""; const tile = <div className="tile"><Image src={imageUrl} alt={`${site.instagramTitle} ${index + 1}`} fill unoptimized sizes="120px" /><span className="insta-overlay">View post ↗</span></div>; return link ? <a className="insta-link" href={link} target="_blank" rel="noreferrer" key={imageUrl}>{tile}</a> : <div className="insta-link" key={imageUrl}>{tile}</div>; })}</div></div></section></ScrollReveal></main><FloatingWhatsApp /><Footer site={site} /></>;
}
