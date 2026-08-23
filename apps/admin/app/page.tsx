"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import "./video-editor.css";
import Link from "next/link";
import { HeroEditor } from "./hero-editor";
import { mediaTypeFromSignature } from "./lib/media-signature";
import { NavigationEditor } from "./navigation-editor";

type Badge = { label: string; tone: "standard" | "discount" } | null;
type Product = { id: string; name: string; description: string; price: number; category: string; brand: string; images: string[]; story: string; stylingTips: string[]; pairingSuggestions: string[]; productDetails: string; fabricAndFit: string; careInstructions: string; sizes: string[]; badge: Badge };
type Page = { eyebrow: string; title: string; emphasis: string; description: string; image: string };
type HeroSlide = { id: string; eyebrow: string; title: string; emphasis: string; description: string; image: string; imageAlt: string; cta: string };
type Nav = { label: string; type: "category" | "brand" | "anchor"; value: string; image?: string; destination: string };
type PosterCard = { name: string; description: string; image: string; destination: string; price?: number };
type WorkroomVideo = { id: string; src: string; label: string; startAt: number; productIds: string[]; buttonLabel: string; buttonColor: string };
type VideoShopAnalyticsRow = { videoId: string; productId: string; clicks: number; lastClickedAt: string };
type Lookbook = { eyebrow: string; title: string; cta: string; images: string[] };
type Connect = { title: string; description: string; whatsappUrl: string; whatsappLabel: string; instagramUrl: string; instagramLabel: string };
type Site = {
  taxonomy: { categories: string[]; brands: string[] };
  navigation: Nav[];
  hero: Page;
  heroSlides: HeroSlide[];
  heroPills: string[];
  arrivalsTitle: string;
  arrivalsDescription: string;
  collectionsTitle: string;
  collectionsDescription: string;
  homeCategories: PosterCard[];
  workroomVideos: WorkroomVideo[];
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

const blank: Product = { id: "", name: "", description: "", price: 0, category: "", brand: "", images: [], story: "", stylingTips: [], pairingSuggestions: [], productDetails: "", fabricAndFit: "", careInstructions: "", sizes: ["XXS", "XS", "S", "M", "L", "XL"], badge: null };

export default function Admin() {
  const [content, setContent] = useState<Content | null>(null);
  const [form, setForm] = useState<Product>(blank);
  const [message, setMessage] = useState("");
  const [loadError, setLoadError] = useState("");
  const [tab, setTab] = useState<"Catalogue" | "Pages" | "Navigation" | "Hero" | "Videos">("Catalogue");

  async function load() {
    setLoadError("");
    try {
      const response = await fetch("/api/cms", { cache: "no-store" });
      if (response.status === 401) { location.href = "/login"; return; }
      const raw = await response.text();
      const result = raw ? JSON.parse(raw) as Content & { message?: string } : null;
      if (!response.ok || !result || typeof result !== "object" || !("site" in result) || !("products" in result)) {
        throw new Error(result?.message ?? "The admin content service did not return data. Check the local Supabase configuration and restart the admin server.");
      }
      setContent(result);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "The admin content service could not be loaded.");
    }
  }

  useEffect(() => { void load(); }, []);

  async function save(kind: "site" | "product" | "content", data: Site | Product | Content) {
    const response = await fetch("/api/cms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, data }),
    });
    const raw = await response.text();
    const result = raw ? JSON.parse(raw) as Content & { message?: string } : null;
    if (!response.ok) {
      setMessage(result?.message ?? "Save failed. Check your local configuration and try again.");
      return;
    }
    if (!result || !("site" in result) || !("products" in result)) { setMessage("Save did not return updated content. Please retry."); return; }
    setContent(result);
    setMessage("Published to storefront.");
  }

  if (!content) return <main className="admin-center"><div><p>{loadError || "Loading admin..."}</p>{loadError && <button type="button" onClick={() => void load()}>Retry loading</button>}</div></main>;

	const categories = content.site.taxonomy.categories;
  const brands = content.site.taxonomy.brands;
	const tabCopy = {
		Catalogue: { eyebrow: "THE PRODUCT EDIT", title: "Curate the collection.", description: "Shape every product detail, image angle and story with the same care customers see on the storefront." },
		Pages: { eyebrow: "THE BRAND LANGUAGE", title: "Compose the homepage.", description: "Refine the editorial moments, category tiles, social imagery and customer-facing notes that make Sew Lovely feel considered." },
			Navigation: { eyebrow: "THE COLLECTION MAP", title: "Guide every discovery.", description: "Manage the category names, imagery and destinations that connect each customer to the right part of the collection." },
			Hero: { eyebrow: "THE FIRST IMPRESSION", title: "Set the seasonal mood.", description: "Build the hero slideshow with imagery, copy and calls to action that feel unmistakably Sew Lovely." },
			Videos: { eyebrow: "THE WORKROOM IN MOTION", title: "Show the craft.", description: "Upload considered atelier videos that appear in the storefront’s editorial workroom gallery." },
	}[tab];

  return (
    <main className="admin">
      <header>
        <div className="admin-brand"><img src="/sewlovelylogo.png" alt="Sew Lovely" /><div><p>SEW LOVELY</p><h1>Storefront studio</h1></div></div>
        <nav>
          <Link className="admin-nav-link" href="/orders">Orders</Link>
          {(["Catalogue", "Pages", "Navigation", "Hero", "Videos"] as const).map((item) => (
            <button className={tab === item ? "selected" : ""} onClick={() => setTab(item)} key={item} type="button">{item}</button>
          ))}
        </nav>
	      </header>
	      <div className="admin-shell">
			<section className="studio-masthead">
				<div><p>{tabCopy.eyebrow}</p><h2>{tabCopy.title}</h2></div>
				<p className="studio-masthead-copy">{tabCopy.description}</p>
					<div className="studio-metrics" aria-label="Storefront content summary"><div><strong>{content.products.length}</strong><span>products</span></div><div><strong>{categories.length}</strong><span>categories</span></div><div><strong>{content.site.heroSlides?.length ?? 0}</strong><span>hero slides</span></div><div><strong>{content.site.workroomVideos?.length ?? 0}</strong><span>videos</span></div></div>
			</section>
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
		{tab === "Navigation" && <div className="editor-stack"><TaxonomyEditor content={content} onChange={setContent} onSave={async (event) => { event.preventDefault(); await save("content", content); }} /><NavigationEditor site={content.site} onChange={(navigationSite) => setContent({ ...content, site: { ...content.site, ...navigationSite } })} onSave={async (event) => { event.preventDefault(); await save("site", content.site); }} /></div>}
        {tab === "Hero" && <HeroEditor slides={content.site.heroSlides ?? []} onChange={(heroSlides) => setContent({ ...content, site: { ...content.site, heroSlides } })} onSave={async () => { await save("site", content.site); }} />}
        {tab === "Videos" && <WorkroomVideoEditor videos={content.site.workroomVideos ?? []} products={content.products} onChange={(workroomVideos) => setContent({ ...content, site: { ...content.site, workroomVideos } })} onSave={async (event) => { event.preventDefault(); await save("site", content.site); }} />}
      </div>
    </main>
  );
}

