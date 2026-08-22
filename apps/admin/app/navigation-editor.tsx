"use client";

import { ChangeEvent, FormEvent, useState } from "react";

type Nav = { label: string; type: "category" | "brand" | "anchor"; value: string; image?: string; destination: string };
type PosterCard = { name: string; description: string; image: string; destination: string; price?: number };
type Site = { navigation: Nav[]; homeCategories: PosterCard[] };

export function NavigationEditor({ site, onChange, onSave }: { site: Site; onChange: (site: Site) => void; onSave: (event: FormEvent) => Promise<void> }) {
  const [message, setMessage] = useState("");
  const update = (index: number, patch: Partial<Nav>) => onChange({ ...site, navigation: site.navigation.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) });
  return <form className="panel site-panel" onSubmit={(event) => void onSave(event)}>
    <div className="panel-heading"><p>STORE NAVIGATION</p><h2>Categories, imagery and destinations</h2></div>
    <p className="muted">Each category becomes a controlled product classification. Give it a name, key, image and destination, then select the same category from the product editor.</p>
    {message && <p className="field-note" role="status">{message}</p>}
    {site.navigation.map((item, index) => <fieldset key={`${item.label}-${index}`}>
      <legend>Navigation item {index + 1}</legend>
      <div className="category-editor">
        <div className="category-preview">{item.image && <img src={item.image} alt="" />}</div>
        <div className="editor-fields">
          <div className="two">
            <label>Navigation label<input value={item.label} onChange={(event) => update(index, { label: event.target.value })} required /></label>
            <label>Type<select value={item.type} onChange={(event) => update(index, { type: event.target.value as Nav["type"] })}><option value="category">Product category</option><option value="brand">Brand</option><option value="anchor">Homepage section</option></select></label>
          </div>
          <label>{item.type === "category" ? "Product category key" : "Section or brand key"}<input value={item.value} onChange={(event) => update(index, { value: event.target.value })} placeholder={item.type === "category" ? "e.g. Kurtas" : "e.g. services"} required /><span className="field-note">For product categories, this exact key is available in the product editor.</span></label>
          <label>Opens<input value={item.destination ?? ""} onChange={(event) => update(index, { destination: event.target.value })} placeholder={item.type === "category" ? "/collections/kurtas" : "/#services or https://..."} /><span className="field-note">Use an internal path beginning with /, or an HTTPS URL.</span></label>
          <label>Category image URL<input type="url" value={item.image ?? ""} onChange={(event) => update(index, { image: event.target.value })} placeholder="HTTPS image URL" /></label>
          <ImageUpload onUploaded={(image) => { update(index, { image }); setMessage("Category image uploaded to R2. Save navigation to publish."); }} onError={setMessage} />
        </div>
      </div>
      <button type="button" onClick={() => onChange({ ...site, navigation: site.navigation.filter((_, itemIndex) => itemIndex !== index) })}>Remove navigation item</button>
    </fieldset>)}
    <div className="form-buttons"><button type="button" onClick={() => onChange({ ...site, navigation: [...site.navigation, { label: "New category", type: "category", value: "New category", destination: "/collections/new-arrivals", image: site.homeCategories[0]?.image }] })}>Add category</button><button className="save" type="submit">Save navigation</button></div>
  </form>;
}

function ImageUpload({ onUploaded, onError }: { onUploaded: (url: string) => void; onError: (message: string) => void }) {
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!allowed.has(file.type) || file.size < 1 || file.size > 8 * 1024 * 1024) { onError("Use a JPEG, PNG, or WebP image under 8 MB."); return; }
    try {
      const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
      const contentHash = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
      const response = await fetch("/api/media", { method: "POST", headers: { "content-type": file.type, "x-sew-lovely-file-name": encodeURIComponent(file.name), "x-sew-lovely-file-size": String(file.size), "x-sew-lovely-content-sha256": contentHash }, body: file });
      const payload = await response.json() as { url?: string; message?: string };
      if (!response.ok || !payload.url) throw new Error(payload.message ?? "Upload failed.");
      onUploaded(payload.url);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Upload failed.");
    }
  }
  return <label>Upload category image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void upload(event)} /><span className="field-note">Images stream directly to R2 and are cached for one year.</span></label>;
}
