import Image from "next/image";
import Link from "next/link";
import { readContent } from "@sew-lovely/cms";
import { BackArrow } from "../components/back-arrow";
import { FloatingWhatsApp, QuickAdd } from "../components/store-actions";
import { SiteNav } from "../components/site-nav";
import { ScrollReveal } from "../components/scroll-reveal";

export const dynamic = "force-dynamic";

type Content = Awaited<ReturnType<typeof readContent>>;
type Product = Content["products"][number];

function ProductCard({ product }: { product: Product }) {
  return <article className="product-card"><Link href={`/shop/${encodeURIComponent(product.id)}`} className="product-card-link"><div className="thumb"><Image src={product.images[0]} alt={product.name} fill unoptimized sizes="(max-width: 900px) 50vw, 25vw" /></div><p className="name">{product.name}</p></Link><div className="meta"><strong className="price">P{product.price.toFixed(2)}</strong><QuickAdd product={product} /></div></article>;
}

export default async function Shop({ searchParams }: { searchParams: Promise<{ category?: string; brand?: string; q?: string }> }) {
  const params = await searchParams;
  const { products, site } = await readContent();
  const field = params.category ? "category" : "brand";
  const value = params.category ?? params.brand ?? params.q;
  const search = params.q?.toLowerCase();
  const filtered = search ? products.filter((product) => `${product.name} ${product.description} ${product.category} ${product.brand}`.toLowerCase().includes(search)) : value ? products.filter((product) => product[field] === value) : products;
  return <><SiteNav navigation={site.navigation} /><BackArrow /><main className="wrap catalogue-page"><p className="eyebrow">Shop Sew Lovely</p><h1>{value ?? "All products"}</h1><p>{filtered.length} {filtered.length === 1 ? "piece" : "pieces"} available</p><ScrollReveal><div className="product-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div>{filtered.length === 0 && <p className="empty">No products are published in this search or category yet.</p>}</ScrollReveal></main><FloatingWhatsApp /><footer><div className="wrap footer-grid"><div className="footer-brand"><img src="/sewlovelylogo.png" alt="Sew Lovely" /><p>{site.footerDescription}</p></div><div className="footer-col"><p className="head">Quick Links</p><ul><li><Link href="/">Home</Link></li><li><Link href="/shop">Shop all</Link></li><li><Link href="/#services">Services</Link></li></ul></div><div className="footer-col"><p className="head">Visit Us</p><ul>{site.storeAddress.split("\n").map((line) => <li key={line}><span>{line}</span></li>)}</ul></div><div className="footer-col"><p className="head">Contact</p><ul><li><a href={`mailto:${site.email}`}>{site.email}</a></li><li><a href={`tel:${site.phone.replaceAll(" ", "")}`}>{site.phone}</a></li></ul></div></div><div className="wrap footer-bottom"><span>© 2026 Sew Lovely. All Rights Reserved.</span><span>Saheda Subedar - African Mall</span></div></footer></>;
}
