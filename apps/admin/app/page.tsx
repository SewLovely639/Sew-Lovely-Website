"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { HeroEditor } from "./hero-editor";

type Product = { id: string; name: string; description: string; price: number; category: string; brand: string; images: string[]; story: string; stylingTips: string[]; pairingSuggestions: string[] };
type Page = { eyebrow: string; title: string; emphasis: string; description: string; image: string };
type HeroSlide = { id: string; eyebrow: string; title: string; emphasis: string; description: string; image: string; imageAlt: string; cta: string };
type Nav = { label: string; type: "category" | "brand" | "anchor"; value: string };
type PosterCard = { name: string; description: string; image: string; price?: number };
type Lookbook = { eyebrow: string; title: string; cta: string; images: string[] };
type Connect = { title: string; description: string; whatsappUrl: string; whatsappLabel: string; instagramUrl: string; instagramLabel: string };
type Site = {
  navigation: Nav[];
  hero: Page;
  heroSlides: HeroSlide[];
  heroPills: string[];
  arrivalsTitle: string;
  arrivalsDescription: string;
  collectionsTitle: string;
  collectionsDescription: string;
  homeCategories: PosterCard[];
  collectionOne: PosterCard & { price: number };
  collectionTwo: PosterCard & { price: number };
  abaya: Page;
  alterations: Page;
  lookbook: Lookbook;
  connect: Connect;
  newsletterTitle: string;
  newsletterDescription: string;
  instagramTitle: string;
  instagramImages: string[];
  instagramLinks: string[];
  footerDescription: string;
  storeAddress: string;
  phone: string;
  email: string;
};
type Content = { products: Product[]; site: Site };

const blank: Product = { id: "", name: "", description: "", price: 0, category: "", brand: "", images: [], story: "", stylingTips: [], pairingSuggestions: [] };

export default function Admin() {
  const [content, setContent] = useState<Content | null>(null);
  const [form, setForm] = useState<Product>(blank);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<"Catalogue" | "Pages" | "Navigation" | "Hero">("Catalogue");

  async function load() {
    const response = await fetch("/api/cms", { cache: "no-store" });
    if (response.status === 401) {
      location.href = "/login";
      return;
    }
    setContent(await response.json());
  }

  useEffect(() => { void load(); }, []);

  async function save(kind: "site" | "product", data: Site | Product) {
    const response = await fetch("/api/cms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, data }),
    });
    const result = await response.json() as Content & { message?: string };
    if (!response.ok) {
      setMessage(result.message ?? "Save failed.");
      return;
    }
    setContent(result);
    setMessage("Published to storefront.");
  }

  if (!content) return <main className="admin-center">Loading admin...</main>;

  const categories = [...new Set(content.products.map((product) => product.category))];
  const brands = [...new Set(content.products.map((product) => product.brand))];

  return (
    <main className="admin">
      <header>
        <div className="admin-brand"><img src="/sewlovelylogo.png" alt="Sew Lovely" /><div><p>SEW LOVELY</p><h1>Storefront studio</h1></div></div>
        <nav>
          <Link href="/orders">Orders</Link>
          {(["Catalogue", "Pages", "Navigation", "Hero"] as const).map((item) => (
            <button className={tab === item ? "selected" : ""} onClick={() => setTab(item)} key={item} type="button">{item}</button>
          ))}
        </nav>
      </header>
      <div className="admin-shell">
        {message && <p className="notice">{message}</p>}
        {tab === "Catalogue" && (
          <section className="admin-grid">
            <div className="panel">
              <div className="panel-heading"><p>PRODUCTS</p><h2>Catalogue</h2></div>
              <div className="product-list">
                {content.products.map((product) => (
                  <article className="catalog-item" key={product.id}>
                    <img src={product.images[0]} alt="" />
                    <div><b>{product.name}</b><span>{product.category} - {product.brand} - P{product.price.toFixed(2)}</span></div>
                    <button onClick={() => setForm(product)} type="button">Edit</button>
                  </article>
                ))}
              </div>
            </div>
            <ProductEditor product={form} categories={categories} brands={brands} onChange={setForm} onSave={async (event) => {
              event.preventDefault();
              await save("product", { ...form, id: form.id || crypto.randomUUID() });
              setForm(blank);
            }} />
          </section>
        )}
        {tab === "Pages" && <PageEditor site={content.site} onChange={(site) => setContent({ ...content, site })} onSave={async (event) => { event.preventDefault(); await save("site", content.site); }} />}
        {tab === "Navigation" && <Navigation site={content.site} onChange={(site) => setContent({ ...content, site })} onSave={async (event) => { event.preventDefault(); await save("site", content.site); }} />}
        {tab === "Hero" && <HeroEditor slides={content.site.heroSlides ?? []} onChange={(heroSlides) => setContent({ ...content, site: { ...content.site, heroSlides } })} onSave={async () => { await save("site", content.site); }} />}
      </div>
    </main>
  );
}

