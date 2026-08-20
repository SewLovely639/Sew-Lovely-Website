"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type HeroSlide = { id: string; eyebrow: string; title: string; emphasis: string; description: string; image: string; imageAlt: string; cta: string };
export function HeroSlideshow({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0); const [paused, setPaused] = useState(false); const current = slides[active] ?? slides[0];
  const next = () => setActive((index) => (index + 1) % slides.length); const previous = () => setActive((index) => (index - 1 + slides.length) % slides.length);
  useEffect(() => { if (paused || slides.length < 2) return; const timer = window.setInterval(next, 6500); return () => window.clearInterval(timer); }, [paused, slides.length, active]);
  if (!current) return null;
  return <section className="sl-hero" aria-label="Sew Lovely highlights" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)}>
    {slides.map((slide, index) => <div key={slide.id} className={`sl-hero-slide ${index === active ? "is-active" : ""}`} style={{ backgroundImage: `url(${slide.image})` }} aria-hidden={index !== active} />)}
    <div className="sl-hero-overlay" /><div className="wrap sl-hero-content"><div className="sl-hero-copy" key={current.id}><p className="eyebrow pink">{current.eyebrow}</p><h1>{current.title}<br /><span>{current.emphasis}</span></h1><p>{current.description}</p><Link className="button primary" href="#shop">{current.cta} <span>→</span></Link></div></div>
    <div className="sl-hero-controls"><button type="button" onClick={previous} aria-label="Previous hero slide"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 5-7 7 7 7" /></svg></button><div className="sl-hero-dots">{slides.map((slide, index) => <button key={slide.id} type="button" onClick={() => setActive(index)} aria-label={`Go to hero slide ${index + 1}`} aria-current={index === active} className={index === active ? "is-active" : ""}><span /></button>)}</div><button type="button" onClick={next} aria-label="Next hero slide"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9.5 5 7 7-7 7" /></svg></button></div>
    <div className="sl-hero-caption"><span>0{active + 1}</span><span className="rule" /><span>{current.imageAlt}</span></div>
  </section>;
}
