import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { readContent } from "@sew-lovely/cms";
import { ProductGallery } from "../../components/product-gallery";
import { QuickAdd, StoreActions } from "../../components/store-actions";
import { SiteNav } from "../../components/site-nav";
import { ScrollReveal } from "../../components/scroll-reveal";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { products, site } = await readContent();
  const product = products.find((item) => item.id === id);
  if (!product) notFound();
  return <><SiteNav navigation={site.navigation} /><main className="wrap product-detail"><Link className="back-link" href="/shop">← Back to the edit</Link><div className="product-detail-grid"><ScrollReveal><ProductGallery name={product.name} images={product.images} /></ScrollReveal><ScrollReveal delay={80}><section className="product-detail-copy"><p className="eyebrow">{product.category} · {product.brand}</p><h1>{product.name}</h1><p className="product-detail-price">P{product.price.toFixed(2)}</p><p className="product-detail-description">{product.description}</p>{product.story && <p className="product-story">{product.story}</p>}<div className="product-detail-actions"><QuickAdd product={product} /><Link className="button secondary" href="/shop">Continue shopping</Link></div><div className="detail-panels">{product.stylingTips.length > 0 && <section><h2>Styling notes</h2><ul>{product.stylingTips.map((tip) => <li key={tip}>{tip}</li>)}</ul></section>}{product.pairingSuggestions.length > 0 && <section><h2>Pair it with</h2><ul>{product.pairingSuggestions.map((item) => <li key={item}>{item}</li>)}</ul></section>}</div></section></ScrollReveal></div><ScrollReveal className="product-care"><div><p className="eyebrow">Sew Lovely care</p><h2>Made to be worn, loved and remembered.</h2><p>For the best fit, keep the original shape of each piece in mind and let our alterations team help you make it yours.</p></div><Image src={product.images[product.images.length - 1] ?? product.images[0]} alt={`${product.name} detail`} width={300} height={360} unoptimized /></ScrollReveal></main><footer><div className="wrap footer-bottom"><span>© 2026 Sew Lovely</span><span>{site.email}</span></div></footer></>;
}