function ProductEditor({ product, categories, brands, onChange, onSave }: { product: Product; categories: string[]; brands: string[]; onChange: (product: Product) => void; onSave: (event: FormEvent) => Promise<void> }) {
  const set = <Key extends keyof Product>(key: Key, value: Product[Key]) => onChange({ ...product, [key]: value });
  return (
    <form className="panel product-form" onSubmit={(event) => void onSave(event)}>
      <div className="panel-heading"><p>{product.id ? "EDIT" : "NEW"}</p><h2>Product</h2></div>
      <label>Name<input value={product.name} onChange={(event) => set("name", event.target.value)} required /></label>
      <label>Description<textarea value={product.description} onChange={(event) => set("description", event.target.value)} required /></label>
      <div className="two">
        <label>Price (BWP)<input type="number" min="0" step="0.01" value={product.price} onChange={(event) => set("price", Number(event.target.value))} required /></label>
		<ManagedCategorySelect value={product.category} options={categories} onChange={(value) => set("category", value)} />
		<ManagedChoice label="Brand" value={product.brand} options={brands} onChange={(value) => set("brand", value)} />
      </div>
      <Images title="Product gallery / angles" images={product.images} onChange={(value) => set("images", value)} />
      <ProductSizeEditor value={product.sizes} onChange={(value) => set("sizes", value)} />
      <ProductBadgeEditor value={product.badge} onChange={(value) => set("badge", value)} />
      <fieldset>
        <legend>Product information</legend>
        <label>Product Details<textarea value={product.productDetails} onChange={(event) => set("productDetails", event.target.value)} placeholder="The construction, embroidery, silhouette, or key product details." /></label>
        <label>Fabric &amp; Fit<textarea value={product.fabricAndFit} onChange={(event) => set("fabricAndFit", event.target.value)} placeholder="Fabric composition, lining, measurements, and fit guidance." /></label>
        <label>Care Instructions<textarea value={product.careInstructions} onChange={(event) => set("careInstructions", event.target.value)} placeholder="Cleaning, storage, and garment-care guidance." /></label>
      </fieldset>
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

function TaxonomyEditor({ content, onChange, onSave }: { content: Content; onChange: (content: Content) => void; onSave: (event: FormEvent) => Promise<void> }) {
  const [categoryDraft, setCategoryDraft] = useState("");
  const [brandDraft, setBrandDraft] = useState("");
  const updateTaxonomy = (kind: "categories" | "brands", values: string[], previous = "", next = "") => {
    const replacement = next.trim();
    const list = [...new Set(values.map((value) => value.trim()).filter(Boolean))];
    const products = content.products.map((product) => kind === "categories" && product.category === previous ? { ...product, category: replacement } : kind === "brands" && product.brand === previous ? { ...product, brand: replacement } : product);
    const navigation = kind === "categories" ? content.site.navigation.map((item) => item.type === "category" && item.value === previous ? { ...item, value: replacement, label: item.label === previous ? replacement : item.label } : item) : content.site.navigation;
    onChange({ ...content, products, site: { ...content.site, taxonomy: { ...content.site.taxonomy, [kind]: list }, navigation } });
  };
  const rename = (kind: "categories" | "brands", index: number, value: string) => {
    const list = content.site.taxonomy[kind]; const previous = list[index]; const next = value.trim();
    if (!next || (next !== previous && list.includes(next))) return;
    const values = list.map((item, itemIndex) => itemIndex === index ? next : item);
    updateTaxonomy(kind, values, previous, next);
  };
  const remove = (kind: "categories" | "brands", value: string) => {
    const list = content.site.taxonomy[kind]; if (list.length <= 1) return;
    const values = list.filter((item) => item !== value); const fallback = values[0];
    updateTaxonomy(kind, values, value, fallback);
  };
  const add = (kind: "categories" | "brands", value: string, clear: () => void) => {
    const name = value.trim(); const list = content.site.taxonomy[kind];
    if (!name || list.includes(name)) return;
    updateTaxonomy(kind, [...list, name]); clear();
  };
  const list = (kind: "categories" | "brands", title: string, draft: string, setDraft: (value: string) => void) => <fieldset><legend>{title}</legend><p className="field-note">Renaming updates every assigned product. Deleting moves assigned products to the first remaining {title.toLowerCase()}.</p><div className="taxonomy-list">{content.site.taxonomy[kind].map((value, index) => <div className="taxonomy-row" key={value}><input value={value} onChange={(event) => rename(kind, index, event.target.value)} /><button className="danger" type="button" disabled={content.site.taxonomy[kind].length === 1} onClick={() => remove(kind, value)}>Delete</button></div>)}</div><div className="inline-row"><input value={draft} placeholder={`Add ${title.slice(0, -1).toLowerCase()}`} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); add(kind, draft, () => setDraft("")); } }} /><button type="button" onClick={() => add(kind, draft, () => setDraft(""))}>Add</button></div></fieldset>;
  return <form className="panel site-panel" onSubmit={(event) => void onSave(event)}><div className="panel-heading"><p>PRODUCT FOUNDATIONS</p><h2>Categories &amp; brands</h2></div><div className="two taxonomy-columns">{list("categories", "Categories", categoryDraft, setCategoryDraft)}{list("brands", "Brands", brandDraft, setBrandDraft)}</div><button className="save" type="submit">Save categories &amp; brands</button></form>;
}

