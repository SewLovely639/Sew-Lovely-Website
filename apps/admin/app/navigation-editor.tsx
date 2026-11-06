"use client";

import { ChangeEvent, FormEvent, useState } from "react";

type CategoryGroup = { label: string; categories: string[] };
type MenuLink = { label: string; destination: string };
type Nav = { label: string; type: "category" | "group" | "brand" | "anchor"; value: string; values: string[]; categories: string[]; image?: string; destination: string; menu: { shop: MenuLink[]; discover: MenuLink[]; services: MenuLink[] } };
type PosterCard = { name: string; description: string; image: string; destination: string; price?: number };
type Site = { navigation: Nav[]; homeCategories: PosterCard[] };
const collectionDestination = (value: string) => `/collections/${encodeURIComponent(value.trim().toLowerCase().replace(/\s+/g, "-"))}`;
const emptyMenu = () => ({ shop: [] as MenuLink[], discover: [] as MenuLink[], services: [] as MenuLink[] });

export function NavigationEditor({ site, categories, categoryGroups, onChange, onSave }: { site: Site; categories: string[]; categoryGroups: CategoryGroup[]; onChange: (site: Site) => void; onSave: (event: FormEvent, site?: Site) => Promise<void> }) {
  const [message, setMessage] = useState("");
  const update = (index: number, patch: Partial<Nav>) => onChange({ ...site, navigation: site.navigation.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) });
  const updateMenu = (index: number, column: keyof Nav["menu"], links: MenuLink[]) => update(index, { menu: { ...(site.navigation[index].menu ?? emptyMenu()), [column]: links } });
  const addLink = (index: number, column: keyof Nav["menu"]) => updateMenu(index, column, [...(site.navigation[index].menu?.[column] ?? []), { label: "New link", destination: "/" }]);
  const updateLink = (index: number, column: keyof Nav["menu"], linkIndex: number, patch: Partial<MenuLink>) => updateMenu(index, column, (site.navigation[index].menu?.[column] ?? []).map((link, itemIndex) => itemIndex === linkIndex ? { ...link, ...patch } : link));
  const removeLink = (index: number, column: keyof Nav["menu"], linkIndex: number) => updateMenu(index, column, (site.navigation[index].menu?.[column] ?? []).filter((_, itemIndex) => itemIndex !== linkIndex));
  const toggleCategory = (index: number, category: string) => {
    const item = site.navigation[index];
    update(index, { categories: item.categories.includes(category) ? item.categories.filter((entry) => entry !== category) : [...item.categories, category] });
  };
  const selectedValues = (item: Nav) => item.values?.length ? item.values : item.value ? [item.value] : [];
  const groupedCategories = (labels: string[]) => [...new Set(labels.flatMap((label) => categoryGroups.find((group) => group.label === label)?.categories ?? []))];
  const changeType = (index: number, type: Nav["type"]) => {
    const item = site.navigation[index];
    const seed = type === "category"
      ? (categories.includes(item.value) ? item.value : categories[0] ?? "")
      : type === "group" ? (categoryGroups.some((group) => group.label === item.value) ? item.value : categoryGroups[0]?.label ?? "") : "";
    update(index, {
      type,
      value: type === "category" || type === "group" ? seed : item.value,
      values: seed ? [seed] : [],
      categories: [],
      destination: seed ? collectionDestination(seed) : item.destination,
    });
  };
  const toggleValue = (index: number, value: string) => {
    const item = site.navigation[index];
    const selected = selectedValues(item);
    if (selected.length === 1 && selected[0] === value) return;
    const values = selected.includes(value) ? selected.filter((entry) => entry !== value) : [...selected, value];
    const primary = values[0] ?? item.value;
    update(index, {
      values,
      value: primary,
      categories: item.type === "group" ? groupedCategories(values) : values.length > 1 ? values : [],
      destination: primary ? collectionDestination(primary) : item.destination,
    });
  };
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= site.navigation.length) return;
    const navigation = [...site.navigation];
    [navigation[index], navigation[target]] = [navigation[target], navigation[index]];
    onChange({ ...site, navigation });
  };
  const addItem = () => onChange({ ...site, navigation: [...site.navigation, { label: "New category", type: "category", value: categories[0] ?? "", values: categories[0] ? [categories[0]] : [], categories: [], destination: categories[0] ? collectionDestination(categories[0]) : "/", image: site.homeCategories[0]?.image, menu: emptyMenu() }] });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!site.navigation.length) { setMessage("Add at least one navigation item before saving."); return; }
    const navigation = site.navigation.map((item) => ({ ...item, image: item.image?.trim() ? item.image.trim() : undefined }));
    void onSave(event, { ...site, navigation });
  };

  return <form className="panel site-panel" onSubmit={submit}>
    <div className="panel-heading"><p>STORE NAVIGATION</p><h2>Navbar options &amp; their categories</h2></div>
    <p className="muted">Each item below becomes a navbar option. Choose the categories that should appear when a customer opens it. Clicking a category with subcategories drills one level deeper, exactly like the storefront.</p>
    {message && <p className="field-note" role="status">{message}</p>}
    {site.navigation.map((item, index) => {
      const menu = item.menu ?? emptyMenu();
      const group = categoryGroups.find((entry) => entry.label === item.value);
      return <fieldset key={`${item.label}-${index}`}>
        <legend>Navbar option {index + 1}</legend>
        <div className="category-editor">
          <div className="category-preview">{item.image && <img src={item.image} alt="" />}</div>
          <div className="editor-fields">
            <div className="two">
              <label>Navigation label<input value={item.label} maxLength={30} onChange={(event) => update(index, { label: event.target.value })} required /></label>
              <label>Type<select value={item.type} onChange={(event) => changeType(index, event.target.value as Nav["type"])}><option value="category">Categories</option><option value="group">Navbar groups</option><option value="brand">Brand</option><option value="anchor">Homepage section</option></select></label>
            </div>
            {item.type === "category" && <fieldset>
              <legend>Product categories</legend>
              <p className="field-note">Select one or more categories. The first selection becomes the landing page; every selected category appears in this menu.</p>
              <div className="choice-chips">{categories.map((category) => <button type="button" key={category} className={selectedValues(item).includes(category) ? "selected" : ""} aria-pressed={selectedValues(item).includes(category)} onClick={() => toggleValue(index, category)}>{category}</button>)}</div>
            </fieldset>}
            {item.type === "group" && <fieldset>
              <legend>Navbar groups</legend>
              <p className="field-note">Select one or more navbar groups. Categories from every selected group appear in this menu.</p>
              <div className="choice-chips">{categoryGroups.map((entry) => <button type="button" key={entry.label} className={selectedValues(item).includes(entry.label) ? "selected" : ""} aria-pressed={selectedValues(item).includes(entry.label)} onClick={() => toggleValue(index, entry.label)}>{entry.label}</button>)}</div>
              <p className="field-note">{group ? `Group contains: ${group.categories.join(", ") || "no categories"}` : "Create groups in the Navbar groups panel below."}</p>
            </fieldset>}
            {(item.type === "brand" || item.type === "anchor") && <label>Section or brand key<input value={item.value} onChange={(event) => update(index, { value: event.target.value })} placeholder="e.g. services" required /></label>}
            <label>Opens<input value={item.destination ?? ""} onChange={(event) => update(index, { destination: event.target.value })} placeholder="/collections/example or /#services" /><span className="field-note">Use an internal path beginning with /, or an HTTPS URL.</span></label>
            <label>Featured image URL<input type="url" value={item.image ?? ""} onChange={(event) => update(index, { image: event.target.value })} placeholder="HTTPS image URL" /></label>
            <ImageUpload onUploaded={(image) => { update(index, { image }); setMessage("Navigation image uploaded. Save navigation to publish."); }} onError={setMessage} />
          </div>
        </div>
        <fieldset>
          <legend>Categories shown under “{item.label || "this option"}”</legend>
          <p className="field-note">Leave every category unticked to automatically list the selected categories or their subcategories. Tick categories only when you want to override exactly what appears.</p>
          <div className="choice-chips">{categories.map((category) => <button type="button" key={category} className={item.categories.includes(category) ? "selected" : ""} aria-pressed={item.categories.includes(category)} onClick={() => toggleCategory(index, category)}>{category}</button>)}</div>
        </fieldset>
        <details>
          <summary>Optional extra links (Shop, Discover, Services)</summary>
          <div className="two"><MenuLinks title="Shop" column="shop" links={menu.shop} onAdd={() => addLink(index, "shop")} onUpdate={(linkIndex, patch) => updateLink(index, "shop", linkIndex, patch)} onRemove={(linkIndex) => removeLink(index, "shop", linkIndex)} /><MenuLinks title="Discover" column="discover" links={menu.discover} onAdd={() => addLink(index, "discover")} onUpdate={(linkIndex, patch) => updateLink(index, "discover", linkIndex, patch)} onRemove={(linkIndex) => removeLink(index, "discover", linkIndex)} /></div>
          <MenuLinks title="Services" column="services" links={menu.services} onAdd={() => addLink(index, "services")} onUpdate={(linkIndex, patch) => updateLink(index, "services", linkIndex, patch)} onRemove={(linkIndex) => removeLink(index, "services", linkIndex)} />
        </details>
        <div className="form-buttons">
          <button type="button" disabled={index === 0} onClick={() => move(index, -1)}>Move up</button>
          <button type="button" disabled={index === site.navigation.length - 1} onClick={() => move(index, 1)}>Move down</button>
          <button type="button" className="danger" onClick={() => onChange({ ...site, navigation: site.navigation.filter((_, itemIndex) => itemIndex !== index) })}>Remove navigation item</button>
        </div>
      </fieldset>;
    })}
    <div className="form-buttons"><button type="button" disabled={site.navigation.length >= 10} onClick={addItem}>Add navigation item</button><button className="save" type="submit">Save navigation</button></div>
  </form>;
}

