"use client";
import { ChangeEvent, useState } from "react";
type HeroSlide = { id: string; eyebrow: string; title: string; emphasis: string; description: string; image: string; imageAlt: string; cta: string };
export function HeroEditor({ slides, onChange, onSave }: { slides: HeroSlide[]; onChange: (slides: HeroSlide[]) => void; onSave: () => void }) {
  const [message, setMessage] = useState("");
  const update = (index: number, key: keyof HeroSlide, value: string) => onChange(slides.map((slide, item) => item === index ? { ...slide, [key]: value } : slide));
  const add = () => onChange([...slides, { id: `hero-${Date.now()}`, eyebrow: "New chapter", title: "Wear your", emphasis: "story.", description: "A new Sew Lovely moment.", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=85", imageAlt: "Editorial fashion detail", cta: "Explore the edit" }]);
  const upload = async (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!allowed.has(file.type) || file.size < 1 || file.size > 8 * 1024 * 1024) { setMessage("Use a JPEG, PNG, or WebP image under 8 MB."); return; }
    try {
      setMessage("Uploading hero image to R2…");
      const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
      const contentHash = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
      const response = await fetch("/api/media", { method: "POST", headers: { "content-type": file.type, "x-sew-lovely-file-name": encodeURIComponent(file.name), "x-sew-lovely-file-size": String(file.size), "x-sew-lovely-content-sha256": contentHash }, body: file });
      const payload = await response.json() as { url?: string; message?: string };
      if (!response.ok || !payload.url) throw new Error(payload.message ?? "Upload failed.");
      update(index, "image", payload.url);
      setMessage("Hero image uploaded to R2. Publish the slideshow when ready.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    }
  };
  return <section className="panel hero-editor"><div className="panel-heading"><p>EDITORIAL HERO</p><h2>Hero slideshow</h2></div><p className="muted">Edit the poster copy and choose the image for each slide. Images stream to R2 and are published with the slideshow.</p>{message && <p className="field-note" role="status">{message}</p>}{slides.map((slide, index) => <fieldset className="hero-slide-editor" key={slide.id}><legend>Slide {index + 1}</legend><div className="hero-editor-preview" style={{ backgroundImage: `url(${slide.image})` }}><span>Preview</span></div><div className="form-grid"><label>Eyebrow<input value={slide.eyebrow} onChange={(event) => update(index, "eyebrow", event.target.value)} /></label><label>CTA label<input value={slide.cta} onChange={(event) => update(index, "cta", event.target.value)} /></label><label>Headline<input value={slide.title} onChange={(event) => update(index, "title", event.target.value)} /></label><label>Emphasis<input value={slide.emphasis} onChange={(event) => update(index, "emphasis", event.target.value)} /></label><label className="full">Description<textarea value={slide.description} onChange={(event) => update(index, "description", event.target.value)} /></label><label>Image URL<input value={slide.image} onChange={(event) => update(index, "image", event.target.value)} /></label><label>Image alt text<input value={slide.imageAlt} onChange={(event) => update(index, "imageAlt", event.target.value)} /></label><label className="full">Choose image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void upload(index, event)} /></label></div><button type="button" className="danger" onClick={() => onChange(slides.filter((_, item) => item !== index))}>Remove slide</button></fieldset>)}<div className="hero-editor-actions"><button type="button" onClick={add}>Add slide</button><button className="save" type="button" onClick={onSave}>Publish hero</button></div></section>;
}