function ManagedChoice({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label>{label}<select value={value} onChange={(event) => onChange(event.target.value)} required><option value="" disabled>Select a managed {label.toLowerCase()}</option>{options.map((item) => <option key={item} value={item}>{item}</option>)}</select><span className="field-note">Create or edit {label.toLowerCase()}s in Navigation.</span></label>
  );
}

function ManagedCategorySelect({ value, options, onChange }: { value: string; options: string[]; onChange: (value: string) => void }) {
	return <label>Category<select value={value} onChange={(event) => onChange(event.target.value)} required><option value="" disabled>Select a managed category</option>{options.map((item) => <option key={item} value={item}>{item}</option>)}</select><span className="field-note">Create or edit categories in Navigation. Products only appear in the category selected here.</span></label>;
}

function ProductSizeEditor({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) {
  const choices = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "Custom", "Unstitched"];
  const toggle = (choice: string) => onChange(value.includes(choice) ? value.filter((size) => size !== choice) : [...value, choice]);
  return <fieldset><legend>Available sizes</legend><p className="field-note">Select every size or fulfilment option available for this product. The customer sees only these choices.</p><div className="choice-chips">{choices.map((choice) => <button className={value.includes(choice) ? "selected" : ""} key={choice} onClick={() => toggle(choice)} type="button" aria-pressed={value.includes(choice)}>{choice}</button>)}</div>{value.some((item) => !choices.includes(item)) && <div className="choice-chips">{value.filter((item) => !choices.includes(item)).map((item) => <button className="selected" key={item} onClick={() => onChange(value.filter((size) => size !== item))} type="button">{item} ×</button>)}</div>}<label>Additional size or option<input placeholder="For example: 3XL, One Size, Made to Measure" onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); const input = event.currentTarget; const next = input.value.trim(); if (next && !value.includes(next)) onChange([...value, next]); input.value = ""; } }} /></label></fieldset>;
}