function ProductEditor({ product, categories, brands, onChange, onSave }: { product: Product; categories: string[]; brands: string[]; onChange: (product: Product) => void; onSave: (event: FormEvent) => Promise<void> }) {
  const set = (key: keyof Product, value: string | number | string[]) => onChange({ ...product, [key]: value });
  return (
    <form className="panel product-form" onSubmit={(event) => void onSave(event)}>
      <div className="panel-heading"><p>{product.id ? "EDIT" : "NEW"}</p><h2>Product</h2></div>
      <label>Name<input value={product.name} onChange={(event) => set("name", event.target.value)} required /></label>
      <label>Description<textarea value={product.description} onChange={(event) => set("description", event.target.value)} required /></label>
      <div className="two">
        <label>Price (BWP)<input type="number" min="0" step="0.01" value={product.price} onChange={(event) => set("price", Number(event.target.value))} required /></label>
        <Choice label="Category" value={product.category} options={categories} onChange={(value) => set("category", value)} />
        <Choice label="Brand" value={product.brand} options={brands} onChange={(value) => set("brand", value)} />
      </div>
      <Images title="Product gallery / angles" images={product.images} onChange={(value) => set("images", value)} />
      <label>Product story<textarea value={product.story} onChange={(event) => set("story", event.target.value)} placeholder="The sourcing, craft, or feeling behind this piece" /></label>
      <StringList title="Styling tips" values={product.stylingTips} onChange={(value) => set("stylingTips", value)} />
      <StringList title="Pairing suggestions" values={product.pairingSuggestions} onChange={(value) => set("pairingSuggestions", value)} />
      <div className="form-buttons">
        <button className="save" type="submit">{product.id ? "Save product" : "Publish product"}</button>
        {product.id && <button type="button" onClick={() => onChange(blank)}>Cancel</button>}
      </div>
    </form>
  );
}

function Choice({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label>{label}
      <input list={`${label}-list`} value={value} onChange={(event) => onChange(event.target.value)} placeholder={`Choose or create ${label.toLowerCase()}`} required />
      <datalist id={`${label}-list`}>{options.map((item) => <option key={item} value={item} />)}</datalist>
    </label>
  );
}

function PageEditor({ site, onChange, onSave }: { site: Site; onChange: (site: Site) => void; onSave: (event: FormEvent) => Promise<void> }) {
  const update = (key: keyof Site, value: Site[keyof Site]) => onChange({ ...site, [key]: value });
  return (
    <form className="panel site-panel" onSubmit={(event) => void onSave(event)}>
      <div className="panel-heading"><h2>All storefront content</h2></div>
      <PageBlock title="Hero poster" value={site.hero} onChange={(value) => update("hero", value)} />
      <StringList title="Hero navigation buttons" values={site.heroPills} onChange={(value) => update("heroPills", value)} />
      <TextBlock title="Featured services" fields={[["Title", "arrivalsTitle"], ["Description", "arrivalsDescription"]]} site={site} update={update} />
      <PopularCategories value={site.homeCategories} onChange={(value) => update("homeCategories", value)} />
      <TextBlock title="Popular products" fields={[["Title", "collectionsTitle"], ["Description", "collectionsDescription"]]} site={site} update={update} />
      <LookbookEditor value={site.lookbook} onChange={(value) => update("lookbook", value)} />
      <TextBlock title="Newsletter and Instagram" fields={[["Newsletter title", "newsletterTitle"], ["Newsletter description", "newsletterDescription"], ["Instagram title", "instagramTitle"]]} site={site} update={update} />
      <InstagramGalleryEditor images={site.instagramImages} links={site.instagramLinks ?? []} onChange={(instagramImages, instagramLinks) => onChange({ ...site, instagramImages, instagramLinks })} />
      <TextBlock title="Footer and contact" fields={[["Footer description", "footerDescription"], ["Address", "storeAddress"], ["Phone", "phone"], ["Email", "email"]]} site={site} update={update} />
      <button className="save" type="submit">Save homepage</button>
    </form>
  );
}

function PageBlock({ title, value, onChange }: { title: string; value: Page; onChange: (value: Page) => void }) {
  const set = (key: keyof Page, next: string) => onChange({ ...value, [key]: next });
  return (
    <fieldset>
      <legend>{title}</legend>
      <div className="two">
        <label>Title<input value={value.title} onChange={(event) => set("title", event.target.value)} /></label>
        <label>Eyebrow<input value={value.eyebrow} onChange={(event) => set("eyebrow", event.target.value)} /></label>
      </div>
      <label>Emphasis<input value={value.emphasis} onChange={(event) => set("emphasis", event.target.value)} /></label>
      <label>Description<textarea value={value.description} onChange={(event) => set("description", event.target.value)} /></label>
      <Poster value={value.image} onChange={(image) => set("image", image)} />
    </fieldset>
  );
}

