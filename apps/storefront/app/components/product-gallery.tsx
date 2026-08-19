"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({ name, images }: { name: string; images: string[] }) {
  const [active, setActive] = useState(0);
  const image = images[active] ?? images[0];
  return <div className="product-gallery"><div className="product-gallery-main"><Image src={image} alt={`${name} view ${active + 1}`} fill unoptimized sizes="(max-width: 900px) 100vw, 55vw" /></div><div className="product-gallery-thumbs" aria-label={`${name} image views`}>{images.map((item, index) => <button type="button" key={`${item}-${index}`} className={index === active ? "is-active" : ""} onClick={() => setActive(index)} aria-label={`View ${index + 1}`}><Image src={item} alt="" fill unoptimized sizes="90px" /></button>)}</div></div>;
}