function ProductBadgeEditor({ value, onChange }: { value: Badge; onChange: (value: Badge) => void }) {
  return <fieldset><legend>Product badge</legend><p className="field-note">This appears on the product card’s top-right corner. Choose a standard editorial badge or a red discount treatment.</p><label>Badge text<input value={value?.label ?? ""} placeholder="Bestseller, New arrival, 50% off" onChange={(event) => onChange(event.target.value.trim() ? { label: event.target.value, tone: value?.tone ?? "standard" } : null)} /></label><div className="choice-chips"><button className={value?.tone !== "discount" ? "selected" : ""} type="button" onClick={() => value && onChange({ ...value, tone: "standard" })}>Standard</button><button className={value?.tone === "discount" ? "selected" : ""} type="button" onClick={() => value && onChange({ ...value, tone: "discount" })}>Discount / red</button>{value && <button className="danger" type="button" onClick={() => onChange(null)}>Remove badge</button>}</div></fieldset>;
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
	  <legend>Hero category tiles</legend>
      <div className="editor-list">
        {value.map((item, index) => (
          <article className="category-editor" key={`${item.name}-${index}`}>
            <div className="category-preview">{item.image && <img src={item.image} alt="" />}</div>
            <div>
              <label>Category name<input value={item.name} onChange={(event) => update(index, { name: event.target.value })} /></label>
	              <label>Description<input value={item.description} onChange={(event) => update(index, { description: event.target.value })} /></label>
	              <label>Opens<input value={item.destination ?? ""} placeholder="/collections/category-name or https://..." onChange={(event) => update(index, { destination: event.target.value })} /></label>
	              <Poster value={item.image} onChange={(image) => update(index, { image })} />
              <button type="button" onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}>Remove category</button>
            </div>
          </article>
        ))}
      </div>
	  <button type="button" onClick={() => onChange([...value, { name: "New category", description: "Category description", image: value[0]?.image ?? "", destination: "/collections/new-arrivals" }])}>Add hero category tile</button>
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