function PopularCategories({ value, onChange }: { value: PosterCard[]; onChange: (value: PosterCard[]) => void }) {
  const update = (index: number, patch: Partial<PosterCard>) => onChange(value.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  return (
    <fieldset>
      <legend>Popular Categories</legend>
      <div className="editor-list">
        {value.map((item, index) => (
          <article className="category-editor" key={`${item.name}-${index}`}>
            <div className="category-preview">{item.image && <img src={item.image} alt="" />}</div>
            <div>
              <label>Category name<input value={item.name} onChange={(event) => update(index, { name: event.target.value })} /></label>
              <label>Description<input value={item.description} onChange={(event) => update(index, { description: event.target.value })} /></label>
              <Poster value={item.image} onChange={(image) => update(index, { image })} />
              <button type="button" onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}>Remove category</button>
            </div>
          </article>
        ))}
      </div>
      <button type="button" onClick={() => onChange([...value, { name: "New category", description: "Category description", image: value[0]?.image ?? "" }])}>Add popular category</button>
    </fieldset>
  );
}

function StringList({ title, values, onChange }: { title: string; values: string[]; onChange: (values: string[]) => void }) {
  return (
    <fieldset>
      <legend>{title}</legend>
      {values.map((item, index) => (
        <div className="inline-row" key={`${item}-${index}`}>
          <input value={item} onChange={(event) => onChange(values.map((value, itemIndex) => itemIndex === index ? event.target.value : value))} />
          <button type="button" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...values, "New category"])}>Add button</button>
    </fieldset>
  );
}

function LookbookEditor({ value, onChange }: { value: Lookbook; onChange: (value: Lookbook) => void }) {
  return (
    <fieldset>
      <legend>Lookbook</legend>
      <label>Eyebrow<input value={value.eyebrow} onChange={(event) => onChange({ ...value, eyebrow: event.target.value })} /></label>
      <label>Title<textarea value={value.title} onChange={(event) => onChange({ ...value, title: event.target.value })} /></label>
      <label>Button text<input value={value.cta} onChange={(event) => onChange({ ...value, cta: event.target.value })} /></label>
      <Images title="Lookbook images" images={value.images} onChange={(images) => onChange({ ...value, images })} />
    </fieldset>
  );
}

function InstagramGalleryEditor({ images, links, onChange }: { images: string[]; links: string[]; onChange: (images: string[], links: string[]) => void }) {
  const update = (index: number, patch: { image?: string; link?: string }) => {
    const nextImages = images.map((item, itemIndex) => itemIndex === index ? patch.image ?? item : item);
    const nextLinks = images.map((_, itemIndex) => itemIndex === index ? patch.link ?? links[itemIndex] ?? "" : links[itemIndex] ?? "");
    onChange(nextImages, nextLinks);
  };
  return <fieldset><legend>Instagram gallery</legend><p className="field-note">Add the direct Instagram post URL beneath each image. Leave it blank when a tile should not link.</p>{images.map((image, index) => <article className="instagram-editor" key={`${image}-${index}`}><div className="category-preview">{image && <img src={image} alt="" />}</div><div><Poster value={image} onChange={(value) => update(index, { image: value })} /><label>Direct Instagram post URL<input type="url" value={links[index] ?? ""} placeholder="https://www.instagram.com/p/..." onChange={(event) => update(index, { link: event.target.value })} /></label></div></article>)}</fieldset>;
}

function ConnectEditor({ value, onChange }: { value: Connect; onChange: (value: Connect) => void }) {
  return (
    <fieldset>
      <legend>QR and social links</legend>
      <label>Title<input value={value.title} onChange={(event) => onChange({ ...value, title: event.target.value })} /></label>
      <label>Description<textarea value={value.description} onChange={(event) => onChange({ ...value, description: event.target.value })} /></label>
      <div className="two">
        <label>WhatsApp URL<input value={value.whatsappUrl} onChange={(event) => onChange({ ...value, whatsappUrl: event.target.value })} /></label>
        <label>WhatsApp label<input value={value.whatsappLabel} onChange={(event) => onChange({ ...value, whatsappLabel: event.target.value })} /></label>
      </div>
      <div className="two">
        <label>Instagram URL<input value={value.instagramUrl} onChange={(event) => onChange({ ...value, instagramUrl: event.target.value })} /></label>
        <label>Instagram label<input value={value.instagramLabel} onChange={(event) => onChange({ ...value, instagramLabel: event.target.value })} /></label>
      </div>
    </fieldset>
  );
}