function MenuLinks({ title, links, onAdd, onUpdate, onRemove }: { title: string; column: string; links: MenuLink[]; onAdd: () => void; onUpdate: (index: number, patch: Partial<MenuLink>) => void; onRemove: (index: number) => void }) {
  return <fieldset><legend>{title} links</legend><p className="field-note">Optional links shown alongside the category tree.</p>{links.map((link, index) => <div className="inline-row" key={`${title}-${index}`}><input aria-label={`${title} link label`} value={link.label} onChange={(event) => onUpdate(index, { label: event.target.value })} /><input aria-label={`${title} link destination`} value={link.destination} onChange={(event) => onUpdate(index, { destination: event.target.value })} placeholder="/collections/example" /><button type="button" className="danger" onClick={() => onRemove(index)}>Remove</button></div>)}<button type="button" onClick={onAdd}>Add {title.toLowerCase()} link</button></fieldset>;
}

function ImageUpload({ onUploaded, onError }: { onUploaded: (url: string) => void; onError: (message: string) => void }) {
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
    const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!allowed.has(file.type) || file.size < 1 || file.size > 8 * 1024 * 1024) { onError("Use a JPEG, PNG, or WebP image under 8 MB."); return; }
    try { const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer()); const contentHash = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join(""); const response = await fetch("/api/media", { method: "POST", headers: { "content-type": file.type, "x-sew-lovely-file-name": encodeURIComponent(file.name), "x-sew-lovely-file-size": String(file.size), "x-sew-lovely-content-sha256": contentHash }, body: file }); const payload = await response.json() as { url?: string; message?: string }; if (!response.ok || !payload.url) throw new Error(payload.message ?? "Upload failed."); onUploaded(payload.url); } catch (error) { onError(error instanceof Error ? error.message : "Upload failed."); }
  }
  return <label>Upload featured image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void upload(event)} /><span className="field-note">Images stream directly to R2 and are cached for one year.</span></label>;
}