function WorkroomVideoEditor({ videos, products, onChange, onSave }: { videos: WorkroomVideo[]; products: Product[]; onChange: (videos: WorkroomVideo[]) => void; onSave: (event: FormEvent) => Promise<void> }) {
  const update = <Key extends keyof WorkroomVideo>(index: number, key: Key, value: WorkroomVideo[Key]) => onChange(videos.map((video, videoIndex) => videoIndex === index ? { ...video, [key]: value } : video));
  const toggleProduct = (index: number, productId: string) => update(index, "productIds", videos[index].productIds.includes(productId) ? videos[index].productIds.filter((id) => id !== productId) : [...videos[index].productIds, productId].slice(0, 8));
  return <form className="panel site-panel" onSubmit={(event) => void onSave(event)}><div className="panel-heading"><p>STOREFRONT MEDIA</p><h2>Workroom videos</h2></div><p className="muted">Upload MP4 videos up to 50 MB, tag up to eight products, and personalize the customer shopping action on every editorial tile.</p><VideoShopAnalytics videos={videos} products={products} /><MediaUpload kind="video" multiple disabled={videos.length >= 8} onUploaded={(urls) => onChange([...videos, ...urls.map((src, index) => ({ id: crypto.randomUUID(), src, label: `Workroom video ${videos.length + index + 1}`, startAt: 0, productIds: products[0] ? [products[0].id] : [], buttonLabel: "Shop now", buttonColor: "#cc1f76" }))].slice(0, 8))} /><div className="video-editor-grid">{videos.map((video, index) => <fieldset key={video.id}><legend>Video {index + 1}</legend><video src={video.src} muted playsInline controls preload="metadata" className="video-preview" /><label>Label<input value={video.label} onChange={(event) => update(index, "label", event.target.value)} /></label><label>Button text<input maxLength={32} value={video.buttonLabel} onChange={(event) => update(index, "buttonLabel", event.target.value)} /></label><label>Button color<input type="color" value={video.buttonColor} onChange={(event) => update(index, "buttonColor", event.target.value)} /></label><fieldset><legend>Tagged products</legend><p className="field-note">Select every item customers can shop from this look. Choose up to eight products.</p><div className="choice-chips">{products.map((product) => <button type="button" className={video.productIds.includes(product.id) ? "selected" : ""} key={product.id} onClick={() => toggleProduct(index, product.id)}>{product.name}</button>)}</div></fieldset><label>Start at (seconds)<input type="number" min="0" step="0.1" value={video.startAt} onChange={(event) => update(index, "startAt", Number(event.target.value))} /></label><label>Video URL<input type="url" value={video.src} onChange={(event) => update(index, "src", event.target.value)} /></label><button className="danger" type="button" onClick={() => onChange(videos.filter((_, videoIndex) => videoIndex !== index))}>Remove video</button></fieldset>)}</div>{videos.length === 0 && <p className="field-note">No custom videos yet. The storefront retains its existing editorial clips until you upload your own.</p>}<button className="save" type="submit">Publish workroom videos</button></form>;
}