function TextBlock({ title, fields, site, update }: { title: string; fields: [string, keyof Site][]; site: Site; update: (key: keyof Site, value: Site[keyof Site]) => void }) {
  return (
    <fieldset>
      <legend>{title}</legend>
      {fields.map(([label, key]) => <label key={key}>{label}<textarea value={String(site[key])} onChange={(event) => update(key, event.target.value)} /></label>)}
    </fieldset>
  );
}

function Poster({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label>Poster image
      <input type="url" value={value} placeholder="HTTPS image URL" onChange={(event) => onChange(event.target.value)} />
      <MediaUpload onUploaded={(urls) => onChange(urls[0] ?? value)} />
      {value && <img className="preview" src={value} alt="Poster preview" />}
    </label>
  );
}

function Images({ title, images, onChange }: { title: string; images: string[]; onChange: (items: string[]) => void }) {
  return (
    <fieldset>
      <legend>{title}</legend>
      <MediaUpload multiple disabled={images.length >= 8} onUploaded={(urls) => onChange([...images, ...urls].slice(0, 8))} />
      <div className="gallery">
        {images.map((src, index) => (
          <div key={`${src}-${index}`}>
            <img src={src} alt="" />
            <button type="button" onClick={() => onChange(images.filter((_, itemIndex) => itemIndex !== index))}>Remove</button>
          </div>
        ))}
      </div>
      {images.length === 0 && <p>Add at least one image.</p>}
    </fieldset>
  );
}

function MediaUpload({ onUploaded, multiple = false, disabled = false }: { onUploaded: (urls: string[]) => void; multiple?: boolean; disabled?: boolean }) {
  const [message, setMessage] = useState("");
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, multiple ? 8 : 1);
    event.target.value = "";
    if (!files.length) return;
    const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (files.some((file) => !allowed.has(file.type) || file.size < 1 || file.size > 8 * 1024 * 1024)) { setMessage("Use JPEG, PNG, or WebP images under 8 MB."); return; }
    setMessage(`Uploading ${files.length} image${files.length === 1 ? "" : "s"}…`);
    const urls: string[] = [];
    try {
      for (const file of files) {
        const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
        const contentHash = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
        const response = await fetch("/api/media", { method: "POST", headers: { "content-type": file.type, "x-sew-lovely-file-name": encodeURIComponent(file.name), "x-sew-lovely-file-size": String(file.size), "x-sew-lovely-content-sha256": contentHash }, body: file });
        const payload = await response.json() as { url?: string; message?: string };
        if (!response.ok || !payload.url) throw new Error(payload.message ?? "Upload failed.");
        urls.push(payload.url);
      }
      onUploaded(urls);
      setMessage(`${urls.length} image${urls.length === 1 ? "" : "s"} uploaded to R2.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    }
  }
  return <div className="media-upload"><input type="file" accept="image/jpeg,image/png,image/webp" multiple={multiple} disabled={disabled} onChange={(event) => void upload(event)} /><p className="field-note">Files stream directly to R2, are cached for one year, and are not stored in the editor or database.</p>{message && <p className="field-note" role="status">{message}</p>}</div>;
}

function Navigation({ site, onChange, onSave }: { site: Site; onChange: (site: Site) => void; onSave: (event: FormEvent) => Promise<void> }) {
  const items = site.navigation;
  return (
    <form className="panel site-panel" onSubmit={(event) => void onSave(event)}>
      <div className="panel-heading"><p>PAGE 2 - NAVIGATION</p><h2>Menu categories and brands</h2></div>
      {items.map((item, index) => (
        <fieldset key={`${item.label}-${index}`}>
          <label>Label<input value={item.label} onChange={(event) => onChange({ ...site, navigation: items.map((navItem, itemIndex) => itemIndex === index ? { ...navItem, label: event.target.value } : navItem) })} /></label>
          <div className="two">
            <label>Opens<select value={item.type} onChange={(event) => onChange({ ...site, navigation: items.map((navItem, itemIndex) => itemIndex === index ? { ...navItem, type: event.target.value as Nav["type"] } : navItem) })}><option value="category">Category page</option><option value="brand">Brand page</option><option value="anchor">Homepage section</option></select></label>
            <label>Category, brand, or section id<input value={item.value} onChange={(event) => onChange({ ...site, navigation: items.map((navItem, itemIndex) => itemIndex === index ? { ...navItem, value: event.target.value } : navItem) })} /></label>
          </div>
          <button type="button" onClick={() => onChange({ ...site, navigation: items.filter((_, itemIndex) => itemIndex !== index) })}>Remove</button>
        </fieldset>
      ))}
      <button type="button" onClick={() => onChange({ ...site, navigation: [...items, { label: "New category", type: "category", value: "New category" }] })}>Add navigation item</button>
      <button className="save" type="submit">Save navigation</button>
    </form>
  );
}