function VideoShopAnalytics({ videos, products }: { videos: WorkroomVideo[]; products: Product[] }) {
  const [rows, setRows] = useState<VideoShopAnalyticsRow[]>([]);
  const [message, setMessage] = useState("Loading click analytics…");
  const load = async () => { try { const response = await fetch("/api/video-shop-analytics", { cache: "no-store" }); const payload = await response.json().catch(() => null) as { rows?: VideoShopAnalyticsRow[]; message?: string } | null; if (!response.ok) throw new Error(payload?.message ?? "Unable to load click analytics."); setRows(payload?.rows ?? []); setMessage(""); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to load click analytics."); } };
  useEffect(() => { void load(); }, []);
  const total = rows.reduce((sum, row) => sum + row.clicks, 0);
  return <section className="video-analytics" aria-label="Video shopping click analytics"><div className="panel-heading"><div><p>CLICK ANALYTICS</p><h2>{total} shopping clicks</h2></div><button type="button" onClick={() => void load()}>Refresh</button></div>{message ? <p className="field-note">{message}</p> : rows.length === 0 ? <p className="field-note">No tagged-product clicks have been recorded yet.</p> : <div className="video-analytics-list">{rows.map((row) => { const video = videos.find((item) => item.id === row.videoId); const product = products.find((item) => item.id === row.productId); return <div key={`${row.videoId}-${row.productId}`}><strong>{row.clicks}</strong><span>{video?.label ?? row.videoId} → {product?.name ?? row.productId}</span><time>{new Date(row.lastClickedAt).toLocaleString()}</time></div>; })}</div>}</section>;
}

function MediaUpload({ onUploaded, multiple = false, disabled = false, kind = "image" }: { onUploaded: (urls: string[]) => void; multiple?: boolean; disabled?: boolean; kind?: "image" | "video" }) {
  const [message, setMessage] = useState("");
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, multiple ? 8 : 1);
    event.target.value = "";
    if (!files.length) return;
    const isVideo = kind === "video";
    const allowed = isVideo ? new Set(["video/mp4"]) : new Set(["image/jpeg", "image/png", "image/webp"]);
    const maximum = isVideo ? 50 * 1024 * 1024 : 8 * 1024 * 1024;
    const typedFiles = await Promise.all(files.map(async (file) => ({ file, contentType: mediaTypeFromSignature(new Uint8Array(await file.slice(0, 12).arrayBuffer())) })));
    if (typedFiles.some(({ file, contentType }) => !contentType || !allowed.has(contentType) || file.size < 1 || file.size > maximum)) { setMessage(isVideo ? "Use an MP4 video under 50 MB." : "Use a JPEG, PNG, or WebP image under 8 MB. Rename-only file conversions are not supported."); return; }
    setMessage(`Uploading ${files.length} ${isVideo ? "video" : "image"}${files.length === 1 ? "" : "s"}…`);
    const urls: string[] = [];
    try {
      for (const { file, contentType } of typedFiles) {
        const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
        const contentHash = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
        const response = await fetch("/api/media", { method: "POST", headers: { "content-type": contentType!, "x-sew-lovely-file-name": encodeURIComponent(file.name), "x-sew-lovely-file-size": String(file.size), "x-sew-lovely-content-sha256": contentHash }, body: file });
        const payload = await response.json() as { url?: string; message?: string };
        if (!response.ok || !payload.url) throw new Error(payload.message ?? "Upload failed.");
        urls.push(payload.url);
      }
      onUploaded(urls);
      setMessage(`${urls.length} ${isVideo ? "video" : "image"}${urls.length === 1 ? "" : "s"} uploaded to R2.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    }
  }
  return <div className="media-upload"><input type="file" accept={kind === "video" ? "video/mp4" : "image/jpeg,image/png,image/webp"} multiple={multiple} disabled={disabled} onChange={(event) => void upload(event)} /><p className="field-note">Files stream directly to R2, are cached for one year, and are not stored in the editor or database.</p>{message && <p className="field-note" role="status">{message}</p>}</div>;
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
	  <button type="button" onClick={() => onChange({ ...site, navigation: [...items, { label: "New category", type: "category", value: "New category", destination: "/collections/new-arrivals", image: site.homeCategories[0]?.image }] })}>Add navigation item</button>
      <button className="save" type="submit">Save navigation</button>
    </form>
  );
}
